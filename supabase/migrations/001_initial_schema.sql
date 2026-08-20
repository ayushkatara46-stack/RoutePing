-- =============================================
-- School Bus Attendance & Route Notification
-- Database Schema — Supabase / PostgreSQL
-- =============================================

-- 1. ENUMS
-- =============================================

CREATE TYPE user_role AS ENUM ('parent', 'driver', 'admin');
CREATE TYPE attendance_status AS ENUM ('pending', 'coming', 'not_coming', 'no_response');
CREATE TYPE pickup_status AS ENUM ('waiting', 'picked_up', 'skipped');
CREATE TYPE notification_type AS ENUM ('reminder', 'final_reminder', 'confirmation', 'route_update', 'system');

-- 2. PROFILES (extends auth.users)
-- =============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'parent',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- 3. ROUTES
-- =============================================

CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. BUSES
-- =============================================

CREATE TABLE buses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_number TEXT NOT NULL UNIQUE,
  registration_number TEXT,
  capacity INTEGER NOT NULL DEFAULT 40,
  driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_buses_driver ON buses(driver_id);
CREATE INDEX idx_buses_route ON buses(route_id);

-- 5. STOPS
-- =============================================

CREATE TABLE stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  stop_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  expected_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(route_id, stop_number)
);

CREATE INDEX idx_stops_route ON stops(route_id, stop_number);

-- 6. STUDENTS
-- =============================================

CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  section TEXT,
  parent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  bus_id UUID REFERENCES buses(id) ON DELETE SET NULL,
  route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
  stop_id UUID REFERENCES stops(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_students_parent ON students(parent_id);
CREATE INDEX idx_students_bus ON students(bus_id);
CREATE INDEX idx_students_route ON students(route_id);
CREATE INDEX idx_students_stop ON students(stop_id);

-- 7. ATTENDANCE
-- =============================================

CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status attendance_status NOT NULL DEFAULT 'pending',
  pickup_status pickup_status NOT NULL DEFAULT 'waiting',
  marked_at TIMESTAMPTZ,
  marked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, date)
);

CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_status ON attendance(date, status);

-- 8. NOTIFICATIONS
-- =============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);

-- 9. PUSH SUBSCRIPTIONS
-- =============================================

CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);

-- 10. AUDIT LOGS
-- =============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);

-- 11. SYSTEM SETTINGS
-- =============================================

CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Default settings
INSERT INTO system_settings (key, value) VALUES
  ('cutoff_time', '"07:00"'),
  ('reminder_time', '"06:15"'),
  ('final_reminder_time', '"06:45"'),
  ('timezone', '"Asia/Kolkata"');

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_buses_updated_at
  BEFORE UPDATE ON buses FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_routes_updated_at
  BEFORE UPDATE ON routes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_stops_updated_at
  BEFORE UPDATE ON stops FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_attendance_updated_at
  BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'parent')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT USING (get_user_role() = 'admin');
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admins can manage all profiles"
  ON profiles FOR ALL USING (get_user_role() = 'admin');

-- STUDENTS policies
CREATE POLICY "Parents can view their students"
  ON students FOR SELECT USING (parent_id = auth.uid());
CREATE POLICY "Drivers can view students on their route"
  ON students FOR SELECT USING (
    route_id IN (
      SELECT route_id FROM buses WHERE driver_id = auth.uid()
    )
  );
CREATE POLICY "Admins can manage all students"
  ON students FOR ALL USING (get_user_role() = 'admin');

-- BUSES policies
CREATE POLICY "Anyone authenticated can view buses"
  ON buses FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage buses"
  ON buses FOR ALL USING (get_user_role() = 'admin');

-- ROUTES policies
CREATE POLICY "Anyone authenticated can view routes"
  ON routes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage routes"
  ON routes FOR ALL USING (get_user_role() = 'admin');

-- STOPS policies
CREATE POLICY "Anyone authenticated can view stops"
  ON stops FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage stops"
  ON stops FOR ALL USING (get_user_role() = 'admin');

-- ATTENDANCE policies
CREATE POLICY "Parents can view their students attendance"
  ON attendance FOR SELECT USING (
    student_id IN (SELECT id FROM students WHERE parent_id = auth.uid())
  );
CREATE POLICY "Parents can update their students attendance"
  ON attendance FOR UPDATE USING (
    student_id IN (SELECT id FROM students WHERE parent_id = auth.uid())
    AND locked = false
  );
CREATE POLICY "Parents can insert attendance"
  ON attendance FOR INSERT WITH CHECK (
    student_id IN (SELECT id FROM students WHERE parent_id = auth.uid())
  );
CREATE POLICY "Drivers can view route attendance"
  ON attendance FOR SELECT USING (
    student_id IN (
      SELECT s.id FROM students s
      JOIN buses b ON s.bus_id = b.id
      WHERE b.driver_id = auth.uid()
    )
  );
CREATE POLICY "Drivers can update pickup status"
  ON attendance FOR UPDATE USING (
    student_id IN (
      SELECT s.id FROM students s
      JOIN buses b ON s.bus_id = b.id
      WHERE b.driver_id = auth.uid()
    )
  );
CREATE POLICY "Admins can manage all attendance"
  ON attendance FOR ALL USING (get_user_role() = 'admin');

-- NOTIFICATIONS policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT WITH CHECK (true);

-- PUSH SUBSCRIPTIONS policies
CREATE POLICY "Users can manage own subscriptions"
  ON push_subscriptions FOR ALL USING (user_id = auth.uid());

-- AUDIT LOGS policies
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT USING (get_user_role() = 'admin');
CREATE POLICY "Anyone can insert audit logs"
  ON audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- SYSTEM SETTINGS policies
CREATE POLICY "Anyone authenticated can view settings"
  ON system_settings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage settings"
  ON system_settings FOR ALL USING (get_user_role() = 'admin');

-- =============================================
-- ENABLE REALTIME for attendance table
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
