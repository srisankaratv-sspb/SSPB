import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { Eyebrow, Title, Lede } from '../components/atoms/Typography';
import { Button } from '../components/atoms/Button';
import { Badge } from '../components/atoms/Badge';
import { Search, Package, CheckCircle, Truck, Clock } from 'lucide-react';

export const OrderStatusPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOrderNum = searchParams.get('orderNumber') || '';

  const [orderNumberInput, setOrderNumberInput] = useState(initialOrderNum);
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(initialOrderNum));
  const [error, setError] = useState('');

  const fetchStatus = async (num) => {
    if (!num.trim()) return;

    setIsLoading(true);
    setError('');
    try {
      const res = await orderService.getOrderStatus(num.trim());
      if (res.success && res.data) {
        setOrderData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Order not found. Please verify the order number.');
      setOrderData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNum) {
      fetchStatus(initialOrderNum);
    }
  }, [initialOrderNum]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (orderNumberInput.trim()) {
      setSearchParams({ orderNumber: orderNumberInput.trim().toUpperCase() });
      fetchStatus(orderNumberInput);
    }
  };

  return (
    <div className="band">
      <div className="wrap" style={{ maxWidth: 760 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Eyebrow>Devotee Self-Service</Eyebrow>
          <Title>Track Your Pooja Box</Title>
          <Lede style={{ margin: '10px auto' }}>
            Enter your order reference number (e.g. SSK-2026-XXXX) to track fulfillment and dispatch updates.
          </Lede>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, maxWidth: 500, margin: '0 auto 36px' }}>
          <input
            type="text"
            placeholder="Enter Order Reference Number"
            value={orderNumberInput}
            onChange={(e) => setOrderNumberInput(e.target.value.toUpperCase())}
            style={{
              flex: 1,
              padding: '12px 16px',
              font: '500 1rem var(--font-body)',
              border: '1px solid var(--line)',
              borderRadius: 3,
              background: 'var(--field)',
              color: 'var(--field-ink, #220A0D)'
            }}
            required
          />
          <Button type="submit" loading={isLoading}>
            <Search size={16} style={{ marginRight: 6 }} /> Track
          </Button>
        </form>

        {error && (
          <div style={{ padding: '16px 20px', background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: 4, textAlign: 'center', marginBottom: 24 }}>
            {error}
          </div>
        )}

        {orderData && (
          <div className="card" style={{ border: '1px solid var(--line)', background: 'var(--surface)', padding: 28, borderRadius: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid var(--line)', paddingBottom: 16 }}>
              <div>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.08em' }}>Order Reference</span>
                <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--head)', fontSize: '1.6rem', margin: '4px 0 0' }}>
                  {orderData.orderNumber}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Badge status={orderData.paymentStatus} />
                <Badge status={orderData.orderStatus} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, margin: '24px 0' }}>
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Devotee</span>
                <p style={{ fontWeight: 600, marginTop: 4 }}>{orderData.customerName}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{orderData.maskedPhone}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Delivery Destination</span>
                <p style={{ fontWeight: 600, marginTop: 4 }}>{orderData.deliveryCity}, {orderData.deliveryState}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Quantity</span>
                <p style={{ fontWeight: 600, marginTop: 4 }}>{orderData.quantity} box(es)</p>
              </div>
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Total Amount</span>
                <p style={{ fontWeight: 700, color: 'var(--head)', fontSize: '1.2rem', marginTop: 4 }}>
                  ₹{orderData.totalAmountInRupees?.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {orderData.tracking?.trackingNumber && (
              <div style={{ background: '#E0F2FE', border: '1px solid #BAE6FD', padding: 14, borderRadius: 4, marginBottom: 24 }}>
                <span style={{ fontSize: '0.82rem', color: '#0369A1', fontWeight: 600 }}>Courier Tracking:</span>
                <p style={{ fontWeight: 700, color: '#0C4A6E', marginTop: 2 }}>
                  {orderData.tracking.trackingNumber} ({orderData.tracking.carrier || 'Speed Post / Courier'})
                </p>
              </div>
            )}

            {/* Timeline */}
            <div style={{ marginTop: 28 }}>
              <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--head)', fontSize: '1.2rem', marginBottom: 16 }}>
                Order Journey Timeline
              </h4>
              <div style={{ display: 'grid', gap: 14 }}>
                {orderData.timeline?.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--gold)', color: 'var(--paper)', display: 'grid', placeItems: 'center', fontSize: '0.75rem', flexShrink: 0, marginTop: 2 }}>
                      ✓
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{step.status}</p>
                      <p style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>{step.note}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--muted)', opacity: 0.8 }}>
                        {new Date(step.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatusPage;
