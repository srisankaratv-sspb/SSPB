import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormField from '../components/molecules/FormField';
import Button from '../components/atoms/Button';
import { ShieldCheck, Lock } from 'lucide-react';

export const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
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
        background: 'radial-gradient(900px 420px at 85% 10%, rgba(228, 182, 85, 0.16), transparent 70%), linear-gradient(165deg, #4A1220, #2F0A12 70%)',
        padding: 20
      }}
    >
      <div
        className="admin-card"
        style={{
          width: '100%',
          maxWidth: 420,
          padding: '40px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          border: '1px solid #E4B655'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#2F0A12',
              color: '#E4B655',
              display: 'inline-grid',
              placeItems: 'center',
              marginBottom: 12,
              border: '2px solid #E4B655'
            }}
          >
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', color: '#4A0F1B', fontSize: '1.65rem' }}>
            Sri Sankara TV
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.88rem', marginTop: 4 }}>
            Super Admin Control Center
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
              fontSize: '0.85rem',
              marginBottom: 16
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <FormField
            id="admin-email"
            label="Super Admin Email"
            type="email"
            placeholder="admin@srisankaratv.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <FormField
            id="admin-pass"
            label="Password"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" loading={loading} style={{ width: '100%', marginTop: 8 }}>
            <Lock size={15} style={{ marginRight: 6 }} /> Authorize Sign In
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '0.82rem', color: '#8A3A12' }}
          >
            ← Open Public Customer Storefront
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
