# Sri Sankara TV E-Commerce Platform — Security Architecture & Hardening

## 1. Threat Model & Mitigations

### 1.1 Price Tampering & Client-Side Manipulation
- **Vulnerability:** Malicious actors modifying unit prices, quantities, or line totals in browser local state or HTTP payloads.
- **Enforcement:** The backend **never** trusts client-supplied totals. The server retrieves the active product catalog record from MongoDB, validates the unit price in integer paise (`250000`), verifies that quantity is an integer between 1 and 20, and computes `subtotal = qty * priceInPaise`. Razorpay orders are created strictly with this server-calculated value.

### 1.2 Payment Signature Forgery & Timing Attacks
- **Vulnerability:** Fabricating payment confirmations or exploiting timing differences in signature string comparison.
- **Enforcement:**
  - Razorpay payment signatures are validated using HMAC-SHA256 (`crypto.createHmac('sha256', secret).update(order_id + '|' + payment_id)`).
  - Byte lengths of the expected and actual buffers are validated first to avoid length exceptions, followed by `crypto.timingSafeEqual()` to guarantee constant-time verification immune to timing analysis attacks.

### 1.3 Webhook Replay & Duplicate Processing (Idempotency)
- **Vulnerability:** Network retries from Razorpay triggering multiple confirmation emails, duplicate payment records, or duplicate fulfillment jobs.
- **Enforcement:**
  - Raw body verification ensures signatures are computed against byte-accurate payloads before JSON parsing.
  - Every incoming webhook event ID (`event.id`) is recorded in the `Payment.webhookEventIds` array. If an event ID has already been logged, processing terminates immediately with an idempotent `200 OK` response.

### 1.4 Brute Force & Rate Limiting
- **Enforcement:**
  - Order creation endpoint `/api/v1/orders` is protected by `express-rate-limit` (max 30 requests per 15 minutes per IP).
  - Admin login endpoint `/api/v1/admin/auth/login` is restricted to 10 attempts per 15 minutes to block credential stuffing.

### 1.5 Authentication & Role-Based Access Control (RBAC)
- **Enforcement:**
  - Staff passwords are encrypted using bcrypt with salt rounds = 10.
  - JWT tokens are signed with cryptographically random secrets and expire in 7 days.
  - Granular RBAC gates administrative capabilities:
    - `super_admin`: Full access (refunds, settings, user management, order updates).
    - `order_manager`: Order fulfillment, courier tracking updates, payment reconciliation, CSV export.
    - `support_admin`: Read-only order and customer tracking lookups.

### 1.6 Audit Logging
- Every administrative action (order status transitions, refunds, product price changes, staff account creations) is permanently recorded in the `AuditLog` collection with actor ID, email, timestamp, IP address, and changed payload.
