# Sri Sankara TV E-Commerce Platform — REST API Documentation (v1)

Base URL: `/api/v1`

---

## 1. Public Storefront Endpoints

### 1.1 Get Active Product
- **Endpoint:** `GET /products` or `GET /products/:slug`
- **Description:** Retrieves the active Soora Samhara Pooja Box configuration, blessed contents, six-temple journey data, event details, and current server-side pricing.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "67b3...abc",
    "name": "Soora Samhara Pooja Box",
    "slug": "soora-samhara-pooja-box-2026",
    "tamilTitle": "சூரசம்ஹார பூஜை",
    "description": "Six vibhuti from the Arupadai temples, a Murugan keepsake statue, a rudraksh bracelet and chandan...",
    "priceInPaise": 250000,
    "currency": "INR",
    "minQuantity": 1,
    "maxQuantity": 20,
    "eventDate": "2026-11-15T00:00:00.000Z",
    "eventLocation": "Thiruttani",
    "contents": [
      { "qty": "6×", "title": "Vibhuti from the Arupadai temples", "description": "One packet from each of the six abodes of Lord Murugan." },
      { "qty": "1×", "title": "Murugan keepsake statue", "description": "Six inches tall, for your home altar." },
      { "qty": "1×", "title": "Rudraksh bracelet", "description": "Rudraksh beads strung as a bracelet." },
      { "qty": "1×", "title": "Chandan", "description": "For tilak and for your daily pooja." },
      { "qty": "1×", "title": "Authentication certificate", "description": "Issued by Sri Sankara TV with your box." }
    ],
    "temples": [
      { "ta": "திருப்பரங்குன்றம்", "en": "Thiruparankundram", "where": "Madurai", "isFinal": false },
      { "ta": "திருச்செந்தூர்", "en": "Thiruchendur", "where": "Thoothukudi", "isFinal": false },
      { "ta": "பழனி", "en": "Palani", "where": "Dindigul", "isFinal": false },
      { "ta": "சுவாமிமலை", "en": "Swamimalai", "where": "Thanjavur", "isFinal": false },
      { "ta": "பழமுதிர்சோலை", "en": "Pazhamudhirsolai", "where": "Madurai", "isFinal": false },
      { "ta": "திருத்தணி", "en": "Thiruttani", "where": "Tiruvallur", "isFinal": true, "flag": "Final Yaagam · 15 November" }
    ]
  }
}
```

---

### 1.2 Create Order Request
- **Endpoint:** `POST /orders`
- **Rate Limit:** 30 requests per 15 minutes per IP
- **Description:** Validates customer delivery information and quantity (1–20). Calculates total price on the server (`quantity * 250,000 paise`), creates a MongoDB `Order` and `Payment` record, and generates the Razorpay Order.
- **Request Body:**
```json
{
  "productSlug": "soora-samhara-pooja-box-2026",
  "quantity": 2,
  "customer": {
    "name": "Sundaram Iyer",
    "phone": "9840123456",
    "email": "sundaram@example.com",
    "address": "45 Sannadhi Street, Mylapore",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "pincode": "600004"
  }
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Order created successfully. Please complete payment.",
  "data": {
    "orderId": "67b3...def",
    "orderNumber": "SSK-2026-AB12CD",
    "razorpayOrderId": "order_Qz98...123",
    "amountInPaise": 500000,
    "amountInRupees": 5000,
    "currency": "INR",
    "keyId": "rzp_test_YourKeyId",
    "productName": "Soora Samhara Pooja Box",
    "quantity": 2,
    "customer": { "name": "Sundaram Iyer", "phone": "9840123456" }
  }
}
```

---

### 1.3 Verify Payment
- **Endpoint:** `POST /payments/verify`
- **Description:** Verifies the cryptographic HMAC-SHA256 signature returned by Razorpay Checkout. Confirms payment, marks the order as `PAID`, upserts the devotee customer profile, and dispatches Brevo transactional confirmation emails.
- **Request Body:**
```json
{
  "orderNumber": "SSK-2026-AB12CD",
  "razorpayOrderId": "order_Qz98...123",
  "razorpayPaymentId": "pay_Rt87...456",
  "razorpaySignature": "3b4f...d87"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment verified and order confirmed successfully",
  "data": {
    "orderNumber": "SSK-2026-AB12CD",
    "customerName": "Sundaram Iyer",
    "amountInRupees": 5000,
    "paymentStatus": "PAID",
    "orderStatus": "PAID",
    "razorpayPaymentId": "pay_Rt87...456"
  }
}
```

---

### 1.4 Razorpay Webhook Handler
- **Endpoint:** `POST /payments/webhook`
- **Headers:** `x-razorpay-signature: <hmac_hex>`
- **Description:** Verifies the raw body against `RAZORPAY_WEBHOOK_SECRET` using timing-safe HMAC-SHA256. Safely handles events (`payment.captured`, `payment.failed`, `order.paid`) with idempotency deduplication.
- **Response (200 OK):**
```json
{
  "success": true,
  "result": { "received": true, "eventType": "payment.captured" }
}
```

---

### 1.5 Track Order by Reference Number
- **Endpoint:** `GET /orders/:orderNumber/status`
- **Description:** Devotee self-service status lookup returning order progress, payment status, tracking number, and full historical timeline.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "orderNumber": "SSK-2026-AB12CD",
    "customerName": "Sundaram Iyer",
    "maskedPhone": "98******56",
    "deliveryCity": "Chennai",
    "deliveryState": "Tamil Nadu",
    "quantity": 2,
    "totalAmountInRupees": 5000,
    "currency": "INR",
    "orderStatus": "DISPATCHED",
    "paymentStatus": "PAID",
    "tracking": {
      "carrier": "India Post Speed Post",
      "trackingNumber": "SP987654321IN"
    },
    "timeline": [
      { "status": "CREATED", "note": "Order created for 2 box(es).", "timestamp": "2026-10-17T06:00:00Z" },
      { "status": "PAID", "note": "Payment verified via Razorpay.", "timestamp": "2026-10-17T06:05:00Z" },
      { "status": "DISPATCHED", "note": "Pooja box dispatched.", "timestamp": "2026-11-16T10:00:00Z" }
    ]
  }
}
```

