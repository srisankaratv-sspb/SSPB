import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import Button from '../components/atoms/Button';
import Badge from '../components/atoms/Badge';
import FormField from '../components/molecules/FormField';
import Modal from '../components/molecules/Modal';
import { UserPlus } from 'lucide-react';

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'order_manager'
  });
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await adminService.createUser(newUser);
      if (res.success) {
        alert('Staff account created successfully.');
        setShowAddModal(false);
        setNewUser({ name: '', email: '', password: '', role: 'order_manager' });
        fetchUsers();
      }
    } catch (err) {
      alert('Error creating staff account: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', color: '#4A0F1B', fontSize: '1.85rem' }}>
            Admin Staff & RBAC Accounts
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: 4 }}>
            Control staff authorization, permissions, and security roles.
          </p>
        </div>

        <Button onClick={() => setShowAddModal(true)}>
          <UserPlus size={16} style={{ marginRight: 6 }} /> Add Staff Account
        </Button>
      </div>

      <div className="admin-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Email Address</th>
                <th>Assigned Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#64748B' }}>
                    Loading staff directory...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="role-pill">
                        {u.role?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <Badge status={u.isActive ? 'PAID' : 'FAILED'}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('en-IN') : 'Never'}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Provision Staff Account"
      >
        <form onSubmit={handleAddSubmit} style={{ display: 'grid', gap: 14 }}>
          <FormField
            id="staff-name"
            label="Full Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            required
          />

          <FormField
            id="staff-email"
            label="Email Address"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
          />

          <FormField
            id="staff-pass"
            label="Password"
            type="password"
            placeholder="Minimum 8 characters"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            required
          />

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>
              Role
            </label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="admin-select"
              style={{ width: '100%' }}
            >
              <option value="order_manager">Order Manager (Manage Orders, Track Deliveries)</option>
              <option value="support_admin">Support Admin (Read-Only Customer Lookups)</option>
              <option value="super_admin">Super Admin (Full Administrative Authority)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={creating}>
              Create Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;
