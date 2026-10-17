import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  PackageCheck,
  CreditCard,
  RotateCcw,
  Users,
  Mail,
  FileText,
  TrendingUp,
  ShieldCheck,
  Settings,
  History,
  ExternalLink
} from 'lucide-react';

export const Sidebar = ({ mobileOpen, onCloseMobile }) => {
  const { adminUser } = useAuth();

  const links = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/admin/products', label: 'Products & Pricing', icon: PackageCheck },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/payments', label: 'Payments', icon: CreditCard },
    { to: '/admin/refunds', label: 'Refunds', icon: RotateCcw },
    { to: '/admin/email-logs', label: 'Brevo Email Logs', icon: Mail },
    { to: '/admin/content', label: 'Website Content', icon: FileText },
    { to: '/admin/analytics', label: 'Revenue Analytics', icon: TrendingUp },
    { to: '/admin/settings', label: 'Settings', icon: Settings }
  ];

  if (adminUser?.role === 'super_admin') {
    links.push({ to: '/admin/users', label: 'Admin Staff', icon: ShieldCheck });
    links.push({ to: '/admin/audit-logs', label: 'Security Audit Logs', icon: History });
  }

  return (
    <aside className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand">
        <h1>Sri Sankara TV</h1>
        <span>Super Admin Portal</span>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onCloseMobile}
            >
              <Icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}

        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(228, 182, 85, 0.2)' }}>
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
            style={{ opacity: 0.8 }}
          >
            <ExternalLink size={16} />
            <span>Open Public Storefront</span>
          </a>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
