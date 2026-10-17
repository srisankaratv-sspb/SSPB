export const ORDER_STATUS = {
  CREATED: 'CREATED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAID: 'PAID',
  PROCESSING: 'PROCESSING',
  DISPATCHED: 'DISPATCHED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  AUTHORIZED: 'AUTHORIZED',
  CAPTURED: 'CAPTURED',
  PAID: 'PAID',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED'
};

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ORDER_MANAGER: 'order_manager',
  SUPPORT_ADMIN: 'support_admin'
};

export const EMAIL_TEMPLATES = {
  ORDER_CREATED: 'ORDER_CREATED',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  ORDER_STATUS_UPDATE: 'ORDER_STATUS_UPDATE',
  REFUND_PROCESSED: 'REFUND_PROCESSED',
  ADMIN_NEW_ORDER_ALERT: 'ADMIN_NEW_ORDER_ALERT'
};

export const DEFAULT_PRODUCT = {
  name: 'Soora Samhara Pooja Box',
  slug: 'soora-samhara-pooja-box-2026',
  priceInPaise: 250000, // ₹2,500
  currency: 'INR',
  maxQuantityPerOrder: 20,
  minQuantityPerOrder: 1,
  eventDate: '2026-11-15T00:00:00+05:30',
  eventLocation: 'Thiruttani',
  eventTamilTitle: 'சூரசம்ஹார பூஜை'
};
