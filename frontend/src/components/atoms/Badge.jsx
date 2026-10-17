import React from 'react';

export const Badge = ({ children, status = 'default', className = '' }) => {
  const getColors = () => {
    switch (status.toUpperCase()) {
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
        return { bg: 'rgba(228, 182, 85, 0.15)', text: 'var(--head)', border: 'var(--gold)' };
    }
  };

  const colors = getColors();

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        borderRadius: 4,
        fontSize: '0.8rem',
        fontWeight: 600,
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        letterSpacing: '0.02em',
        textTransform: 'uppercase'
      }}
    >
      {children || status}
    </span>
  );
};

export default Badge;
