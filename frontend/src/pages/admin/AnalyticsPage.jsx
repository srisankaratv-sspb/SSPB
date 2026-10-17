import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { IndianRupee, TrendingUp, Calendar, ShoppingBag } from 'lucide-react';

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
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

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading revenue analytics...</div>;
  }

  const trends = data?.revenueTrends || [];
  const summary = data?.summary || {};

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--head)', fontSize: '1.8rem', margin: 0 }}>
          Revenue & Sales Analytics
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 4 }}>
          Audited financial metrics derived strictly from captured Razorpay payments.
        </p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Total Verified Revenue</span>
          <div className="stat-value" style={{ color: '#16A34A' }}>
            ₹{summary.totalVerifiedRevenueInRupees?.toLocaleString('en-IN') || '0'}
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Boxes Reserved</span>
          <div className="stat-value">
            {summary.totalBoxesSold || 0}
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Average Order Value</span>
          <div className="stat-value" style={{ color: 'var(--gold)' }}>
            ₹{summary.totalOrders > 0 ? Math.round(summary.totalVerifiedRevenueInRupees / (summary.successfulPayments || 1)).toLocaleString('en-IN') : '2,500'}
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h3>Daily Revenue Breakdown (Last 14 Days)</h3>
        {trends.length === 0 ? (
          <p style={{ color: '#64748b', padding: 12 }}>No daily trend data available yet.</p>
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
