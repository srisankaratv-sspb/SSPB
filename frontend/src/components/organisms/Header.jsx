import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

export const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { customer, isAuthenticated, openAuthModal, openMyOrdersModal, logout } = useCustomerAuth();

  const scrollToSection = (id) => {
    if (isHome) {
      if (id === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="top">
      <div className="wrap">
        <Link to="/" className="brand" onClick={() => scrollToSection('top')}>
          <div className="brand-logo-frame">
            <img src="/logo.jpeg" alt="Sri Sankara TV" className="brand-logo" />
          </div>
          <span className="brand-title">Sri Sankara TV</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link
            to="/orders/track"
            className="nav-link-track"
          >
            Track Order
          </Link>
          <Link
            to="/profile"
            className="nav-link-track"
          >
            My Profile
          </Link>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                onClick={openMyOrdersModal}
                style={{
                  background: 'rgba(228, 182, 85, 0.15)',
                  border: '1px solid var(--hero-gold)',
                  color: 'var(--hero-gold)',
                  borderRadius: 3,
                  padding: '5px 10px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <span>🙏 {customer?.name ? customer.name.split(' ')[0] : 'Devotee'}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>(Orders)</span>
              </button>
              <button
                type="button"
                onClick={logout}
                title="Sign Out"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--hero-muted)',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  padding: '4px 6px'
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="mini"
              onClick={() => openAuthModal('login')}
              style={{
                cursor: 'pointer',
                background: 'transparent',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              Sign In
            </button>
          )}

          {isHome ? (
            <a className="mini" href="#order" onClick={(e) => { e.preventDefault(); scrollToSection('order'); }}>
              Order the box
            </a>
          ) : (
            <Link className="mini" to="/#order">
              Order the box
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
