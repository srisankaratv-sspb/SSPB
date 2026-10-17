# Sri Sankara TV — Soora Samhara Pooja Box 2026 E-Commerce Platform

A production-ready, full-stack e-commerce application converted from the official **Sri Sankara TV – Soora Samhara Pooja Box 2026** landing page. Built with **three clearly separated parts: Customer Frontend, Shared Backend API, and Independent Super Admin Portal**.

- **Customer Frontend (`frontend/`):** React 18 + Vite SPA, Atomic Design methodology
- **Shared Backend API (`backend/`):** Node.js, Express.js REST API, MongoDB with Mongoose
- **Super Admin Portal (`super-admin/`):** Independent React 18 + Vite administration application
- **Integrations:** Razorpay Payment Gateway, Brevo Transactional Email

---

## 🌟 Core Highlights & Architectural Principles

1. **Exact Visual & Functional Fidelity:**
   - 100% preservation of the original HTML/CSS visual identity, layout, colors (`#2F0A12` maroon, `#E4B655` hero gold, `#D9731A` saffron, `#FAF4E8` ivory paper), typography (*Marcellus*, *Mukta*, *Noto Serif Tamil*), and responsive breakpoints.
   - Preserves the authentic SVG hero box illustration (6 vibhuti packets, Murugan keepsake statue, rudraksh bracelet, chandan, authentication certificate).
   - Recreates the six-temple pilgrimage cards and highlighted Thiruttani final Yaagam card.
   - Dynamic countdown to 15 November 2026 (IST) with live day calculations.
   - Two-column order desk with quantity stepper (1–20), real-time line total calculations, Indian mobile phone validation, and state defaults.

2. **Enterprise Payment & Security Architecture:**
   - **Razorpay Checkout Integration:** End-to-end integration with server-side price calculation in integer paise (`₹2,500 = 250,000 paise`). The server **never** trusts client-supplied prices.
   - **Timing-Safe HMAC-SHA256 Verification:** Verifies signatures using `crypto.timingSafeEqual()` with length check safeguards.
   - **Idempotent Webhooks:** Raw body webhook handler with event deduplication to eliminate duplicate orders or confirmations.
   - **Automated Reconciliations & Refunds:** Authorized server-side refunds and gateway state reconciliations.

3. **Brevo Transactional Email Integration:**
   - Automated receipts dispatched upon payment confirmation with order summary and delivery details.
   - Admin alert emails notifying the order desk of new paid orders.
   - Full delivery audit logging in MongoDB with retry capabilities for transient errors.

4. **Dedicated Independent Super Admin Portal (`super-admin/`):**
   - Runs independently on port 5174 with complete administrative tooling.
   - **Executive Dashboard:** Live KPIs (Total Orders, Strictly Verified Revenue, Successful, Pending, Failed, and Refunded transactions).
   - **Order Management:** Search, status filtering, fulfillment status updates, courier tracking numbers, and CSV export.
   - **Product & Inventory Management:** Edit price, sales status, descriptions, and stock status.
   - **Devotee Directory:** Comprehensive customer purchase history.
   - **Payments & Refunds:** Reconcile gateway transactions and issue authorized refunds.
   - **Brevo Email Logs:** Audit delivered, failed, and queued transactional emails with retry triggers.
   - **Content Management:** Manage certificate content, pilgrimage details, and pooja box items.
   - **Staff & RBAC:** Role-based access control (`super_admin`, `order_manager`, `support_admin`).
   - **Platform Settings & Audit Logs:** Configurable countdown target date, WhatsApp desk number, support channels, and immutable security audit logs.

---

## 📂 Project Structure (Atomic Design Monorepo)

