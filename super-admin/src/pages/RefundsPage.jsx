import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import Badge from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import { RefreshCw, RotateCcw } from 'lucide-react';

export const RefundsPage = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const res = await adminService.getRefunds();
      if (res.success && res.data) {
        setRefunds(res.data.refunds);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', color: '#4A0F1B', fontSize: '1.85rem' }}>
            Refund Management & Audit
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: 4 }}>
            Historical record of all authorized refunds processed through Razorpay.
          </p>
        </div>

        <Button variant="secondary" onClick={fetchRefunds}>
          <RefreshCw size={15} style={{ marginRight: 6 }} /> Refresh
        </Button>
      </div>

      <div className="admin-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Devotee Name</th>
                <th>Phone</th>
                <th>Original Total</th>
                <th>Refunded Amount</th>
                <th>Razorpay Refund ID</th>
                <th>Reason</th>
                <th>Refunded Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: '#64748B' }}>
                    Loading refund records...
                  </td>
                </tr>
              ) : refunds.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: '#64748B' }}>
                    No refunded orders found.
                  </td>
                </tr>
              ) : (
                refunds.map((r, idx) => (
                  <tr key={idx}>
                    <td>
                      <a href={`/admin/orders/${r.orderId}`} style={{ color: '#4A0F1B', fontWeight: 600 }}>
                        {r.orderNumber}
                      </a>
                    </td>
                    <td>{r.customerName}</td>
                    <td>{r.customerPhone}</td>
                    <td>₹{r.totalAmountInRupees?.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 700, color: '#7C3AED' }}>
                      ₹{r.refundedAmountInRupees?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{r.razorpayRefundId}</td>
                    <td>{r.reason}</td>
                    <td>{new Date(r.refundedAt).toLocaleString('en-IN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RefundsPage;
