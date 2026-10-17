import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import Button from '../components/atoms/Button';
import { Search } from 'lucide-react';

export const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCustomers({ search });
      if (res.success && res.data) {
        setCustomers(res.data.customers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', color: '#4A0F1B', fontSize: '1.85rem' }}>
          Devotee & Customer Directory
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: 4 }}>
          Search and review customer records, delivery addresses, and cumulative order history.
        </p>
      </div>

      <div className="admin-card" style={{ padding: 16 }}>
        <form onSubmit={(e) => { e.preventDefault(); fetchCustomers(); }} className="filter-bar" style={{ margin: 0 }}>
          <input
            type="text"
            placeholder="Search by devotee name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input"
            style={{ flex: 1, minWidth: 260 }}
          />
          <Button type="submit" variant="secondary">
            <Search size={15} style={{ marginRight: 6 }} /> Search
          </Button>
        </form>
      </div>

      <div className="admin-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Devotee Name</th>
                <th>Mobile Number</th>
                <th>Email Address</th>
                <th>Total Orders</th>
                <th>Total Spent (INR)</th>
                <th>Last Order Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#64748B' }}>
                    Loading devotee directory...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#64748B' }}>
                    No devotee records found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>{c.phone}</td>
                    <td>{c.email || '—'}</td>
                    <td>{c.totalOrders}</td>
                    <td style={{ fontWeight: 600 }}>₹{(c.totalSpentInPaise / 100).toLocaleString('en-IN')}</td>
                    <td>{new Date(c.lastOrderAt).toLocaleDateString('en-IN')}</td>
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

export default CustomersPage;
