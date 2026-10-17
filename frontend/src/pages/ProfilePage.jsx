import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/apiClient';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { Eyebrow, Title, Lede } from '../components/atoms/Typography';
import { Button } from '../components/atoms/Button';
import { Badge } from '../components/atoms/Badge';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  Calendar,
  CreditCard,
  Truck,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const ProfilePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { customer, isAuthenticated, openAuthModal } = useCustomerAuth();

  // Try to pre-fill from search params, auth context, or local devotee session
  const initialPhone = searchParams.get('phone') || customer?.phone || (() => {
    try {
      const sess = JSON.parse(localStorage.getItem('ssk_devotee_session') || '{}');
      return sess.phone || '';
    } catch {
      return '';
    }
  })();

  const [phoneInput, setPhoneInput] = useState(initialPhone);
  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(Boolean(initialPhone));
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchProfileAndOrders = async (phoneToQuery) => {
    if (!phoneToQuery || !phoneToQuery.trim()) return;

    setLoading(true);
    setError('');
    try {
      const clean = phoneToQuery.trim().replace(/[\s-]/g, '').replace(/^(?:\+?91)/, '');
      const res = await api.get(`/orders/customer/my-orders?phone=${encodeURIComponent(clean)}`);

      if (res.success && res.data) {
        setProfileData(res.data.customer);
        setOrders(res.data.orders || []);
        // Save to devotee session for automatic recognition
        localStorage.setItem('ssk_devotee_session', JSON.stringify({
          phone: clean,
          name: res.data.customer?.name,
          email: res.data.customer?.email
        }));
      } else {
        setProfileData(null);
        setOrders([]);
      }
    } catch (err) {
      console.warn('Failed to load customer profile:', err);
      setError(err.response?.data?.message || err.message || 'No bookings found for this mobile number.');
      setProfileData(null);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPhone) {
      fetchProfileAndOrders(initialPhone);
    }
  }, [initialPhone]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!phoneInput.trim()) return;
    setSearchParams({ phone: phoneInput.trim() });
    fetchProfileAndOrders(phoneInput);
  };

  const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  return (
    <div className="band" style={{ minHeight: '80vh', paddingTop: '40px' }}>
      <div className="wrap" style={{ maxWidth: '960px' }}>
        {/* Page Title */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <Eyebrow>Devotee Sanctuary</Eyebrow>
          <Title>My Profile & Pooja Box Bookings</Title>
          <Lede style={{ margin: '10px auto', maxWidth: '640px' }}>
            View all your booked Soora Samhara Pooja Boxes, live temple travel updates, payment receipts, and courier dispatches directly from the sacred registry.
          </Lede>
        </div>

        {/* Mobile Number Lookup Bar */}
        <div
          className="admin-card"
          style={{
            background: 'var(--surface-card, #2E0D12)',
            border: '1px solid rgba(214, 163, 66, 0.35)',
            borderRadius: '8px',
            padding: '20px 24px',
            marginBottom: '32px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
          }}
        >
          <form
            onSubmit={handleSearchSubmit}
            style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}
          >
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <input
                type="tel"
                placeholder="Enter 10-digit registered mobile number..."
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  background: 'var(--field, #FAF4E8)',
                  color: 'var(--field-ink, #200B0E)',
                  border: '1px solid #C8B291',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  fontFamily: 'var(--font-body)'
                }}
                required
              />
              <Phone
                size={16}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#8A3A12'
                }}
              />
            </div>
            <Button type="submit" loading={loading} className="btn-hero-primary" style={{ minHeight: '46px', padding: '0 24px' }}>
              <Search size={15} style={{ marginRight: 6 }} /> View My Orders
            </Button>
            {phoneInput && (
              <button
                type="button"
                onClick={() => fetchProfileAndOrders(phoneInput)}
                className="btn alt"
                style={{ minHeight: '46px', padding: '0 16px' }}
                title="Refresh from database"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
            )}
          </form>
        </div>

        {error && (
          <div
            style={{
              padding: '16px 20px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#FCA5A5',
              borderRadius: '6px',
              marginBottom: '28px',
              textAlign: 'center'
            }}
          >
            {error}
          </div>
        )}

        {/* Profile Card if customer loaded */}
        {profileData && (
          <div
            style={{
              background: 'linear-gradient(160deg, #381216 0%, #26090D 100%)',
              border: '1px solid rgba(214, 163, 66, 0.35)',
              borderRadius: '8px',
              padding: '28px',
              marginBottom: '36px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.14em',
                    color: 'var(--gold, #D6A342)',
                    fontWeight: 700
                  }}
                >
                  Sanctified Devotee Account
                </span>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.75rem',
                    color: 'var(--head, #F7E9CF)',
                    marginTop: '4px'
                  }}
                >
                  {profileData.name || 'Devotee'}
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', marginTop: '12px', fontSize: '0.92rem', color: 'var(--muted, #D9C6A6)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={15} style={{ color: 'var(--gold)' }} />
                    <span>{profileData.phone}</span>
                  </div>
                  {profileData.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={15} style={{ color: 'var(--gold)' }} />
                      <span>{profileData.email}</span>
                    </div>
                  )}
                  {profileData.city && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={15} style={{ color: 'var(--gold)' }} />
                      <span>{profileData.city}, {profileData.state} - {profileData.pincode}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Stats Badges */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <div
                  style={{
                    background: 'rgba(38, 14, 18, 0.8)',
                    border: '1px solid rgba(214, 163, 66, 0.25)',
                    borderRadius: '6px',
                    padding: '10px 18px',
                    textAlign: 'center'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block' }}>Total Orders</span>
                  <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--gold-bright)' }}>
                    {profileData.totalOrders || orders.length}
                  </strong>
                </div>

                <div
                  style={{
                    background: 'rgba(38, 14, 18, 0.8)',
                    border: '1px solid rgba(214, 163, 66, 0.25)',
                    borderRadius: '6px',
                    padding: '10px 18px',
                    textAlign: 'center'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block' }}>Boxes Reserved</span>
                  <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--gold-bright)' }}>
                    {profileData.totalBoxes || orders.reduce((acc, o) => acc + (o.quantity || 0), 0)}
                  </strong>
                </div>

                <div
                  style={{
                    background: 'rgba(38, 14, 18, 0.8)',
                    border: '1px solid rgba(214, 163, 66, 0.25)',
                    borderRadius: '6px',
                    padding: '10px 18px',
                    textAlign: 'center'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block' }}>Total Offerings</span>
                  <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#10B981' }}>
                    {inr(profileData.totalSpentInRupees)}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders List Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--head)' }}>
              Booked Pooja Boxes ({orders.length})
            </h3>
            {orders.length > 0 && (
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                Live updates synced from Thiruttani Temple Yaagam desk
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
              <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--gold)' }} />
              <p>Fetching your sanctified bookings from the database...</p>
            </div>
          ) : orders.length === 0 ? (
            <div
              style={{
                background: 'var(--surface-card, #2E0D12)',
                border: '1px solid rgba(214, 163, 66, 0.25)',
                borderRadius: '8px',
                padding: '48px 24px',
                textAlign: 'center',
                color: 'var(--muted)'
              }}
            >
              <Package size={42} style={{ color: 'var(--gold)', margin: '0 auto 16px', opacity: 0.7 }} />
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--head)', marginBottom: '8px' }}>
                No Pooja Boxes Found
              </h4>
              <p style={{ maxWidth: '460px', margin: '0 auto 24px', fontSize: '0.95rem' }}>
                {phoneInput
                  ? `No bookings recorded yet for mobile number ${phoneInput}. If you placed an order with another number, enter it above.`
                  : 'Enter your 10-digit mobile number above to review your booked pooja boxes.'}
              </p>
              <Link to="/#order" className="btn btn-hero-primary" style={{ display: 'inline-flex' }}>
                Book Your Pooja Box Now (₹2,500)
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {orders.map((ord) => {
                const isExpanded = expandedOrder === ord.orderNumber;
                const isPaid = ord.paymentStatus === 'PAID' || ord.paymentStatus === 'CAPTURED';

                return (
                  <div
                    key={ord._id || ord.orderNumber}
                    style={{
                      background: 'linear-gradient(160deg, #300E13 0%, #24080B 100%)',
                      border: `1px solid ${isPaid ? 'rgba(214, 163, 66, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                      borderRadius: '8px',
                      padding: '24px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Order Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontSize: '1.3rem',
                              color: 'var(--head)',
                              letterSpacing: '0.02em',
                              fontWeight: 600
                            }}
                          >
                            {ord.orderNumber}
                          </span>
                          <span
                            style={{
                              padding: '3px 10px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: isPaid ? '#DCFCE7' : '#FEF3C7',
                              color: isPaid ? '#15803D' : '#92400E'
                            }}
                          >
                            {isPaid ? 'PAYMENT VERIFIED' : 'PAYMENT PENDING'}
                          </span>
                          <span
                            style={{
                              padding: '3px 10px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: 'rgba(214, 163, 66, 0.18)',
                              color: 'var(--gold-bright)'
                            }}
                          >
                            {ord.orderStatus || 'PROCESSING'}
                          </span>
                        </div>
                        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '6px' }}>
                          Booked on: {new Date(ord.createdAt).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block' }}>Total Paid</span>
                        <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--gold-bright)' }}>
                          {inr(ord.totalAmountInRupees)}
                        </strong>
                      </div>
                    </div>

                    {/* Order Contents Overview */}
                    <div
                      style={{
                        margin: '18px 0',
                        padding: '14px 18px',
                        background: 'rgba(24, 6, 9, 0.6)',
                        border: '1px solid rgba(214, 163, 66, 0.15)',
                        borderRadius: '6px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '14px',
                        fontSize: '0.9rem'
                      }}
                    >
                      <div>
                        <span style={{ color: 'var(--muted)', fontSize: '0.78rem', textTransform: 'uppercase', display: 'block' }}>Offering Item</span>
                        <strong style={{ color: 'var(--head)' }}>{ord.productName || 'Soora Samhara Pooja Box 2026'}</strong>
                        <span style={{ display: 'block', color: 'var(--gold)', fontSize: '0.82rem' }}>Quantity: {ord.quantity} box{ord.quantity > 1 ? 'es' : ''}</span>
                      </div>

                      <div>
                        <span style={{ color: 'var(--muted)', fontSize: '0.78rem', textTransform: 'uppercase', display: 'block' }}>Delivery Address</span>
                        <span style={{ color: 'var(--head)', display: 'block' }}>{ord.customer?.name}</span>
                        <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
                          {ord.customer?.address}, {ord.customer?.city}, {ord.customer?.state} - {ord.customer?.pincode}
                        </span>
                      </div>

                      {ord.tracking?.trackingNumber && (
                        <div>
                          <span style={{ color: 'var(--muted)', fontSize: '0.78rem', textTransform: 'uppercase', display: 'block' }}>Courier Tracking</span>
                          <span style={{ color: 'var(--gold-bright)', fontWeight: 600 }}>{ord.tracking.carrier || 'India Post'}</span>
                          <span style={{ display: 'block', fontFamily: 'monospace', color: 'var(--head)' }}>{ord.tracking.trackingNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* Action & Toggle Timeline */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
                      <Link
                        to={`/payment-result?orderNumber=${ord.orderNumber}&status=success`}
                        style={{
                          fontSize: '0.88rem',
                          color: 'var(--gold)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: 600
                        }}
                      >
                        <ExternalLink size={14} /> View Official Blessings Receipt
                      </Link>

                      <button
                        type="button"
                        onClick={() => setExpandedOrder(isExpanded ? null : ord.orderNumber)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.85rem'
                        }}
                      >
                        <span>{isExpanded ? 'Hide Temple Timeline' : 'View Temple Journey Timeline'}</span>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>

                    {/* Expandable Timeline */}
                    {isExpanded && ord.timeline && ord.timeline.length > 0 && (
                      <div
                        style={{
                          marginTop: '18px',
                          paddingTop: '16px',
                          borderTop: '1px solid rgba(214, 163, 66, 0.2)'
                        }}
                      >
                        <h5 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: '12px' }}>
                          Sacred Journey Milestones
                        </h5>
                        <div style={{ display: 'grid', gap: '10px' }}>
                          {ord.timeline.map((item, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                fontSize: '0.85rem'
                              }}
                            >
                              <div
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  background: 'var(--gold)',
                                  marginTop: '6px',
                                  flexShrink: 0
                                }}
                              />
                              <div>
                                <strong style={{ color: 'var(--head)' }}>{item.status}: </strong>
                                <span style={{ color: 'var(--muted)' }}>{item.note}</span>
                                <span style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(217, 198, 166, 0.6)', marginTop: '2px' }}>
                                  {new Date(item.timestamp).toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
