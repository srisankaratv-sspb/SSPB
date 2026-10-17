import React, { useState, useEffect } from 'react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { Spinner } from '../atoms/Spinner';

export const AuthModal = () => {
  const { authModalOpen, authModalMode, closeAuthModal, openAuthModal, login, register } = useCustomerAuth();

  const [mode, setMode] = useState(authModalMode || 'login'); // 'login' | 'register'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    identifier: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMode(authModalMode || 'login');
    setSubmitError('');
    setErrors({});
  }, [authModalMode, authModalOpen]);

  if (!authModalOpen) return null;

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    setSubmitError('');
  };

  const validate = () => {
    const errs = {};
    if (mode === 'login') {
      if (!formData.identifier.trim()) {
        errs.identifier = 'Please enter your registered email or mobile number.';
      }
      if (!formData.password) {
        errs.password = 'Please enter your password.';
      }
    } else {
      if (!formData.name.trim() || formData.name.trim().length < 2) {
        errs.name = 'Please enter your full name (at least 2 characters).';
      }
      const cleanPhone = formData.phone.trim().replace(/[\s-]/g, '').replace(/^(?:\+?91)/, '');
      if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
        errs.phone = 'Please enter a valid 10-digit Indian mobile number.';
      }
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errs.email = 'Please enter a valid email address.';
      }
      if (!formData.password || formData.password.length < 6) {
        errs.password = 'Password must be at least 6 characters.';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      if (mode === 'login') {
        await login({
          identifier: formData.identifier.trim(),
          password: formData.password
        });
      } else {
        await register({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim().replace(/[\s-]/g, '').replace(/^(?:\+?91)/, ''),
          password: formData.password
        });
      }
    } catch (err) {
      setSubmitError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="auth-modal-overlay"
      onClick={closeAuthModal}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(18, 5, 8, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'grid',
        placeItems: 'center',
        padding: '16px'
      }}
    >
      <div
        className="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(165deg, #3A0E18, #20060C)',
          border: '1px solid #E4B655',
          borderRadius: 8,
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(228, 182, 85, 0.2)',
          color: '#F6EBD6',
          width: '100%',
          maxWidth: 440,
          padding: '28px 24px',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            color: '#E4B655',
            fontSize: '1.5rem',
            cursor: 'pointer',
            lineHeight: 1
          }}
        >
          ×
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <p style={{
            fontFamily: 'var(--font-tamil, Georgia, serif)',
            color: '#E4B655',
            fontSize: '0.95rem',
            margin: '0 0 4px'
          }}>
            ஸ்ரீ சங்கரா டிவி · சூரசம்ஹார பூஜை
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display, Georgia, serif)',
            fontSize: '1.5rem',
            color: '#F6EBD6',
            margin: 0,
            fontWeight: 400
          }}>
            {mode === 'login' ? 'Devotee Sign In' : 'Create Devotee Account'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#D8C3A5', marginTop: 6 }}>
            {mode === 'login'
              ? 'Sign in to reserve and track your blessed Pooja Box.'
              : 'Sign up with your email, mobile number and password to place your order.'}
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 4,
            padding: 3,
            marginBottom: 20
          }}
        >
          <button
            type="button"
            onClick={() => { setMode('login'); setSubmitError(''); }}
            style={{
              padding: '8px 12px',
              border: 'none',
              borderRadius: 3,
              background: mode === 'login' ? '#E4B655' : 'transparent',
              color: mode === 'login' ? '#2B1B18' : '#D8C3A5',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setSubmitError(''); }}
            style={{
              padding: '8px 12px',
              border: 'none',
              borderRadius: 3,
              background: mode === 'register' ? '#E4B655' : 'transparent',
              color: mode === 'register' ? '#2B1B18' : '#D8C3A5',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {submitError && (
          <div
            style={{
              background: 'rgba(163, 34, 26, 0.25)',
              border: '1px solid #FF8F86',
              color: '#FFD2CE',
              padding: '10px 14px',
              borderRadius: 4,
              fontSize: '0.85rem',
              marginBottom: 16
            }}
          >
            {submitError}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} noValidate>
          {mode === 'register' && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#F6EBD6', marginBottom: 4 }}>
                Devotee Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={handleChange('name')}
                placeholder="e.g. Sriram Kalaikumar"
                autoComplete="name"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: errors.name ? '1px solid #FF8F86' : '1px solid rgba(228, 182, 85, 0.35)',
                  borderRadius: 4,
                  color: '#FFFFFF',
                  fontSize: '0.95rem'
                }}
              />
              {errors.name && <p style={{ color: '#FF8F86', fontSize: '0.78rem', margin: '4px 0 0' }}>{errors.name}</p>}
            </div>
          )}

          {mode === 'register' ? (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#F6EBD6', marginBottom: 4 }}>
                  Mobile Number (10 Digits) *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  placeholder="e.g. 9876543210"
                  inputMode="numeric"
                  autoComplete="tel"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: errors.phone ? '1px solid #FF8F86' : '1px solid rgba(228, 182, 85, 0.35)',
                    borderRadius: 4,
                    color: '#FFFFFF',
                    fontSize: '0.95rem'
                  }}
                />
                {errors.phone && <p style={{ color: '#FF8F86', fontSize: '0.78rem', margin: '4px 0 0' }}>{errors.phone}</p>}
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#F6EBD6', marginBottom: 4 }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  placeholder="name@example.com"
                  autoComplete="email"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: errors.email ? '1px solid #FF8F86' : '1px solid rgba(228, 182, 85, 0.35)',
                    borderRadius: 4,
                    color: '#FFFFFF',
                    fontSize: '0.95rem'
                  }}
                />
                {errors.email && <p style={{ color: '#FF8F86', fontSize: '0.78rem', margin: '4px 0 0' }}>{errors.email}</p>}
              </div>
            </>
          ) : (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#F6EBD6', marginBottom: 4 }}>
                Email Address or 10-Digit Mobile *
              </label>
              <input
                type="text"
                value={formData.identifier}
                onChange={handleChange('identifier')}
                placeholder="Enter email or mobile number"
                autoComplete="username"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: errors.identifier ? '1px solid #FF8F86' : '1px solid rgba(228, 182, 85, 0.35)',
                  borderRadius: 4,
                  color: '#FFFFFF',
                  fontSize: '0.95rem'
                }}
              />
              {errors.identifier && <p style={{ color: '#FF8F86', fontSize: '0.78rem', margin: '4px 0 0' }}>{errors.identifier}</p>}
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#F6EBD6', marginBottom: 4 }}>
              Password * {mode === 'register' && <span style={{ color: '#D8C3A5', fontWeight: 400 }}>(min. 6 chars)</span>}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={handleChange('password')}
              placeholder="••••••••"
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: errors.password ? '1px solid #FF8F86' : '1px solid rgba(228, 182, 85, 0.35)',
                borderRadius: 4,
                color: '#FFFFFF',
                fontSize: '0.95rem'
              }}
            />
            {errors.password && <p style={{ color: '#FF8F86', fontSize: '0.78rem', margin: '4px 0 0' }}>{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '12px 20px',
              background: '#D9731A',
              color: '#2B1B18',
              font: '700 1rem var(--font-body, sans-serif)',
              border: 'none',
              borderRadius: 4,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(217, 115, 26, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            {isSubmitting && <Spinner size="small" />}
            {mode === 'login' ? 'Sign In as Devotee' : 'Create Account & Continue'}
          </button>
        </form>

        {/* Footer Toggle */}
        <div style={{ textAlign: 'center', marginTop: 18, fontSize: '0.85rem', color: '#D8C3A5' }}>
          {mode === 'login' ? (
            <>
              First time devotee?{' '}
              <button
                type="button"
                onClick={() => { setMode('register'); setSubmitError(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#E4B655',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setSubmitError(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#E4B655',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Sign in here
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
