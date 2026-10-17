import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import StatCard from '../components/molecules/StatCard';
import { IndianRupee, TrendingUp, ShoppingBag, RotateCcw } from 'lucide-react';

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
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

    fetchAnalytics();
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading revenue analytics...</div>;

  const trends = data?.revenueTrends || [];
  const summary = data?.summary || {};

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', color: '#4A0F1B', fontSize: '1.85rem' }}>
          Revenue & Financial Analytics
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: 4 }}>
          Audited financial reporting derived strictly from captured Razorpay payments.
        </p>
      </div>

      <div className="stat-grid">
        <StatCard
          label="Total Verified Revenue"
          value={`₹${summary.totalVerifiedRevenueInRupees?.toLocaleString('en-IN') || '0'}`}
          subtext="Net captured payments"
          icon={IndianRupee}
          color="#16A34A"
        />

        <StatCard
          label="Total Boxes Reserved"
          value={summary.totalBoxesSold || 0}
          subtext="Physical pooja boxes"
          icon={ShoppingBag}
          color="#8A3A12"
        />

        <StatCard
          label="Average Order Value"
          value={`₹${summary.totalOrders > 0 ? Math.round(summary.totalVerifiedRevenueInRupees / (summary.successfulPayments || 1)).toLocaleString('en-IN') : '2,500'}`}
          subtext="Per verified devotee transaction"
          icon={TrendingUp}
          color="#B8862B"
        />

        <StatCard
          label="Audited Refunds"
          value={`₹${summary.totalRefundedInRupees?.toLocaleString('en-IN') || '0'}`}
          subtext="Refunded to original method"
          icon={RotateCcw}
          color="#7C3AED"
        />
      </div>

      <div className="admin-card">
        <h3>Daily Revenue Trends (Last 14 Days)</h3>
        {trends.length === 0 ? (
          <p style={{ color: '#64748B', padding: 12 }}>No daily trend data available yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Orders Count</th>
                  <th>Boxes Reserved</th>
                  <th>Verified Revenue (INR)</th>
                </tr>
              </thead>
              <tbody>
                {trends.map((t) => (
                  <tr key={t.date}>
                    <td style={{ fontWeight: 600 }}>{t.date}</td>
                    <td>{t.orderCount}</td>
                    <td>{t.boxesCount}</td>
                    <td style={{ fontWeight: 700, color: '#16A34A' }}>
                      ₹{t.revenueInRupees.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