---

## 2. Super Admin Endpoints (Protected)

Authentication via `Authorization: Bearer <jwt>` or HTTP-only `admin_token` cookie.

### 2.1 Admin Authentication
- `POST /admin/auth/login`: Admin authentication with email and password
- `POST /admin/auth/logout`: Clears session token
- `GET /admin/auth/me`: Current logged-in administrator profile

### 2.2 Executive Dashboard & Analytics
- `GET /admin/dashboard`: Metrics summary (total orders, strictly verified revenue, payment breakdown, status distribution, 10 recent orders)

### 2.3 Order Management
- `GET /orders/admin/list`: Paginated orders with search (order #, devotee name, phone, Razorpay ID), status filters, and date range
- `GET /orders/admin/export-csv`: Streams authorized order records as CSV attachment
- `GET /orders/admin/:id`: Full order record, gateway payment data, and timeline
- `PATCH /orders/admin/:id/status`: Updates fulfillment status (`PROCESSING`, `DISPATCHED`, `DELIVERED`, `CANCELLED`), carrier, and tracking number with audit logging

### 2.4 Payment & Gateway Management
- `GET /payments/admin/list`: List all gateway transactions with Razorpay Payment ID, method, bank/VPA, and status
- `POST /payments/admin/:id/reconcile`: Direct API check against Razorpay for pending transactions
- `POST /payments/admin/:id/refund`: Super Admin authorized refund via Razorpay refund API with audit logging

### 2.5 Product & Pricing
- `GET /products/admin/all`: List products
- `PATCH /products/admin/:id`: Update price in paise, active status, event target date, contents, and certificate text

### 2.6 Customer Directory
- `GET /admin/customers`: Customer profiles with total spend, order count, and contact information

### 2.7 Brevo Email Transmission Logs
- `GET /admin/email-logs`: Log history of receipts and alerts with Brevo Message IDs and statuses
- `POST /admin/email-logs/:id/retry`: Triggers retry for failed email deliveries

### 2.8 Staff & Settings
- `GET /admin/users` / `POST /admin/users`: Role-based staff management (`super_admin`, `order_manager`, `support_admin`)
- `GET /admin/settings` / `PATCH /admin/settings/:key`: Dynamic platform settings (countdown target date, WhatsApp desk, support contacts)
