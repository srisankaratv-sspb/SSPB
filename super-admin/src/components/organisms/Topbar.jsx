import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu } from 'lucide-react';
import { Button } from '../atoms/Button';

export const Topbar = ({ onToggleMobile }) => {
  const { adminUser, logout } = useAuth();

  return (
    <header className="admin-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onToggleMobile}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4
          }}
          className="mobile-btn"
        >
          <Menu size={22} />
        </button>
        <div>
          <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Signed in as: </span>
          <strong style={{ color: '#1E293B' }}>{adminUser?.name || 'Administrator'}</strong>
          <span className="role-pill" style={{ marginLeft: 8 }}>
            {adminUser?.role?.replace('_', ' ') || 'Staff'}
          </span>
        </div>
      </div>

      <Button
        variant="secondary"
        onClick={logout}
        style={{ fontSize: '0.82rem', padding: '6px 12px' }}
      >
        <LogOut size={15} style={{ marginRight: 6 }} /> Sign Out
      </Button>
    </header>
  );
};

export default Topbar;
