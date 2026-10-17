import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  PackageCheck,
  CreditCard,
  Users,
  Mail,
  TrendingUp,
  Settings,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import '../../styles/admin.css';

export const AdminLayout = () => {
  const { adminUser, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/admin/products', label: 'Product & Pricing', icon: PackageCheck },
    { to: '/admin/payments', label: 'Payments', icon: CreditCard },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/email-logs', label: 'Brevo Email Logs', icon: Mail },
    { to: '/admin/analytics', label: 'Revenue Analytics', icon: TrendingUp },
    { to: '/admin/settings', label: 'Settings', icon: Settings }
  ];

  if (adminUser?.role === 'super_admin') {
    navLinks.push({ to: '/admin/users', label: 'Admin Staff', icon: ShieldCheck });
  }

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-header">
          <h2>Sri Sankara TV</h2>
          <p>Administration Portal</p>
        </div>

        <nav className="admin-nav">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin/dashboard'}
                className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(228, 182, 85, 0.2)', paddingTop: 12 }}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-nav-item"
              style={{ opacity: 0.8 }}
            >
              <ExternalLink size={16} />
              <span>View Storefront</span>
            </a>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Signed in as: </span>
            <strong style={{ color: '#1e293b' }}>{adminUser?.name || 'Administrator'}</strong>
            <span
              style={{
                marginLeft: 8,
                fontSize: '0.72rem',
                padding: '2px 8px',
                borderRadius: 4,
                background: '#FEF3C7',
                color: '#92400E',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}
            >
              {adminUser?.role?.replace('_', ' ') || 'Admin'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'transparent',
              border: '1px solid #cbd5e1',
              borderRadius: 4,
              padding: '6px 12px',
              fontSize: '0.85rem',
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
