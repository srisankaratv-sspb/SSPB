import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { Badge } from '../../components/atoms/Badge';
import { Button } from '../../components/atoms/Button';
import {
  ShoppingBag,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  Download,
  ArrowRight
} from 'lucide-react';

export const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboard();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleExportCSV = async () => {
    try {
      const blob = await adminService.exportOrdersCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sri_sankara_orders_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Failed to export orders CSV: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ color: '#64748b' }}>Loading administrative dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, background: '#FEE2E2', color: '#991B1B', borderRadius: 6 }}>
        {error}
      </div>
    );
  }

  const summary = data?.summary || {};
  const statusDist = data?.statusDistribution || {};
  const recentOrders = data?.recentOrders || [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--head)', fontSize: '1.8rem', margin: 0 }}>
            Executive Dashboard
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 4 }}>
            Overview of verified revenue, Pooja box orders, and payment gateway activity.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="alt" onClick={handleExportCSV}>
            <Download size={16} style={{ marginRight: 6 }} /> Export Orders CSV
          </Button>
          <Button onClick={fetchDashboard} variant="alt">
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Verified Revenue</span>
            <IndianRupee size={20} color="#16A34A" />
          </div>
          <div className="stat-value" style={{ color: '#16A34A' }}>
            ₹{summary.totalVerifiedRevenueInRupees?.toLocaleString('en-IN') || '0'}
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 6 }}>
            Strictly from verified & captured payments
          </p>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Total Orders</span>
            <ShoppingBag size={20} color="var(--gold)" />
          </div>
          <div className="stat-value">
            {summary.totalOrders || 0}
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 6 }}>
            {summary.totalBoxesSold || 0} box(es) reserved
          </p>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Successful Payments</span>
            <CheckCircle2 size={20} color="#16A34A" />
          </div>
          <div className="stat-value" style={{ color: '#16A34A' }}>
            {summary.successfulPayments || 0}
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 6 }}>
            Verified via Razorpay HMAC signature
          </p>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Pending Payments</span>
            <Clock size={20} color="#D97706" />
          </div>
          <div className="stat-value" style={{ color: '#D97706' }}>
            {summary.pendingPayments || 0}
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 6 }}>
            Awaiting customer completion
          </p>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Failed Payments</span>
            <AlertCircle size={20} color="#DC2626" />
          </div>
          <div className="stat-value" style={{ color: '#DC2626' }}>
            {summary.failedPayments || 0}
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 6 }}>
            Declined or timed out
          </p>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-label">Total Refunds</span>
            <RotateCcw size={20} color="#7C3AED" />
          </div>
          <div className="stat-value" style={{ color: '#7C3AED' }}>
            ₹{summary.totalRefundedInRupees?.toLocaleString('en-IN') || '0'}
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 6 }}>
            Audited refund processing
          </p>
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="admin-card">
        <h3>Order Status Distribution</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {Object.entries(statusDist).map(([status, count]) => (
            <div
              key={status}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 6
              }}
            >
              <Badge status={status} />
              <strong style={{ fontSize: '1.1rem', color: '#1e293b' }}>{count}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Recent Orders</h3>
          <Link
            to="/admin/orders"
            style={{
              fontSize: '0.88rem',
              color: 'var(--head)',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            View All Orders <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Devotee Name</th>
                <th>Mobile Number</th>
                <th>Boxes</th>
                <th>Total</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>
                    No orders recorded yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord) => (
                  <tr key={ord.id}>
                    <td>
                      <Link
                        to={`/admin/orders/${ord.id}`}
                        style={{ fontWeight: 600, color: 'var(--head)', textDecoration: 'none' }}
                      >
                        {ord.orderNumber}
                      </Link>
                    </td>
                    <td>{ord.customerName}</td>
                    <td>{ord.customerPhone}</td>
                    <td>{ord.quantity}</td>
                    <td style={{ fontWeight: 600 }}>₹{ord.totalAmountInRupees?.toLocaleString('en-IN')}</td>
                    <td><Badge status={ord.paymentStatus} /></td>
                    <td><Badge status={ord.orderStatus} /></td>
                    <td>{new Date(ord.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <Link
                        to={`/admin/orders/${ord.id}`}
                        style={{ fontSize: '0.82rem', color: 'var(--label)', fontWeight: 600 }}
                      >
                        Manage
                      </Link>
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

export default DashboardPage;
