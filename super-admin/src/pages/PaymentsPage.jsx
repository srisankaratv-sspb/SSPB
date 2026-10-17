import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import Badge from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import { RefreshCw, Search } from 'lucide-react';

export const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [reconcilingId, setReconcilingId] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await adminService.getPayments({ status: statusFilter, search });
      if (res.success && res.data) {
        setPayments(res.data.payments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const handleReconcile = async (id) => {
    setReconcilingId(id);
    try {
      const res = await adminService.reconcilePayment(id);
      if (res.success) {
        alert(res.message);
        fetchPayments();
      }
    } catch (err) {
      alert('Reconciliation error: ' + err.message);
    } finally {
      setReconcilingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', color: '#4A0F1B', fontSize: '1.85rem' }}>
            Razorpay Payment Management
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: 4 }}>
            Monitor gateway transactions, verify webhook delivery, and reconcile pending payments.
          </p>
        </div>

        <Button variant="secondary" onClick={fetchPayments}>
          <RefreshCw size={15} style={{ marginRight: 6 }} /> Refresh
        </Button>
      </div>

      <div className="admin-card" style={{ padding: 16 }}>
        <form onSubmit={(e) => { e.preventDefault(); fetchPayments(); }} className="filter-bar" style={{ margin: 0 }}>
          <input
            type="text"
            placeholder="Search by Payment ID, Order Number, or Razorpay Order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input"
            style={{ flex: 1, minWidth: 260 }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-select"
          >
            <option value="">All Statuses</option>
            <option value="CAPTURED">Captured / Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <Button type="submit" variant="secondary">Filter</Button>
        </form>
      </div>

      <div className="admin-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Order Number</th>
                <th>Razorpay Payment ID</th>
                <th>Amount (INR)</th>
                <th>Method</th>
                <th>Status</th>
                <th>Verified At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: '#64748B' }}>
                    Loading transactions...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 24, color: '#64748B' }}>
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.internalPaymentId}</td>
                    <td>
                      <a href={`/admin/orders/${p.orderId?._id || p.orderId}`} style={{ color: '#4A0F1B', fontWeight: 600 }}>
                        {p.orderNumber}
                      </a>
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>{p.razorpayPaymentId || 'N/A'}</td>
                    <td style={{ fontWeight: 600 }}>₹{(p.amountInPaise / 100).toLocaleString('en-IN')}</td>
                    <td style={{ textTransform: 'uppercase' }}>{p.method || '—'}</td>
                    <td><Badge status={p.status} /></td>
                    <td>{p.verifiedAt ? new Date(p.verifiedAt).toLocaleString('en-IN') : '—'}</td>
                    <td>
                      {p.status === 'PENDING' && (
                        <Button
                          variant="secondary"
                          onClick={() => handleReconcile(p._id)}
                          loading={reconcilingId === p._id}
                          style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                        >
                          Reconcile
                        </Button>
                      )}
                    </td>
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

export default PaymentsPage;
