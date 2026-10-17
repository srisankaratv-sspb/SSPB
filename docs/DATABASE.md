# Sri Sankara TV E-Commerce Platform — Database Architecture (MongoDB / Mongoose)

## 1. Overview
The platform utilizes MongoDB via Mongoose with strict schema validation, integer-paise financial precision, immutable order snapshots, and comprehensive audit trails.

---

## 2. Entity Collections & Schemas

### 2.1 Products (`products`)
Stores the master product catalog, sacred item lists, pilgrimage temples, and pricing.
- `_id`: ObjectId
- `name`: String (e.g. "Soora Samhara Pooja Box")
- `slug`: String (unique index, e.g. "soora-samhara-pooja-box-2026")
- `tamilTitle`: String ("சூரசம்ஹார பூஜை")
- `description`: String
- `priceInPaise`: Number (e.g. 250000 = ₹2,500.00)
- `currency`: String ("INR")
- `minQuantity`: Number (default: 1)
- `maxQuantity`: Number (default: 20)
- `isActive`: Boolean (index)
- `stockCapacity`: Number (null for unlimited)
- `reservedCount`: Number
- `eventDate`: Date (default: 2026-11-15T00:00:00+05:30)
- `eventLocation`: String ("Thiruttani")
- `contents`: Array of `{ qty, title, description }`
- `temples`: Array of `{ ta, en, where, isFinal, flag }`
- `certificateConfig`: `{ authority, title, subtitle, sealText, caption, verificationPoints }`
- `createdAt`, `updatedAt`: Timestamps

### 2.2 Orders (`orders`)
Stores individual devotee reservations with immutable pricing snapshots, fulfillment state, and delivery info.
- `_id`: ObjectId
- `orderNumber`: String (unique index, e.g. "SSK-2026-XXXXXX")
- `customerId`: ObjectId (ref: `Customer`)
- `customer`:
  - `name`: String
  - `phone`: String (index)
  - `email`: String (optional)
  - `address`: String
  - `city`: String
  - `state`: String
  - `pincode`: String
- `productId`: ObjectId (ref: `Product`)
- `productName`: String (immutable snapshot)
- `quantity`: Number (1–20)
- `unitPriceInPaise`: Number (immutable snapshot)
- `subtotalInPaise`: Number
- `deliveryChargeInPaise`: Number (0)
- `discountInPaise`: Number (0)
- `totalAmountInPaise`: Number
- `currency`: String ("INR")
- `paymentStatus`: Enum `['PENDING', 'AUTHORIZED', 'CAPTURED', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED']` (index)
- `orderStatus`: Enum `['CREATED', 'PAYMENT_PENDING', 'PAID', 'PROCESSING', 'DISPATCHED', 'DELIVERED', 'CANCELLED']` (index)
- `razorpayOrderId`: String (index)
- `razorpayPaymentId`: String (index)
- `razorpaySignature`: String
- `notificationStatus`: `{ customerEmailSent, adminAlertSent, lastEmailSentAt, failureReason }`
- `tracking`: `{ carrier, trackingNumber, dispatchedAt, deliveredAt }`
- `refund`: `{ isRefunded, amountInPaise, reason, refundedAt, razorpayRefundId }`
- `timeline`: Array of `{ status, note, timestamp, updatedBy }`
- `createdAt`, `updatedAt`: Timestamps

### 2.3 Payments (`payments`)
Gateway transactions received from Razorpay.
- `_id`: ObjectId
- `internalPaymentId`: String (unique index, e.g. "PAY-SSK-2026-XXXX")
- `orderId`: ObjectId (ref: `Order`, index)
- `orderNumber`: String (index)
- `razorpayOrderId`: String (index)
- `razorpayPaymentId`: String (index)
- `razorpaySignature`: String
- `amountInPaise`: Number
- `currency`: String ("INR")
- `status`: Enum `['PENDING', 'AUTHORIZED', 'CAPTURED', 'PAID', 'FAILED', 'REFUNDED']` (index)
- `method`: String (upi, card, netbanking, wallet)
- `bank`: String
- `wallet`: String
- `vpa`: String
- `email`: String
- `contact`: String
- `webhookEventIds`: Array of String (deduplication / idempotency)
- `rawGatewayResponse`: Mixed
- `verifiedAt`: Date
- `isReconciled`: Boolean
- `reconciledAt`: Date

### 2.4 Customers (`customers`)
Devotee directory built automatically from verified orders.
- `_id`: ObjectId
- `name`: String
- `phone`: String (unique index)
- `email`: String (index)
- `addresses`: Array of `{ address, city, state, pincode }`
- `totalOrders`: Number
- `totalSpentInPaise`: Number
- `lastOrderAt`: Date

### 2.5 AdminUsers (`adminusers`)
Super Admin and staff authentication records.
- `_id`: ObjectId
- `name`: String
- `email`: String (unique index, lowercase)
- `passwordHash`: String (bcrypt hash)
- `role`: Enum `['super_admin', 'order_manager', 'support_admin']` (index)
- `isActive`: Boolean
- `lastLoginAt`: Date
- `lastLoginIp`: String

### 2.6 EmailLogs (`emaillogs`)
Brevo transactional email delivery audit logs.
- `_id`: ObjectId
- `orderId`: ObjectId (ref: `Order`, index)
- `orderNumber`: String (index)
- `recipientEmail`: String (index)
- `recipientName`: String
- `templateType`: String (index)
- `subject`: String
- `brevoMessageId`: String (index)
- `status`: Enum `['PENDING', 'SENT', 'DELIVERED', 'FAILED']` (index)
- `retryCount`: Number
- `errorMessage`: String
- `sentAt`: Date

### 2.7 AuditLogs (`auditlogs`)
Administrative security tracking for changes to orders, products, refunds, and settings.
- `_id`: ObjectId
- `adminUserId`: ObjectId (ref: `AdminUser`, index)
- `adminEmail`: String (index)
- `action`: String (index, e.g. "UPDATE_ORDER_STATUS", "REFUND_PAYMENT")
- `resourceType`: String (index)
- `resourceId`: String (index)
- `changes`: Mixed
- `ipAddress`: String
- `userAgent`: String

### 2.8 Settings (`settings`)
Dynamic platform parameters.
- `key`: String (unique index, e.g. "countdown_target_date", "order_desk_whatsapp")
- `value`: Mixed
- `category`: String
- `description`: String
- `isPublic`: Boolean

---

## 3. Database Indexing Strategy
To ensure zero latency during high-traffic surges:
1. `orders`: compound indexes on `{ orderStatus: 1, createdAt: -1 }`, `{ paymentStatus: 1, createdAt: -1 }`
2. `payments`: index on `razorpayPaymentId`, `razorpayOrderId`, `internalPaymentId`
3. `customers`: unique index on `phone`
4. `emailLogs`: compound index on `{ orderId: 1, templateType: 1 }` for instant idempotency checks.
