process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '../src/app.js';
import { connectDB, closeDB } from '../src/config/db.js';
import { seedDatabase } from '../src/utils/seed.js';
import razorpayService from '../src/services/razorpayService.js';
import brevoService from '../src/services/brevoService.js';
import Order from '../src/models/Order.js';
import Payment from '../src/models/Payment.js';
import EmailLog from '../src/models/EmailLog.js';
import { PAYMENT_STATUS, ORDER_STATUS, EMAIL_TEMPLATES } from '../src/config/constants.js';
import crypto from 'crypto';

beforeAll(async () => {
  await connectDB({ useMemory: true });
  await seedDatabase();
});

afterAll(async () => {
  await closeDB();
});

describe('Sri Sankara TV E-Commerce Comprehensive Backend Test Suite', () => {
  let superAdminToken = '';
  let createdOrderId = '';
  let createdOrderNumber = '';
  let createdRazorpayOrderId = '';

  test('GET /health - Service health check', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  test('GET /api/v1/products - Returns active product and server price', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Soora Samhara Pooja Box');
    expect(res.body.data.priceInPaise).toBe(250000); // ₹2,500
    expect(res.body.data.currency).toBe('INR');
  });

  test('POST /api/v1/orders - Validates customer input fields strictly', async () => {
    // Test invalid phone
    const badPhoneRes = await request(app)
      .post('/api/v1/orders')
      .send({
        productSlug: 'soora-samhara-pooja-box-2026',
        quantity: 1,
        customer: {
          name: 'Murugesan',
          phone: '99999', // invalid
          address: '45 Car Street',
          city: 'Thiruttani',
          state: 'Tamil Nadu',
          pincode: '631209'
        }
      });
    expect(badPhoneRes.status).toBe(400);
    expect(badPhoneRes.body.message).toMatch(/valid 10-digit/i);

    // Test invalid pincode
    const badPinRes = await request(app)
      .post('/api/v1/orders')
      .send({
        productSlug: 'soora-samhara-pooja-box-2026',
        quantity: 1,
        customer: {
          name: 'Murugesan',
          phone: '9840123456',
          address: '45 Car Street',
          city: 'Thiruttani',
          state: 'Tamil Nadu',
          pincode: '6312' // invalid 4 digits
        }
      });
    expect(badPinRes.status).toBe(400);
    expect(badPinRes.body.message).toMatch(/valid 6-digit PIN/i);

    // Test invalid quantity (> 20)
    const badQtyRes = await request(app)
      .post('/api/v1/orders')
      .send({
        productSlug: 'soora-samhara-pooja-box-2026',
        quantity: 25,
        customer: {
          name: 'Murugesan',
          phone: '9840123456',
          address: '45 Car Street',
          city: 'Thiruttani',
          state: 'Tamil Nadu',
          pincode: '631209'
        }
      });
    expect(badQtyRes.status).toBe(400);
    expect(badQtyRes.body.message).toMatch(/between 1 and 20/i);
  });

  test('POST /api/v1/orders - Server calculates exact price and creates pending order', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .send({
        productSlug: 'soora-samhara-pooja-box-2026',
        quantity: 3,
        customer: {
          name: 'Sundararajan Swamy',
          phone: '9840987654',
          email: 'sundararajan@example.com',
          address: '10 Sannadhi Street, Swamimalai',
          city: 'Kumbakonam',
          state: 'Tamil Nadu',
          pincode: '612302'
        }
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderNumber).toMatch(/^SSK-2026-/);
    expect(res.body.data.quantity).toBe(3);
    // 3 * 250000 = 750000 paise (₹7,500)
    expect(res.body.data.amountInPaise).toBe(750000);
    expect(res.body.data.amountInRupees).toBe(7500);
    expect(res.body.data.razorpayOrderId).toBeDefined();

    createdOrderId = res.body.data.orderId;
    createdOrderNumber = res.body.data.orderNumber;
    createdRazorpayOrderId = res.body.data.razorpayOrderId;
  });

  test('GET /api/v1/orders/:orderNumber/status - Devotee order tracking', async () => {
    const res = await request(app).get(`/api/v1/orders/${createdOrderNumber}/status`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderNumber).toBe(createdOrderNumber);
    expect(res.body.data.customerName).toBe('Sundararajan Swamy');
    expect(res.body.data.totalAmountInRupees).toBe(7500);
    expect(res.body.data.paymentStatus).toBe('PENDING');
  });

  test('Razorpay HMAC signature verification and tampering detection', () => {
    const secret = 'rzp_sec_test_987';
    razorpayService.keySecret = secret;

    const razorpayOrderId = 'order_test_abc123';
    const razorpayPaymentId = 'pay_test_xyz789';
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    // Valid signature should pass
    const isValid = razorpayService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature: validSignature
    });
    expect(isValid).toBe(true);

    // Tampered signature should fail safely
    const isFakeValid = razorpayService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature: 'tampered_signature_payload'
    });
    expect(isFakeValid).toBe(false);
  });

  test('POST /api/v1/payments/verify - Confirms payment and triggers Brevo notification', async () => {
    const secret = razorpayService.keySecret || 'dev_secret';
    const razorpayPaymentId = 'pay_simulated_' + Date.now();
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${createdRazorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const res = await request(app)
      .post('/api/v1/payments/verify')
      .send({
        orderNumber: createdOrderNumber,
        razorpayOrderId: createdRazorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: validSignature
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.paymentStatus).toBe('PAID');

    // Verify order in database is now PAID
    const dbOrder = await Order.findOne({ orderNumber: createdOrderNumber });
    expect(dbOrder.paymentStatus).toBe('PAID');
    expect(dbOrder.orderStatus).toBe('PAID');

    // Verify email log entry was created
    const emailLog = await EmailLog.findOne({ orderNumber: createdOrderNumber });
    expect(emailLog).toBeDefined();
    expect(emailLog.recipientEmail).toBe('sundararajan@example.com');
  });

  test('POST /api/v1/payments/webhook - Rejects invalid webhook signature', async () => {
    const res = await request(app)
      .post('/api/v1/payments/webhook')
      .set('x-razorpay-signature', 'invalid_signature_hex')
      .send({
        id: 'evt_test_123',
        event: 'payment.captured'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/v1/payments/webhook - Safely handles valid webhook and idempotency', async () => {
    const webhookSecret = 'test_webhook_secret';
    razorpayService.webhookSecret = webhookSecret;

    const webhookPayload = {
      id: 'evt_unique_test_' + Date.now(),
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_wh_' + Date.now(),
            order_id: createdRazorpayOrderId,
            amount: 750000,
            currency: 'INR',
            status: 'captured',
            method: 'upi'
          }
        }
      }
    };

    const rawBody = JSON.stringify(webhookPayload);
    const validSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    // First delivery
    const res1 = await request(app)
      .post('/api/v1/payments/webhook')
      .set('x-razorpay-signature', validSig)
      .set('Content-Type', 'application/json')
      .send(webhookPayload);

    expect(res1.status).toBe(200);
    expect(res1.body.success).toBe(true);

    // Duplicate delivery with same event ID should be recognized as duplicate (idempotent)
    const res2 = await request(app)
      .post('/api/v1/payments/webhook')
      .set('x-razorpay-signature', validSig)
      .set('Content-Type', 'application/json')
      .send(webhookPayload);

    expect(res2.status).toBe(200);
    expect(res2.body.result?.duplicate).toBe(true);
  });

  test('POST /api/v1/admin/auth/login - Super admin login and JWT generation', async () => {
    const res = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({
        email: 'admin@srisankaratv.com',
        password: 'SankaraAdmin2026!'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('super_admin');

    superAdminToken = res.body.token;
  });

  test('GET /api/v1/admin/dashboard - Revenue strictly calculates only verified payments', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary.totalVerifiedRevenueInRupees).toBeGreaterThanOrEqual(7500);
    expect(res.body.data.summary.successfulPayments).toBeGreaterThanOrEqual(1);
  });

  test('PATCH /api/v1/orders/admin/:id/status - Updates fulfillment status with audit logging', async () => {
    const res = await request(app)
      .patch(`/api/v1/orders/admin/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        status: 'DISPATCHED',
        carrier: 'India Post Speed Post',
        trackingNumber: 'SP123456789IN',
        note: 'Pooja box dispatched after Thiruttani Yaagam.'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderStatus).toBe('DISPATCHED');
    expect(res.body.data.tracking.trackingNumber).toBe('SP123456789IN');
  });

  test('POST /api/v1/admin/email-logs/:id/retry - Retries email log', async () => {
    const log = await EmailLog.findOne({ orderNumber: createdOrderNumber });
    expect(log).toBeDefined();

    const res = await request(app)
      .post(`/api/v1/admin/email-logs/${log._id}/retry`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/v1/admin/payments/:id/refund - Super admin authorized refund', async () => {
    const payment = await Payment.findOne({ orderNumber: createdOrderNumber });
    expect(payment).toBeDefined();

    const res = await request(app)
      .post(`/api/v1/payments/admin/${payment._id}/refund`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        reason: 'Authorized devotee refund test'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.refundId).toBeDefined();

    const updatedOrder = await Order.findOne({ orderNumber: createdOrderNumber });
    expect(updatedOrder.paymentStatus).toBe('REFUNDED');
    expect(updatedOrder.refund.isRefunded).toBe(true);
  });
});
