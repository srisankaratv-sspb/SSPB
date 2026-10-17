import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import Badge from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import Modal from '../components/molecules/Modal';
import {
  Search,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eye,
  Package,
  IndianRupee,
  Clock,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  User,
  AlertTriangle
} from 'lucide-react';

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalBoxes: 0,
    totalRevenueInRupees: 0,
    paidCount: 0,
    pendingCount: 0
  });
  const [search, setSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminService.getOrders({
        page,
        limit: 15,
        search,
        orderStatus,
        paymentStatus
      });
      if (res.success && res.data) {
        setOrders(res.data.orders);
        setPagination(res.data.pagination);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [orderStatus, paymentStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders(1);
  };

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

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      const res = await adminService.deleteOrder(orderToDelete._id);
      if (res.success) {
        setToastMessage(`Order ${orderToDelete.orderNumber} permanently deleted.`);
        setOrderToDelete(null);
        setTimeout(() => setToastMessage(''), 4000);
        fetchOrders(pagination.page);
      }
    } catch (err) {
      alert('Failed to delete order: ' + (err.message || 'Server error'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            background: '#16A34A',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: 6,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
            fontWeight: 500
          }}
        >
          <CheckCircle size={18} />
          {toastMessage}
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', color: '#4A0F1B', fontSize: '1.85rem', margin: 0 }}>
            Order Management
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: 4 }}>
            Review, track, manage, and delete devotee pooja box reservations with real-time database details.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" onClick={handleExportCSV}>
            <Download size={15} style={{ marginRight: 6 }} /> Export CSV
          </Button>
          <Button variant="secondary" onClick={() => fetchOrders(pagination.page)}>
            <RefreshCw size={15} />
          </Button>
        </div>
      </div>

      {/* Metric Summary Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        <div className="admin-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: '#fef2f2', display: 'grid', placeItems: 'center', color: '#991b1b' }}>
            <Package size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Orders</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>
              {stats.totalOrders || pagination.total}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Live in database</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: '#fffbeb', display: 'grid', placeItems: 'center', color: '#b45309' }}>
            <Package size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pooja Boxes Booked</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>
              {stats.totalBoxes}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Units requested</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: '#f0fdf4', display: 'grid', placeItems: 'center', color: '#15803d' }}>
            <IndianRupee size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Offerings</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>
              ₹{Number(stats.totalRevenueInRupees || 0).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#15803d' }}>{stats.paidCount} paid orders</div>
          </div>
        </div>

        <div className="admin-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: '#fff7ed', display: 'grid', placeItems: 'center', color: '#c2410c' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Checkout</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>
              {stats.pendingCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#c2410c' }}>Awaiting payment</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card" style={{ padding: 16 }}>
        <form onSubmit={handleSearchSubmit} className="filter-bar" style={{ margin: 0 }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <input
              type="text"
              placeholder="Search by order #, devotee name, phone, Razorpay ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input"
              style={{ width: '100%', paddingLeft: 34 }}
            />
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>

          <select
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
            className="admin-select"
          >
            <option value="">All Fulfillment Statuses</option>
            <option value="CREATED">Created</option>
            <option value="PAYMENT_PENDING">Payment Pending</option>
            <option value="PAID">Paid</option>
            <option value="PROCESSING">Processing</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="admin-select"
          >
            <option value="">All Payment Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid / Captured</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </div>

      {/* Orders Table */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #f1f5f9' }}>
          <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem' }}>
            Total Orders: <strong style={{ color: '#4A0F1B' }}>{pagination.total}</strong>
          </span>
          <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Showing {orders.length} order records on page {pagination.page}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Devotee Name</th>
                <th>Phone</th>
                <th>City, State</th>
                <th>Qty</th>
                <th>Total (INR)</th>
                <th>Payment</th>
                <th>Fulfillment</th>
                <th>Date</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: 24, color: '#64748B' }}>
                    Loading orders from database...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: 24, color: '#64748B' }}>
                    No matching orders found in the database.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id}>
                    <td>
                      <button
                        type="button"
                        onClick={() => setSelectedOrderForDetails(ord)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          fontWeight: 600,
                          color: '#4A0F1B',
                          textDecoration: 'underline'
                        }}
                        title="Click to view full details"
                      >
                        {ord.orderNumber}
                      </button>
                    </td>
                    <td>{ord.customer?.name}</td>
                    <td>{ord.customer?.phone}</td>
                    <td>{ord.customer?.city}, {ord.customer?.state}</td>
                    <td>{ord.quantity}</td>
                    <td style={{ fontWeight: 600 }}>₹{(ord.totalAmountInPaise / 100).toLocaleString('en-IN')}</td>
                    <td><Badge status={ord.paymentStatus} /></td>
                    <td><Badge status={ord.orderStatus} /></td>
                    <td>{new Date(ord.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        {/* View Full Details Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForDetails(ord)}
                          title="View Full Details"
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            borderRadius: 4,
                            padding: '4px 8px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: '0.8rem',
                            color: '#334155'
                          }}
                        >
                          <Eye size={14} /> Details
                        </button>

                        {/* Manage Order Link */}
                        <Link
                          to={`/admin/orders/${ord._id}`}
                          style={{
                            background: '#fffbeb',
                            border: '1px solid #fde68a',
                            borderRadius: 4,
                            padding: '4px 8px',
                            color: '#8A3A12',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            textDecoration: 'none'
                          }}
                        >
                          Manage
                        </Link>

                        {/* Delete Order Button */}
                        <button
                          type="button"
                          onClick={() => setOrderToDelete(ord)}
                          title="Delete Order"
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: 4,
                            padding: '4px 8px',
                            cursor: 'pointer',
                            color: '#dc2626',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Showing {orders.length} of {pagination.total} orders (Page {pagination.page} of {pagination.pages})
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                variant="secondary"
                disabled={pagination.page <= 1}
                onClick={() => fetchOrders(pagination.page - 1)}
              >
                <ChevronLeft size={16} /> Prev
              </Button>
              <Button
                variant="secondary"
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchOrders(pagination.page + 1)}
              >
                Next <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* FULL DETAILS MODAL */}
      {selectedOrderForDetails && (
        <Modal
          isOpen={Boolean(selectedOrderForDetails)}
          onClose={() => setSelectedOrderForDetails(null)}
          title={`Full Order Details — ${selectedOrderForDetails.orderNumber}`}
          maxWidth={650}
        >
          <div style={{ fontSize: '0.9rem', color: '#334155' }}>
            {/* Status and Ref Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8F9FA', padding: 12, borderRadius: 6, marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block' }}>Order Reference</span>
                <strong style={{ fontSize: '1.1rem', color: '#4A0F1B' }}>{selectedOrderForDetails.orderNumber}</strong>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>ID: {selectedOrderForDetails._id}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <Badge status={selectedOrderForDetails.paymentStatus} />
                <Badge status={selectedOrderForDetails.orderStatus} />
              </div>
            </div>

            {/* Devotee Info */}
            <div style={{ marginBottom: 16, border: '1px solid #e2e8f0', borderRadius: 6, padding: 12 }}>
              <h4 style={{ margin: '0 0 10px', color: '#1E293B', display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={16} color="#4A0F1B" /> Devotee Information
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Full Name</span>
                  <div style={{ fontWeight: 600 }}>{selectedOrderForDetails.customer?.name}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Phone / Mobile</span>
                  <div style={{ fontWeight: 600 }}>{selectedOrderForDetails.customer?.phone}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Email Address</span>
                  <div>{selectedOrderForDetails.customer?.email || 'N/A'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Pincode</span>
                  <div style={{ fontWeight: 600 }}>{selectedOrderForDetails.customer?.pincode}</div>
                </div>
              </div>

              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={13} /> Complete Delivery Address
                </span>
                <div style={{ marginTop: 2, lineHeight: 1.4 }}>
                  {selectedOrderForDetails.customer?.address}, {selectedOrderForDetails.customer?.city}, {selectedOrderForDetails.customer?.state} – {selectedOrderForDetails.customer?.pincode}
                </div>
              </div>
            </div>

            {/* Order Items & Quantities */}
            <div style={{ marginBottom: 16, border: '1px solid #e2e8f0', borderRadius: 6, padding: 12 }}>
              <h4 style={{ margin: '0 0 10px', color: '#1E293B', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Package size={16} color="#4A0F1B" /> Pooja Box Details
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <strong>Sri Sankara TV – Soora Samhara Pooja Box 2026</strong>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Includes 6 Vibhuti packets, Murugan idol, Rudraksh, Chandan & Certificate</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>{selectedOrderForDetails.quantity} box(es)</strong>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>₹2,500 / box</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, fontWeight: 700, fontSize: '1rem', color: '#1E293B' }}>
                <span>Total Offering Amount:</span>
                <span style={{ color: '#4A0F1B' }}>₹{(selectedOrderForDetails.totalAmountInPaise / 100).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment & Gateway Data */}
            <div style={{ marginBottom: 16, border: '1px solid #e2e8f0', borderRadius: 6, padding: 12 }}>
              <h4 style={{ margin: '0 0 10px', color: '#1E293B' }}>Payment & Gateway Records</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.82rem' }}>
                <div>
                  <span style={{ color: '#64748B' }}>Razorpay Order ID:</span>
                  <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedOrderForDetails.razorpayOrderId || 'N/A'}</div>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>Razorpay Payment ID:</span>
                  <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedOrderForDetails.razorpayPaymentId || 'N/A'}</div>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>Booked On:</span>
                  <div>{new Date(selectedOrderForDetails.createdAt).toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>Last Updated:</span>
                  <div>{new Date(selectedOrderForDetails.updatedAt).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>

            {/* Action Bar inside Modal */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <Button variant="secondary" onClick={() => setSelectedOrderForDetails(null)}>
                Close
              </Button>
              <Link to={`/admin/orders/${selectedOrderForDetails._id}`} className="admin-btn admin-btn-primary" style={{ textDecoration: 'none' }}>
                Manage Fulfillment
              </Link>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM DELETE MODAL */}
      {orderToDelete && (
        <Modal
          isOpen={Boolean(orderToDelete)}
          onClose={() => !isDeleting && setOrderToDelete(null)}
          title="Confirm Permanent Deletion"
          maxWidth={460}
        >
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fef2f2', display: 'grid', placeItems: 'center', margin: '0 auto 16px', color: '#dc2626' }}>
              <AlertTriangle size={28} />
            </div>
            <h3 style={{ margin: '0 0 8px', color: '#1E293B', fontSize: '1.2rem' }}>
              Delete Order {orderToDelete.orderNumber}?
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 20px' }}>
              Are you sure you want to permanently delete this order for <strong>{orderToDelete.customer?.name}</strong>?
              This will remove all associated payment and courier tracking data from MongoDB. This action <strong>cannot be undone</strong>.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <Button
                variant="secondary"
                disabled={isDeleting}
                onClick={() => setOrderToDelete(null)}
              >
                Cancel
              </Button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteOrder}
                style={{
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '9px 18px',
                  fontWeight: 600,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.7 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Trash2 size={16} />
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrdersPage;