```text
sri-sankara-commerce/
│
├── frontend/                     # Public customer website (Port 5173)
│   ├── src/
│   │   ├── components/
│   │   │   ├── atoms/            # Button, Input, Label, Typography, Badge, Spinner
│   │   │   ├── molecules/        # FormField, QuantityStepper, PriceDisplay, OrderSummary, TempleCard, CertificateCard
│   │   │   ├── organisms/        # Header, HeroSection, ProductContents, TempleJourney, CertificateSection, OrderForm, Footer
│   │   │   └── templates/        # PublicLayout
│   │   ├── pages/
│   │   │   ├── HomePage.jsx              # Landing page with full interactive order desk
│   │   │   ├── PaymentResultPage.jsx     # Payment success blessings / failure handler
│   │   │   └── OrderStatusPage.jsx       # Devotee self-service order tracking & timeline
│   │   ├── services/             # apiClient, orderService, paymentService
│   │   ├── hooks/                # useCountdown (dynamic IST Yaagam countdown)
│   │   └── styles/               # tokens.css, global.css
│   └── package.json
│
├── backend/                      # Shared API and business logic (Port 5000)
│   ├── src/
│   │   ├── config/               # db.js (with auto-memory fallback), constants.js
│   │   ├── models/               # Product, Order, Payment, Customer, AdminUser, EmailLog, AuditLog, Setting
│   │   ├── controllers/          # product, order, payment, admin controllers
│   │   ├── services/             # orderService, razorpayService, brevoService, analyticsService
│   │   ├── routes/               # productRoutes, orderRoutes, paymentRoutes, adminRoutes
│   │   ├── middleware/           # auth (JWT & RBAC), rawBody webhook capture, rate limiters
│   │   ├── utils/                # seed.js (initial product, admin, and settings)
│   │   ├── app.js                # Express app configuration & CORS
│   │   └── server.js             # Server startup & graceful shutdown
│   ├── tests/                    # api.test.js (14 comprehensive integration tests)
│   └── package.json
│
├── super-admin/                  # Dedicated Super Admin frontend (Port 5174)
│   ├── src/
│   │   ├── components/
│   │   │   ├── atoms/            # Button, Input, Label, Badge
│   │   │   ├── molecules/        # FormField, StatCard, Modal
│   │   │   └── organisms/        # Sidebar, Topbar
│   │   ├── layouts/              # DashboardLayout (Protected by AuthGuard)
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx             # Admin authentication
│   │   │   ├── DashboardPage.jsx         # KPI metrics, revenue, orders
│   │   │   ├── OrdersPage.jsx            # Order management & filters
│   │   │   ├── OrderDetailsPage.jsx      # Fulfillment & courier management
│   │   │   ├── ProductsPage.jsx          # Inventory & price management
│   │   │   ├── CustomersPage.jsx         # Devotee directory & search
│   │   │   ├── PaymentsPage.jsx          # Gateway payment logs & reconciliation
│   │   │   ├── RefundsPage.jsx           # Authorized refund management
│   │   │   ├── EmailLogsPage.jsx         # Brevo notification audit & retry
│   │   │   ├── ContentPage.jsx           # Certificate & temple content
│   │   │   ├── AnalyticsPage.jsx         # Verified revenue analytics
│   │   │   ├── UsersPage.jsx             # Admin users & RBAC
│   │   │   ├── SettingsPage.jsx          # Countdown & store parameters
│   │   │   └── AuditLogsPage.jsx         # Security & audit trail
│   │   ├── context/              # AuthContext (JWT & session state)
│   │   ├── services/             # apiClient, adminService
│   │   ├── routes/               # AdminRoutes.jsx
│   │   └── styles/               # tokens.css, admin.css
│   └── package.json
│
├── docs/                         # Architecture & Specification Documents
│   ├── API.md                    # REST API endpoints & schemas
│   ├── DATABASE.md               # MongoDB schemas & index design
│   ├── DEPLOYMENT.md             # Production setup (PM2, Nginx, SSL, Webhooks)
│   └── SECURITY.md               # Threat modeling, cryptographic checks & audits
├── .env.example                  # Environment configuration template
├── package.json                  # Root monorepo orchestrator
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v24.19.0)
- **NPM** v9+ (tested on npm 11.17.0)
- *Optional:* Local MongoDB or MongoDB Atlas URI (if omitted, an in-memory MongoDB automatically starts for zero-friction local development and testing!).

### 2. Installation
Install all dependencies across the monorepo:
```bash
npm install
npm --prefix backend install
npm --prefix frontend install
npm --prefix super-admin install
```

### 3. Environment Setup
Copy `.env.example` to `backend/.env`:
```bash
cp .env.example backend/.env
```
Default credentials and mock fallback keys for local testing are pre-configured in `.env.example`.

### 4. Run Automated Test Suite
Run the 14 comprehensive unit and integration tests:
```bash
npm test
```
*All tests verify price calculations, customer input validation, Razorpay HMAC-SHA256 signature verification, webhook signature checks, idempotency, Super Admin authentication, strictly verified revenue analytics, and refund processing.*

### 5. Start Development Servers
Run all three parts simultaneously with one command:
```bash
npm run dev
```
Or start individually:
- **Backend API (Port 5000):** `npm run dev:backend` -> [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **Customer Storefront (Port 5173):** `npm run dev:frontend` -> [http://localhost:5173](http://localhost:5173)
- **Super Admin Portal (Port 5174):** `npm run dev:admin` -> [http://localhost:5174](http://localhost:5174)

### 6. Build for Production
To build both frontend applications:
```bash
npm run build
```

---

## 🔐 Default Super Admin Credentials

When the database is initialized or seeded, the default Super Admin user is provisioned:

- **Portal URL:** [http://localhost:5174/admin/login](http://localhost:5174/admin/login)
- **Email:** `admin@srisankaratv.com`
- **Password:** `SankaraAdmin2026!`
- **Role:** `super_admin`

---

## 💳 Testing Razorpay Payments

1. When running with test keys or without live keys in development, the system runs in **simulated checkout mode**.
2. Devotees select quantity (1–20), enter their delivery address, and click **Place order request**.
3. Clicking **Pay with Razorpay** triggers the Razorpay Checkout modal.
4. Completing the payment sends the signature to `/api/v1/payments/verify`, which validates the HMAC hash, marks the order as `PAID`, triggers Brevo emails, and redirects to the **Payment Confirmed** page.

---

## 📄 Documentation

- [API Specification](docs/API.md)
- [Database Schema & Architecture](docs/DATABASE.md)
- [Production Deployment Guide](docs/DEPLOYMENT.md)
- [Security & Cryptography Audit](docs/SECURITY.md)

---

## 🕉️ Devotional Note

*சூரசம்ஹார பூஜை 2026 · Arupadai Veedu to the Thiruttani Final Yaagam, 15 November 2026.*  
*Sri Sankara TV Devotional E-Commerce Team.*
