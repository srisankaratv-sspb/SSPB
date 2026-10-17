import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';
import Badge from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import Modal from '../components/molecules/Modal';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, User, CreditCard, RotateCcw, Mail, Truck, Trash2, AlertTriangle } from 'lucide-react';

export const OrderDetailsPage = () => {
  const { id } = useParams();
  const { adminUser } = useAuth();

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
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
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

    if (!window.confirm(`Initiate authorized refund of ₹${(order.totalAmountInPaise / 100).toLocaleString('en-IN')}?`)) {
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

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading order details...</div>;
  if (!order) return <div style={{ padding: 40, textAlign: 'center' }}>Order not found.</div>;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Link
          to="/admin/orders"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: '#64748B',
            fontSize: '0.88rem',
            marginBottom: 12
          }}
        >
          <ArrowLeft size={16} /> Back to Orders
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', color: '#4A0F1B', fontSize: '1.85rem' }}>
              {order.orderNumber}
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: 4 }}>
              Created on {new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {payment && payment.status === 'CAPTURED' && adminUser?.role === 'super_admin' && (
              <Button
                variant="danger"
                onClick={() => setShowRefundModal(true)}
              >
                <RotateCcw size={15} style={{ marginRight: 6 }} /> Authorize Refund
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
        <div>
          {/* Order Snapshot Card */}
          <div className="admin-card">
            <h3>Items & Pricing Snapshot</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <strong>{order.productName}</strong>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
                  Blessed items from Arupadai temples + Thiruttani Yaagam
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span>{order.quantity} × ₹{(order.unitPriceInPaise / 100).toLocaleString('en-IN')}</span>
                <p style={{ fontWeight: 600, margin: 0 }}>₹{(order.subtotalInPaise / 100).toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', fontWeight: 700, fontSize: '1.1rem' }}>
              <span>Total Amount Paid</span>
              <span style={{ color: '#4A0F1B' }}>₹{(order.totalAmountInPaise / 100).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Devotee Info */}
          <div className="admin-card">
            <h3><User size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Devotee Delivery Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Full Name</span>
                <p style={{ fontWeight: 600, margin: '2px 0 0' }}>{order.customer?.name}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Mobile Number</span>
                <p style={{ fontWeight: 600, margin: '2px 0 0' }}>{order.customer?.phone}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Email</span>
                <p style={{ fontWeight: 600, margin: '2px 0 0' }}>{order.customer?.email || 'None provided'}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Pincode</span>
                <p style={{ fontWeight: 600, margin: '2px 0 0' }}>{order.customer?.pincode}</p>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Address</span>
              <p style={{ fontWeight: 500, margin: '4px 0 0' }}>
                {order.customer?.address}, {order.customer?.city}, {order.customer?.state} - {order.customer?.pincode}
              </p>
            </div>
          </div>

          {/* Gateway Verification Data */}
          <div className="admin-card">
            <h3><CreditCard size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Razorpay Gateway Verification</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Payment Status</span>
                <div style={{ marginTop: 4 }}><Badge status={order.paymentStatus} /></div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Payment ID</span>
                <p style={{ fontFamily: 'monospace', fontWeight: 600, margin: '4px 0 0' }}>
                  {order.razorpayPaymentId || 'N/A'}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Gateway Order ID</span>
                <p style={{ fontFamily: 'monospace', margin: '4px 0 0' }}>
                  {order.razorpayOrderId || 'N/A'}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Method</span>
                <p style={{ textTransform: 'uppercase', fontWeight: 600, margin: '4px 0 0' }}>
                  {payment?.method || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="admin-card">
            <h3>Fulfillment & Audit Timeline</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              {order.timeline?.map((t, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 12, paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#B8862B', marginTop: 6 }}></div>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{t.status}</span>
                    <span style={{ fontSize: '0.78rem', color: '#64748B', marginLeft: 8 }}>
                      by {t.updatedBy} · {new Date(t.timestamp).toLocaleString('en-IN')}
                    </span>
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: '4px 0 0' }}>{t.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Fulfillment Controls */}
        <div>
          <div className="admin-card">
            <h3>Update Fulfillment Status</h3>
            <form onSubmit={handleStatusSubmit} style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                  Status
                </label>
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                  className="admin-select"
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
                  className="admin-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
                  Tracking Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. SP123456789IN"
                  value={statusUpdate.trackingNumber}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, trackingNumber: e.target.value })}
                  className="admin-input"
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
                  className="admin-textarea"
                  rows={3}
                  style={{ width: '100%' }}
                />
              </div>

              <Button type="submit" loading={isUpdating}>
                Save Status Update
              </Button>
            </form>
          </div>

          <div className="admin-card">
            <h3><Mail size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Brevo Email Dispatch</h3>
            <div style={{ display: 'grid', gap: 8, fontSize: '0.9rem' }}>
              <div>Customer Confirmation: <strong>{order.notificationStatus?.customerEmailSent ? 'Sent' : 'None'}</strong></div>
              <div>Admin Alert: <strong>{order.notificationStatus?.adminAlertSent ? 'Delivered' : 'Pending'}</strong></div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        title="Authorize Refund via Razorpay"
      >
        <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: 14 }}>
          This will issue a refund of <strong>₹{(order.totalAmountInPaise / 100).toLocaleString('en-IN')}</strong> to the devotee's original payment method and update the order state.
        </p>
        <form onSubmit={handleRefundSubmit}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>
            Reason for Refund
          </label>
          <textarea
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            placeholder="e.g. Cancellation requested by customer before dispatch"
            className="admin-textarea"
            rows={3}
            style={{ width: '100%', marginBottom: 16 }}
            required
          />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setShowRefundModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" loading={isRefunding}>
              Process Refund
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Order Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => !isDeleting && setShowDeleteModal(false)}
          title="Confirm Permanent Deletion"
          maxWidth={460}
        >
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
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
                variant="secondary"
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
        </Modal>
      )}
    </div>
  );
};

export default OrderDetailsPage;
