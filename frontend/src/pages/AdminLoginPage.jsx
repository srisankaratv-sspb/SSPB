import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { FormField } from '../components/molecules/FormField';
import { Button } from '../components/atoms/Button';
import { ShieldCheck, Lock } from 'lucide-react';

export const AdminLoginPage = () => {
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(900px 420px at 85% 10%, rgba(228, 182, 85, 0.16), transparent 70%), linear-gradient(165deg, var(--hero-2, #4A1220), var(--hero, #2F0A12) 70%)',
        padding: 20
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#ffffff',
          borderRadius: 8,
          padding: '36px 32px',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.4)',
          border: '1px solid var(--gold)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'var(--hero, #2F0A12)',
              color: 'var(--hero-gold, #E4B655)',
              display: 'inline-grid',
              placeItems: 'center',
              marginBottom: 12
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--head)', fontSize: '1.6rem', margin: 0 }}>
            Sri Sankara TV
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 6 }}>
            Super Admin & Staff Sign In
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              background: '#FEE2E2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              borderRadius: 4,
              fontSize: '0.88rem',
              marginBottom: 18
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <FormField
            id="admin-email"
            label="Staff Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@srisankaratv.com"
            required
            autoComplete="email"
          />

          <FormField
            id="admin-password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            autoComplete="current-password"
          />

          <Button type="submit" loading={loading} style={{ width: '100%', marginTop: 8 }}>
            <Lock size={16} style={{ marginRight: 6 }} /> Secure Sign In
          </Button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
          <a href="/" style={{ fontSize: '0.85rem', color: 'var(--label)', textDecoration: 'none' }}>
            ← Return to Public Storefront
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
