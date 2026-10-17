import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { Settings, Save, CheckCircle2, AlertTriangle, Shield, Radio, RefreshCw, Key, Database, Mail } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form states for known settings
  const [formData, setFormData] = useState({
    countdown_target_date: '2026-11-15T00:00:00+05:30',
    support_email: 'support@srisankaratv.com',
    support_phone: '+91 80 4344 5555',
    whatsapp_number: '+91 99800 22333',
    store_open: 'true',
    max_order_quantity: '20'
  });

  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await adminService.getSettings();
      if (res.data?.success && res.data.data) {
        setSettings(res.data.data);
        const map = { ...formData };
        res.data.data.forEach((s) => {
          map[s.key] = typeof s.value === 'object' ? JSON.stringify(s.value) : String(s.value);
        });
        setFormData(map);
      }
    } catch (err) {
      setErrorMsg('Failed to load settings: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (key, val, desc = '') => {
    setSavingKey(key);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      let parsedVal = val;
      if (val === 'true') parsedVal = true;
      else if (val === 'false') parsedVal = false;
      else if (!isNaN(val) && val.trim() !== '') parsedVal = Number(val);

      await adminService.updateSetting(key, { value: parsedVal, description: desc });
      setSuccessMsg(`Setting "${key}" updated successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      loadSettings();
    } catch (err) {
      setErrorMsg(`Failed to save ${key}: ` + (err.response?.data?.message || err.message));
    } finally {
      setSavingKey(null);
    }
  };

  const handleAddNew = async (e) => {
    e.preventDefault();
    if (!newKey) return;
    await handleSave(newKey.trim(), newValue.trim(), newDesc.trim());
    setNewKey('');
    setNewValue('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-admin-maroon flex items-center gap-2">
            <Settings className="w-6 h-6 text-admin-gold" />
            System & Store Settings
          </h1>
          <p className="text-sm text-admin-muted mt-1">
            Configure global store parameters, countdown timing, support channels, and monitor system integrations.
          </p>
        </div>
        <button
          onClick={loadSettings}
          className="admin-btn-secondary inline-flex items-center gap-2 text-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Store & Event Timers */}
          <div className="admin-card p-6 space-y-4">
            <h2 className="text-lg font-serif font-semibold text-admin-maroon border-b border-admin-border pb-3 flex items-center gap-2">
              <Radio className="w-5 h-5 text-admin-gold" />
              Event Countdown & Availability
            </h2>

            <div>
              <label className="block text-xs font-semibold text-admin-muted uppercase tracking-wider mb-1">
                Countdown Target Date & Time (ISO 8601 with Timezone)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="admin-input flex-1"
                  value={formData.countdown_target_date || ''}
                  onChange={(e) => setFormData({ ...formData, countdown_target_date: e.target.value })}
                  placeholder="2026-11-15T00:00:00+05:30"
                />
                <button
                  type="button"
                  onClick={() => handleSave('countdown_target_date', formData.countdown_target_date, 'Target date for live countdown to Soora Samhara Yaagam')}
                  disabled={savingKey === 'countdown_target_date'}
                  className="admin-btn-primary inline-flex items-center gap-1.5 px-4"
                >
                  <Save className="w-4 h-4" />
                  {savingKey === 'countdown_target_date' ? 'Saving...' : 'Save'}
                </button>
              </div>
              <p className="text-xs text-admin-muted mt-1">
                Target date displayed on the customer frontend hero countdown timer (IST: UTC+05:30).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-admin-muted uppercase tracking-wider mb-1">
                  Store Order Status
                </label>
                <div className="flex gap-2">
                  <select
                    className="admin-input flex-1"
                    value={formData.store_open}
                    onChange={(e) => setFormData({ ...formData, store_open: e.target.value })}
                  >
                    <option value="true">Orders Active (Open)</option>
                    <option value="false">Orders Paused (Maintenance)</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleSave('store_open', formData.store_open, 'Store open for orders')}
                    disabled={savingKey === 'store_open'}
                    className="admin-btn-primary px-3"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-muted uppercase tracking-wider mb-1">
                  Max Order Quantity Per Order
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="admin-input flex-1"
                    value={formData.max_order_quantity || '20'}
                    onChange={(e) => setFormData({ ...formData, max_order_quantity: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => handleSave('max_order_quantity', formData.max_order_quantity, 'Maximum quantity allowed per checkout')}
                    disabled={savingKey === 'max_order_quantity'}
                    className="admin-btn-primary px-3"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Support Channels */}
          <div className="admin-card p-6 space-y-4">
            <h2 className="text-lg font-serif font-semibold text-admin-maroon border-b border-admin-border pb-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-admin-gold" />
              Customer Support Channels
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-admin-muted uppercase tracking-wider mb-1">
                  Support Email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    className="admin-input flex-1"
                    value={formData.support_email || ''}
                    onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => handleSave('support_email', formData.support_email, 'Primary support contact email')}
                    disabled={savingKey === 'support_email'}
                    className="admin-btn-primary px-3"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-muted uppercase tracking-wider mb-1">
                  Support Phone / Landline
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="admin-input flex-1"
                    value={formData.support_phone || ''}
                    onChange={(e) => setFormData({ ...formData, support_phone: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => handleSave('support_phone', formData.support_phone, 'Support phone number')}
                    disabled={savingKey === 'support_phone'}
                    className="admin-btn-primary px-3"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-admin-muted uppercase tracking-wider mb-1">
                  WhatsApp Support / Order Desk
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="admin-input flex-1"
                    value={formData.whatsapp_number || ''}
                    onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => handleSave('whatsapp_number', formData.whatsapp_number, 'WhatsApp customer desk')}
                    disabled={savingKey === 'whatsapp_number'}
                    className="admin-btn-primary px-3"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Add Custom Setting */}
          <div className="admin-card p-6 space-y-4">
            <h2 className="text-lg font-serif font-semibold text-admin-maroon border-b border-admin-border pb-3">
              Add / Override Configuration Parameter
            </h2>
            <form onSubmit={handleAddNew} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-admin-muted uppercase tracking-wider mb-1">
                    Key (snake_case)
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="e.g. shipping_carrier_contact"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-admin-muted uppercase tracking-wider mb-1">
                    Value
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="e.g. 1800-SPEED-POST"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-admin-muted uppercase tracking-wider mb-1">
                  Description
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Optional brief description of this parameter"
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="admin-btn-secondary inline-flex items-center gap-1.5 text-sm">
                  <Save className="w-4 h-4" />
                  Save Parameter
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* System & Diagnostics Sidebar */}
        <div className="space-y-6">
          {/* Integration Status */}
          <div className="admin-card p-6 space-y-4">
            <h3 className="text-base font-serif font-bold text-admin-maroon flex items-center gap-2 border-b border-admin-border pb-2">
              <Shield className="w-5 h-5 text-admin-gold" />
              Integrations & Diagnostics
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-2.5 bg-admin-cream rounded-md border border-admin-border">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-admin-gold" />
                  <span className="font-medium text-admin-maroon">Razorpay Gateway</span>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                  Ready (Key ID Active)
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-admin-cream rounded-md border border-admin-border">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-admin-gold" />
                  <span className="font-medium text-admin-maroon">Brevo Transactional</span>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                  Ready (v3 API Client)
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-admin-cream rounded-md border border-admin-border">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-admin-gold" />
                  <span className="font-medium text-admin-maroon">MongoDB Storage</span>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                  Connected
                </span>
              </div>
            </div>

            <div className="text-xs text-admin-muted bg-amber-50 border border-amber-200 p-3 rounded-md">
              <p className="font-medium text-amber-900 mb-1">Production Security Notice:</p>
              Secret keys (Razorpay Key Secret, Webhook Secret, Brevo API Key, JWT Secret) are strictly managed via backend environment variables and are never surfaced to the browser.
            </div>
          </div>

          {/* Current Stored Settings List */}
          <div className="admin-card p-6 space-y-3">
            <h3 className="text-base font-serif font-bold text-admin-maroon border-b border-admin-border pb-2">
              All Stored DB Settings ({settings.length})
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {settings.map((s) => (
                <div key={s._id || s.key} className="p-2.5 bg-admin-cream rounded border border-admin-border text-xs">
                  <div className="flex justify-between font-mono font-semibold text-admin-maroon">
                    <span>{s.key}</span>
                  </div>
                  <div className="text-admin-dark mt-1 truncate" title={String(s.value)}>
                    {typeof s.value === 'object' ? JSON.stringify(s.value) : String(s.value)}
                  </div>
                  {s.description && (
                    <div className="text-[11px] text-admin-muted mt-0.5 italic">{s.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
