# Sri Sankara TV E-Commerce Platform — Production Deployment Guide

## 1. Prerequisites
- **Node.js**: v18.x, v20.x, or v22+
- **MongoDB**: MongoDB 6.x/7.x or MongoDB Atlas cluster URI
- **Razorpay Account**: Active account with Key ID, Key Secret, and Webhook Secret
- **Brevo Account**: Active account with verified sender email and API Key
- **Domain & SSL**: Valid HTTPS certificate (e.g., Let's Encrypt / Cloudflare)

---

## 2. Environment Configuration

Create `.env` in the root and in `backend/.env`:

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://poojabox.srisankaratv.com
API_BASE_URL=https://poojabox.srisankaratv.com/api/v1

# MongoDB Atlas URI
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/sri_sankara_pooja_box?retryWrites=true&w=majority

# Razorpay Credentials (Live Mode)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=yyyyyyyyyyyyyyyyyyyyyyyy
RAZORPAY_WEBHOOK_SECRET=zzzzzzzzzzzzzzzzzzzzzz

# Brevo Transactional Email
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BREVO_SENDER_EMAIL=orders@srisankaratv.com
BREVO_SENDER_NAME=Sri Sankara TV
BREVO_ORDER_NOTIFICATION_EMAIL=admin@srisankaratv.com

# Admin Authentication & Sessions
ADMIN_JWT_SECRET=generate_a_cryptographically_secure_64_char_string
ADMIN_SESSION_SECRET=generate_another_secure_64_char_string
ADMIN_JWT_EXPIRES_IN=7d

# Initial Super Admin (Seeded on first launch)
INITIAL_ADMIN_EMAIL=admin@srisankaratv.com
INITIAL_ADMIN_PASSWORD=A_Strong_Master_Password_2026!
INITIAL_ADMIN_NAME=Super Admin
```

---

## 3. Production Build & Startup

### Step 1: Install Dependencies
```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### Step 2: Build Frontend
```bash
npm run build
```
This produces an optimized, minified bundle in `frontend/dist/`.

### Step 3: Run Seed Script
```bash
npm run seed
```
Creates default Soora Samhara Pooja Box catalog item, default Super Admin staff user, and configuration parameters.

### Step 4: Run Tests
```bash
npm test
```
Ensures all 14 integration and business logic tests pass.

### Step 5: Start Production Server (via PM2 or systemd)
```bash
npm start
```
Or with PM2:
```bash
pm2 start backend/src/server.js --name "sankara-commerce-api"
```

---

## 4. Nginx Reverse Proxy Configuration (Recommended)

```nginx
server {
    listen 80;
    server_name poojabox.srisankaratv.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name poojabox.srisankaratv.com;

    ssl_certificate /etc/letsencrypt/live/poojabox.srisankaratv.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/poojabox.srisankaratv.com/privkey.pem;

    # Static Frontend Assets
    location / {
        root /var/www/sri-sankara-commerce/frontend/dist;
        try_files $uri $uri/ /index.html;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Backend API & Webhooks
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://127.0.0.1:5000/health;
    }
}
```

---

## 5. Razorpay Webhook Setup
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Navigate to **Settings > Webhooks > Add New Webhook**.
3. **Webhook URL:** `https://poojabox.srisankaratv.com/api/v1/payments/webhook`
4. **Secret:** Set to the exact value of `RAZORPAY_WEBHOOK_SECRET` in `.env`.
5. **Active Events:**
   - `order.paid`
   - `payment.captured`
   - `payment.failed`
6. Click **Save**.

---

## 6. Brevo Email Verification
1. Log in to [Brevo](https://app.brevo.com).
2. Under **Senders, Domains & Dedicated IPs**, verify your domain (`srisankaratv.com`) by adding the DKIM and SPF TXT DNS records.
3. Verify that `BREVO_SENDER_EMAIL` (`orders@srisankaratv.com`) has a status of **Active**.
