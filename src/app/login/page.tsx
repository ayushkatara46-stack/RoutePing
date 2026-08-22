'use client';

// =============================================
// RoutePing Login Page
// Featuring Animated School Bus driving Left-to-Right
// with Artisan Honey & Espresso Liquid Glass Styling
// =============================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import AnimatedSchoolBus from '@/components/animations/AnimatedSchoolBus';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleQuickFill = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('An unexpected error occurred. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Decorative Ambient Honey Glow Orbs */}
      <div className="login-bg-glow login-bg-glow-1" />
      <div className="login-bg-glow login-bg-glow-2" />

      <div className="login-container relative z-10">
        <div className="login-card liquid-glass-card shadow-2xl">
          {/* Header Brand */}
          <div className="login-header">
            <div className="login-logo-badge">
              <span className="text-3xl">🚌</span>
            </div>
            <h1 className="login-title">ROUTEPING</h1>
            <p className="login-subtitle">
              Real-Time School Bus Transit &amp; Attendance
            </p>
          </div>

          {/* Quick Demo Fill Pills */}
          <div className="mb-5">
            <div className="text-[11px] font-bold text-secondary text-center uppercase tracking-wider mb-2">
              ⚡ 1-Click Demo Logins
            </div>
            <div className="grid grid-3 gap-2">
              <button
                type="button"
                className="demo-login-pill"
                onClick={() => handleQuickFill('admin@bustrack.test', 'Admin@123')}
                title="Fill Admin Credentials"
              >
                👑 Admin
              </button>
              <button
                type="button"
                className="demo-login-pill"
                onClick={() => handleQuickFill('parent@bustrack.test', 'Parent@123')}
                title="Fill Parent Credentials"
              >
                👨‍👩‍👦 Parent
              </button>
              <button
                type="button"
                className="demo-login-pill"
                onClick={() => handleQuickFill('driver@bustrack.test', 'Driver@123')}
                title="Fill Driver Credentials"
              >
                🚌 Driver
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form" id="login-form">
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@bustrack.test"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              id="login-email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              id="login-password"
            />

            {error && (
              <div className="login-error" role="alert">
                <span>⚠️</span> {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2 font-bold shadow-honey"
              id="login-submit"
            >
              Sign In to RoutePing
            </Button>
          </form>

          <div className="login-footer">
            <p className="text-xs text-secondary text-center">
              Protected by Enterprise School Security &bull; GPS Realtime
            </p>
          </div>
        </div>
      </div>

      {/* Animated School Bus Running Left to Right on Road Track */}
      <AnimatedSchoolBus />
    </div>
  );
}
