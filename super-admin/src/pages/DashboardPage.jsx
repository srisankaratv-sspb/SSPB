import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import StatCard from '../components/molecules/StatCard';
import Badge from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import {
  ShoppingBag,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  Download,
  ArrowRight,
  Package
} from 'lucide-react';

export const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDashboard();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
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
      alert('Failed to export CSV: ' + err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading executive analytics...</div>;
  }

  const summary = data?.summary || {};
  const statusDist = data?.statusDistribution || {};
  const recentOrders = data?.recentOrders || [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', color: '#4A0F1B', fontSize: '1.85rem' }}>
            Super Admin Executive Dashboard
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: 4 }}>
            High-level metrics for verified revenue, Razorpay gateway health, and order fulfillment.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" onClick={handleExportCSV}>
            <Download size={15} style={{ marginRight: 6 }} /> Export All Orders (CSV)
          </Button>
          <Button variant="secondary" onClick={fetchDashboard}>
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stat-grid">
        <StatCard
          label="Verified Revenue"
          value={`₹${summary.totalVerifiedRevenueInRupees?.toLocaleString('en-IN') || '0'}`}
          subtext="Excludes pending & failed attempts"
          icon={IndianRupee}
          color="#16A34A"
        />

        <StatCard
          label="Total Orders"
          value={summary.totalOrders || 0}
          subtext={`${summary.totalBoxesSold || 0} total boxes reserved`}
          icon={ShoppingBag}
          color="#8A3A12"
        />

        <StatCard
          label="Successful Payments"
          value={summary.successfulPayments || 0}
          subtext="Verified via Razorpay HMAC"
          icon={CheckCircle2}
          color="#16A34A"
        />

        <StatCard
          label="Awaiting Fulfillment"
          value={statusDist.PAID || 0}
          subtext="Paid orders ready for packing"
          icon={Package}
          color="#D97706"
        />

        <StatCard
          label="Pending Payments"
          value={summary.pendingPayments || 0}
          subtext="Incomplete checkout flows"
          icon={Clock}
          color="#64748B"
        />

        <StatCard
          label="Total Refunds"
          value={`₹${summary.totalRefundedInRupees?.toLocaleString('en-IN') || '0'}`}
          subtext="Audited returns"
          icon={RotateCcw}
          color="#7C3AED"
        />
      </div>

      {/* Fulfillment Status Distribution */}
      <div className="admin-card">
        <h3 style={{ marginBottom: 14 }}>Order Status Pipeline</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {Object.entries(statusDist).map(([status, count]) => (
            <div
              key={status}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 16px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 6
              }}
            >
              <Badge status={status} />
              <strong style={{ fontSize: '1.2rem', color: '#1E293B' }}>{count}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Recent Orders</h3>
          <Link
            to="/admin/orders"
            style={{ fontSize: '0.85rem', color: '#8A3A12', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}
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
                <th>Phone</th>
                <th>Qty</th>
                <th>Total (INR)</th>
                <th>Payment</th>
                <th>Fulfillment</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 24, color: '#64748B' }}>
                    No orders recorded yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord) => (
                  <tr key={ord.id}>
                    <td>
                      <Link to={`/admin/orders/${ord.id}`} style={{ fontWeight: 600, color: '#4A0F1B' }}>
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
                      <Link to={`/admin/orders/${ord.id}`} style={{ fontSize: '0.85rem', color: '#8A3A12', fontWeight: 600 }}>
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
