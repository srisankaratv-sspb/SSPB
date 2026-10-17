import React, { useState, useEffect } from 'react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { customerAuthService } from '../../services/customerAuthService';
import { Spinner } from '../atoms/Spinner';

export const MyOrdersModal = () => {
  const { myOrdersModalOpen, closeMyOrdersModal, customer } = useCustomerAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (myOrdersModalOpen) {
      const fetchOrders = async () => {
        setLoading(true);
        setError('');
        try {
          const res = await customerAuthService.getMyOrders();
          if (res.success && res.data) {
            setOrders(res.data);
          }
        } catch (err) {
          setError(err.message || 'Failed to load your orders.');
        } finally {
          setLoading(false);
        }
      };

      fetchOrders();
    }
  }, [myOrdersModalOpen]);

  if (!myOrdersModalOpen) return null;

  const inr = (n) => `₹${n.toLocaleString('en-IN')}`;

  const getStatusBadge = (order) => {
    if (order.paymentStatus === 'PAID') {
      return (
        <span style={{
          padding: '3px 8px',
          borderRadius: 4,
          fontSize: '0.75rem',
          fontWeight: 700,
          background: '#DCFCE7',
          color: '#15803D'
        }}>
          PAID · {order.orderStatus}
        </span>
      );
    }
    return (
      <span style={{
        padding: '3px 8px',
        borderRadius: 4,
        fontSize: '0.75rem',
        fontWeight: 700,
        background: '#FEF3C7',
        color: '#92400E'
      }}>
        {order.paymentStatus || 'PENDING'}
      </span>
    );
  };

  return (
    <div
      className="my-orders-modal-overlay"
      onClick={closeMyOrdersModal}
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
        className="my-orders-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFCF5',
          border: '1px solid #E4B655',
          borderRadius: 8,
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.5)',
          color: '#2B1B18',
          width: '100%',
          maxWidth: 600,
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeMyOrdersModal}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            color: '#8A3A12',
            fontSize: '1.5rem',
            cursor: 'pointer',
            lineHeight: 1
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <h2 style={{
            fontFamily: 'var(--font-display, Georgia, serif)',
            fontSize: '1.4rem',
            color: '#4A0F1B',
            margin: 0
          }}>
            My Pooja Box Bookings
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#6A5750', marginTop: 4 }}>
            Devotee account: <strong>{customer?.name}</strong> ({customer?.phone})
          </p>
        </div>

        {/* Content list */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spinner size="medium" />
              <p style={{ marginTop: 12, color: '#6A5750', fontSize: '0.9rem' }}>Retrieving your blessings and bookings...</p>
            </div>
          ) : error ? (
            <div style={{ padding: '16px', background: '#FEE2E2', color: '#991B1B', borderRadius: 4 }}>
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: '#6A5750' }}>
              <p style={{ fontSize: '1.1rem', margin: '0 0 8px' }}>No orders placed yet.</p>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>
                Reserve your Soora Samhara Pooja Box today to receive blessings from all six Arupadai Veedu temples.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {orders.map((o) => (
                <div
                  key={o._id || o.orderNumber}
                  style={{
                    border: '1px solid #E4D6BA',
                    borderRadius: 6,
                    padding: '14px 16px',
                    background: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: '1.05rem', color: '#4A0F1B' }}>
                      {o.orderNumber}
                    </strong>
                    {getStatusBadge(o)}
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#6A5750' }}>
                    <span>Quantity: {o.quantity} box{o.quantity > 1 ? 'es' : ''} · Total: {inr(o.totalAmountInPaise / 100)}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#8A807A', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Booked on: {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span>City: {o.customer?.city || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrdersModal;
