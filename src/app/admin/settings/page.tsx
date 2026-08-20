'use client';

// =============================================
// Admin Settings Page
// =============================================

import { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Spinner';
import { useToast } from '@/hooks/useToast';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    cutoff_time: '07:00',
    reminder_time: '06:15',
    final_reminder_time: '06:45',
    timezone: 'Asia/Kolkata',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const json = await res.json();
        if (json.success && json.data) {
          setSettings({
            cutoff_time: String(json.data.cutoff_time || '07:00').replace(/"/g, ''),
            reminder_time: String(json.data.reminder_time || '06:15').replace(/"/g, ''),
            final_reminder_time: String(json.data.final_reminder_time || '06:45').replace(/"/g, ''),
            timezone: String(json.data.timezone || 'Asia/Kolkata').replace(/"/g, ''),
          });
        }
      } catch {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader message="Loading settings..." />;

  return (
    <div id="admin-settings">
      <h1 className="mb-6">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Configuration</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col gap-5" style={{ maxWidth: 400 }}>
            <Input
              label="Attendance Cutoff Time"
              type="time"
              value={settings.cutoff_time}
              onChange={(e) =>
                setSettings({ ...settings, cutoff_time: e.target.value })
              }
              hint="Parents cannot change attendance after this time"
              id="cutoff-time-input"
            />

            <Input
              label="Reminder Time"
              type="time"
              value={settings.reminder_time}
              onChange={(e) =>
                setSettings({ ...settings, reminder_time: e.target.value })
              }
              hint="First reminder sent to parents who haven't responded"
              id="reminder-time-input"
            />

            <Input
              label="Final Reminder Time"
              type="time"
              value={settings.final_reminder_time}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  final_reminder_time: e.target.value,
                })
              }
              hint="Urgent reminder before cutoff"
              id="final-reminder-time-input"
            />

            <Input
              label="Timezone"
              value={settings.timezone}
              onChange={(e) =>
                setSettings({ ...settings, timezone: e.target.value })
              }
              placeholder="e.g. Asia/Kolkata"
              id="timezone-input"
            />

            <Button
              variant="primary"
              onClick={handleSave}
              loading={saving}
              id="save-settings-btn"
            >
              Save Settings
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
