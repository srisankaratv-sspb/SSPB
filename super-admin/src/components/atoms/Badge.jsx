import React from 'react';

export const Label = ({ htmlFor, children, required = false, style = {} }) => (
  <label
    htmlFor={htmlFor}
    style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: 4, ...style }}
  >
    {children}
    {required && <span style={{ color: '#DC2626', marginLeft: 4 }}>*</span>}
  </label>
);

export const Badge = ({ status = 'default', children }) => {
  const getStyle = () => {
    switch (String(status).toUpperCase()) {
      case 'PAID':
      case 'CAPTURED':
      case 'DELIVERED':
        return { bg: '#DCFCE7', text: '#166534', border: '#86EFAC' };
      case 'PENDING':
      case 'CREATED':
      case 'PAYMENT_PENDING':
      case 'PROCESSING':
        return { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' };
      case 'FAILED':
      case 'CANCELLED':
        return { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' };
      case 'REFUNDED':
        return { bg: '#F3E8FF', text: '#6B21A8', border: '#D8B4FE' };
      case 'DISPATCHED':
        return { bg: '#E0F2FE', text: '#075985', border: '#7DD3FC' };
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };
    }
  };

  const s = getStyle();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`
      }}
    >
      {children || status}
    </span>
  );
};

export default Badge;
