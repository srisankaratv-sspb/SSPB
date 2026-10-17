import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { Badge } from '../../components/atoms/Badge';
import { Button } from '../../components/atoms/Button';
import { useAdminAuth } from '../../context/AdminAuthContext';
import {
  ArrowLeft,
  Truck,
  RotateCcw,
  Mail,
  ShieldCheck,
  Calendar,
  User,
  MapPin,
  CreditCard,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export const OrderDetailsPage = () => {
  const { id } = useParams();
  const { adminUser } = useAdminAuth();

  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    trackingNumber: '',
    carrier: '',
    note: ''
  });
  const [refundReason, setRefundReason] = useState('');
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState('');

  const handleDeleteOrder = async () => {
    setIsDeleting(true);
    try {
      const res = await adminService.deleteOrder(order._id);
      if (res.success) {
        alert(`Order ${order.orderNumber} deleted successfully.`);
        navigate('/admin/orders');
      }
    } catch (err) {
      alert('Failed to delete order: ' + (err.message || 'Server error'));
      setIsDeleting(false);
    }
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await adminService.getOrderById(id);
      if (res.success && res.data) {
        setOrder(res.data.order);
        setPayment(res.data.payment);
        setStatusUpdate({
          status: res.data.order.orderStatus,
          trackingNumber: res.data.order.tracking?.trackingNumber || '',
          carrier: res.data.order.tracking?.carrier || '',
          note: ''
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage('');
    try {
      const res = await adminService.updateOrderStatus(id, statusUpdate);
      if (res.success) {
        setMessage('Order fulfillment status updated successfully.');
        fetchOrder();
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    if (!payment) return;

    if (!window.confirm(`Are you sure you want to refund ₹${(order.totalAmountInPaise / 100).toLocaleString('en-IN')} for order ${order.orderNumber}?`)) {
      return;
    }

    setIsRefunding(true);
    try {
      const res = await adminService.refundPayment(payment._id, { reason: refundReason });
      if (res.success) {
        alert('Refund processed successfully.');
        setShowRefundModal(false);
        fetchOrder();
      }
    } catch (err) {
      alert('Refund failed: ' + err.message);
    } finally {
      setIsRefunding(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading order details...</div>;
  }

  if (!order) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Order not found.</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Link
          to="/admin/orders"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: '#64748b',
            textDecoration: 'none',
            fontSize: '0.9rem',
            marginBottom: 12
          }}
        >
          <ArrowLeft size={16} /> Back to Orders
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--head)', fontSize: '1.8rem', margin: 0 }}>
              {order.orderNumber}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: 4 }}>
              Created on {new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {payment && payment.status === 'CAPTURED' && adminUser?.role === 'super_admin' && (
              <Button
                variant="alt"
                onClick={() => setShowRefundModal(true)}
                style={{ borderColor: 'var(--err)', color: 'var(--err)' }}
              >
                <RotateCcw size={15} style={{ marginRight: 6 }} /> Initiate Refund
              </Button>
            )}
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              style={{
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '8px 14px',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Trash2 size={15} /> Delete Order
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div style={{ padding: 12, background: '#DCFCE7', color: '#166534', borderRadius: 4, marginBottom: 20 }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 0.9fr)', gap: 24 }}>
        {/* Left Column: Details */}
        <div>
          {/* Order Snapshot Card */}
          <div className="admin-card">
            <h3>Items & Pricing Snapshot</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <strong>{order.productName}</strong>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                  Blessed items from Arupadai temples + Yaagam
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span>{order.quantity} × ₹{(order.unitPriceInPaise / 100).toLocaleString('en-IN')}</span>
                <p style={{ fontWeight: 600, margin: 0 }}>₹{(order.subtotalInPaise / 100).toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', fontWeight: 700, fontSize: '1.1rem' }}>
              <span>Total Amount Paid</span>
              <span style={{ color: 'var(--head)' }}>₹{(order.totalAmountInPaise / 100).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Devotee Info */}
          <div className="admin-card">
            <h3><User size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Devotee Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Full Name</span>
                <p style={{ fontWeight: 600, margin: '2px 0 0' }}>{order.customer?.name}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Mobile Number</span>
                <p style={{ fontWeight: 600, margin: '2px 0 0' }}>{order.customer?.phone}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Email Address</span>
                <p style={{ fontWeight: 600, margin: '2px 0 0' }}>{order.customer?.email || 'None provided'}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Delivery Pincode</span>
                <p style={{ fontWeight: 600, margin: '2px 0 0' }}>{order.customer?.pincode}</p>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Delivery Address</span>
              <p style={{ fontWeight: 500, margin: '4px 0 0', lineHeight: 1.5 }}>
                {order.customer?.address}, {order.customer?.city}, {order.customer?.state} - {order.customer?.pincode}
              </p>
            </div>
          </div>

          {/* Payment Gateway Verification */}
          <div className="admin-card">
            <h3><CreditCard size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Gateway Verification Data</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Payment Status</span>
                <div style={{ marginTop: 4 }}><Badge status={order.paymentStatus} /></div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Razorpay Payment ID</span>
                <p style={{ fontFamily: 'monospace', fontWeight: 600, margin: '4px 0 0', fontSize: '0.88rem' }}>
                  {order.razorpayPaymentId || 'N/A'}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Razorpay Order ID</span>
                <p style={{ fontFamily: 'monospace', margin: '4px 0 0', fontSize: '0.88rem' }}>
                  {order.razorpayOrderId || 'N/A'}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Payment Method</span>
                <p style={{ textTransform: 'uppercase', fontWeight: 600, margin: '4px 0 0' }}>
                  {payment?.method || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="admin-card">
            <h3>Lifecycle Timeline</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              {order.timeline?.map((t, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 12, paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--gold)', marginTop: 6 }}></div>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{t.status}</span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: 8 }}>
                      by {t.updatedBy} · {new Date(t.timestamp).toLocaleString('en-IN')}
                    </span>
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: '4px 0 0' }}>{t.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Status Update Controls */}
        <div>
          <div className="admin-card">
            <h3>Update Fulfillment Status</h3>
            <form onSubmit={handleStatusSubmit} style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                  Fulfillment Status
                </label>
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                  className="filter-input"
                  style={{ width: '100%' }}
                >
                  <option value="CREATED">CREATED</option>
                  <option value="PAYMENT_PENDING">PAYMENT_PENDING</option>
                  <option value="PAID">PAID</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="DISPATCHED">DISPATCHED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                  Courier / Carrier
                </label>
                <input
                  type="text"
                  placeholder="e.g. India Post / DTDC / BlueDart"
                  value={statusUpdate.carrier}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, carrier: e.target.value })}
                  className="filter-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                  Tracking Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. IN123456789"
                  value={statusUpdate.trackingNumber}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, trackingNumber: e.target.value })}
                  className="filter-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                  Audit Log Note
                </label>
                <textarea
                  placeholder="Reason or notes regarding this status change..."
                  value={statusUpdate.note}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, note: e.target.value })}
                  className="filter-input"
                  rows={3}
                  style={{ width: '100%' }}
                />
              </div>

              <Button type="submit" loading={isUpdating}>
                Save Status Update
              </Button>
            </form>
          </div>

          {/* Email Notification Status */}
          <div className="admin-card">
            <h3><Mail size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Brevo Email Status</h3>
            <div style={{ display: 'grid', gap: 8, fontSize: '0.9rem' }}>
              <div>
                <span>Customer Receipt: </span>
                <strong>{order.notificationStatus?.customerEmailSent ? 'Sent' : 'Not Sent'}</strong>
              </div>
              <div>
                <span>Admin Alert: </span>
                <strong>{order.notificationStatus?.adminAlertSent ? 'Delivered' : 'Pending'}</strong>
              </div>
              {order.notificationStatus?.lastEmailSentAt && (
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Last notification: {new Date(order.notificationStatus.lastEmailSentAt).toLocaleString('en-IN')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1000,
            padding: 20
          }}
        >
          <div className="admin-card" style={{ maxWidth: 460, width: '100%', margin: 0 }}>
            <h3 style={{ color: 'var(--err)' }}>Confirm Refund via Razorpay</h3>
            <p style={{ fontSize: '0.9rem', color: '#475569' }}>
              This will initiate an authorized refund of <strong>₹{(order.totalAmountInPaise / 100).toLocaleString('en-IN')}</strong> to the customer's original payment method and update the order record.
            </p>
            <form onSubmit={handleRefundSubmit}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, margin: '12px 0 4px' }}>
                Reason for Refund
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="e.g. Customer requested cancellation before dispatch"
                className="filter-input"
                style={{ width: '100%' }}
                rows={3}
                required
              />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
                <Button variant="alt" onClick={() => setShowRefundModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={isRefunding} style={{ background: 'var(--err)', color: '#fff' }}>
                  Process Refund
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Order Confirmation Modal */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1000,
            padding: 16
          }}
          onClick={() => !isDeleting && setShowDeleteModal(false)}
        >
          <div
            className="admin-card"
            style={{
              width: '100%',
              maxWidth: 450,
              margin: 0,
              background: '#fff',
              borderRadius: 8,
              padding: 24,
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fef2f2', display: 'grid', placeItems: 'center', margin: '0 auto 16px', color: '#dc2626' }}>
              <AlertTriangle size={28} />
            </div>
            <h3 style={{ margin: '0 0 8px', color: '#1E293B', fontSize: '1.2rem' }}>
              Delete Order {order.orderNumber}?
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 20px' }}>
              Are you sure you want to permanently delete this order for <strong>{order.customer?.name}</strong>?
              This will remove all associated payment and courier tracking data from MongoDB. This action <strong>cannot be undone</strong>.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <Button
                variant="alt"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
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
        </div>
      )}
    </div>
  );
};

export default OrderDetailsPage;
