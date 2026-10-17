import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/atoms/Button';
import { FormField } from '../../components/molecules/FormField';
import { Settings, Save, CheckCircle, AlertTriangle } from 'lucide-react';

export const SettingsPage = () => {
  const [settings, setSettings] = useState({
    countdown_target_date: '2026-11-15T00:00:00+05:30',
    order_desk_whatsapp: '919840000000',
    support_phone: '+91 44 2498 0000',
    support_email: 'orders@srisankaratv.com'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await adminService.getSettings();
      if (res.success && res.data) {
        const map = { ...settings };
        res.data.forEach((s) => {
          map[s.key] = s.value;
        });
        setSettings(map);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (key) => {
    setSaving(true);
    setMessage('');
    try {
      const res = await adminService.updateSetting(key, { value: settings[key] });
      if (res.success) {
        setMessage(`Setting "${key}" updated successfully.`);
      }
    } catch (err) {
      alert('Error updating setting: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--head)', fontSize: '1.8rem', margin: 0 }}>
          Platform Settings
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 4 }}>
          Configure countdown dates, communication channels, and gateway parameters.
        </p>
      </div>

      {message && (
        <div style={{ padding: 12, background: '#DCFCE7', color: '#166534', borderRadius: 4, marginBottom: 20 }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: 24 }}>
        <div className="admin-card">
          <h3>Event & Storefront Configuration</h3>
          <div style={{ display: 'grid', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                Yaagam Countdown Target Date & Time (IST)
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={settings.countdown_target_date}
                  onChange={(e) => setSettings({ ...settings, countdown_target_date: e.target.value })}
                  className="filter-input"
                  style={{ flex: 1 }}
                />
                <Button onClick={() => handleSave('countdown_target_date')} loading={saving}>
                  Save
                </Button>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Default: 2026-11-15T00:00:00+05:30 (Thiruttani Final Yaagam)
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                WhatsApp Order Desk Number
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="e.g. 919840000000"
                  value={settings.order_desk_whatsapp}
                  onChange={(e) => setSettings({ ...settings, order_desk_whatsapp: e.target.value })}
                  className="filter-input"
                  style={{ flex: 1 }}
                />
                <Button onClick={() => handleSave('order_desk_whatsapp')} loading={saving}>
                  Save
                </Button>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Format: country code + 10 digits without '+' or spaces.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                Support Helpline Phone
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={settings.support_phone}
                  onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                  className="filter-input"
                  style={{ flex: 1 }}
                />
                <Button onClick={() => handleSave('support_phone')} loading={saving}>
                  Save
                </Button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                Support Email Address
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="email"
                  value={settings.support_email}
                  onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                  className="filter-input"
                  style={{ flex: 1 }}
                />
                <Button onClick={() => handleSave('support_email')} loading={saving}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Status Panel */}
        <div>
          <div className="admin-card">
            <h3>External Integrations</h3>
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ padding: 12, border: '1px solid #e2e8f0', borderRadius: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={18} color="#16A34A" />
                  <strong>Razorpay Payment Gateway</strong>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0' }}>
                  HMAC-SHA256 signature verification active. Supports UPI, Netbanking, Debit/Credit Cards.
                </p>
              </div>

              <div style={{ padding: 12, border: '1px solid #e2e8f0', borderRadius: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={18} color="#16A34A" />
                  <strong>Brevo Transactional Email</strong>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0' }}>
                  Automated receipts and order notifications enabled with idempotency safeguards.
                </p>
              </div>

              <div style={{ padding: 12, border: '1px solid #e2e8f0', borderRadius: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={18} color="#16A34A" />
                  <strong>MongoDB Database</strong>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0' }}>
                  Orders, Payments, Products, Customers, and Audit logs persisted with strict indexes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
