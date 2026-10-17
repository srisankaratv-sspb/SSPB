import React from 'react';

export const StatCard = ({ label, value, subtext, icon: Icon, color = '#1e293b' }) => {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="stat-label">{label}</span>
        {Icon && <Icon size={20} color={color} />}
      </div>
      <div className="stat-value" style={{ color }}>
        {value}
      </div>
      {subtext && (
        <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 6 }}>
          {subtext}
        </p>
      )}
    </div>
  );
};

export default StatCard;
