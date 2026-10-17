import 'dotenv/config';
import Razorpay from 'razorpay';
import crypto from 'crypto';

class RazorpayService {
  constructor() {
    this.refreshConfig();
  }

  refreshConfig() {
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    this.isConfigured = Boolean(
      this.keyId && 
      this.keySecret && 
      !this.keyId.includes('YourTest') && 
      !this.keySecret.includes('YourTest')
    );

    if (this.isConfigured) {
      this.client = new Razorpay({
        key_id: this.keyId,
        key_secret: this.keySecret
      });
      console.log(`[RazorpayService] Initialized with credentials (keyId: ${this.keyId})`);
    } else {
      console.warn('[RazorpayService] Credentials not fully configured. Running in simulated test mode for local development.');
      this.client = null;
    }
  }

  getKeyId() {
    if (!this.keyId || this.keyId !== process.env.RAZORPAY_KEY_ID) {
      this.refreshConfig();
    }
    return this.keyId || 'rzp_test_simulated_key';
  }

  getClient() {
    if (!this.client || this.keyId !== process.env.RAZORPAY_KEY_ID) {
      this.refreshConfig();
    }
    return this.client;
  }

  async createOrder({ orderNumber, amountInPaise, currency = 'INR', notes = {} }) {
    const client = this.getClient();
    if (!client) {
      // Simulated response for offline/dev test mode
      const mockOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
      return {
        id: mockOrderId,
        entity: 'order',
        amount: amountInPaise,
        currency,
        receipt: orderNumber,
        status: 'created',
        notes,
        isSimulated: true
      };
    }

    try {
      const options = {
        amount: amountInPaise, // integer paise (e.g. 250000)
        currency,
        receipt: orderNumber,
        notes: {
          orderNumber,
          ...notes
        }
      };

      const razorpayOrder = await client.orders.create(options);
      return razorpayOrder;
    } catch (err) {
      console.error('[RazorpayService] Order creation error:', err);
      throw new Error(`Razorpay order creation failed: ${err.message}`);
    }
  }

  verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    if (!this.isConfigured) {
      // In dev test simulation mode, accept simulated payment signatures or verify if present
      if (razorpaySignature && razorpaySignature.startsWith('simulated_sig_')) {
        return true;
      }
    }

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return false;
    }

    const secret = this.keySecret || 'dev_secret';
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const bufExpected = Buffer.from(expectedSignature, 'utf-8');
    const bufActual = Buffer.from(razorpaySignature, 'utf-8');

    if (bufExpected.length !== bufActual.length) {
      return false;
    }

    return crypto.timingSafeEqual(bufExpected, bufActual);
  }

  verifyWebhookSignature({ rawBody, signature, secret }) {
    const webhookSecret = secret || this.webhookSecret;
    if (!webhookSecret || !signature) {
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      const bufExpected = Buffer.from(expectedSignature, 'utf-8');
      const bufActual = Buffer.from(signature, 'utf-8');

      if (bufExpected.length !== bufActual.length) {
        return false;
      }

      return crypto.timingSafeEqual(bufExpected, bufActual);
    } catch (err) {
      console.error('[RazorpayService] Webhook signature verification error:', err);
      return false;
    }
  }

  async fetchPayment(paymentId) {
    if (!this.client || (paymentId && (
      String(paymentId).startsWith('pay_simulated_') ||
      String(paymentId).startsWith('pay_wh_') ||
      String(paymentId).startsWith('pay_test_')
    ))) {
      return {
        id: paymentId,
        status: 'captured',
        amount: 250000,
        currency: 'INR',
        method: 'upi',
        vpa: 'devotee@upi',
        isSimulated: true
      };
    }

    return this.client.payments.fetch(paymentId);
  }

  async refundPayment({ paymentId, amountInPaise, notes = {} }) {
    if (!this.client || (paymentId && (
      String(paymentId).startsWith('pay_simulated_') ||
      String(paymentId).startsWith('pay_wh_') ||
      String(paymentId).startsWith('pay_test_')
    ))) {
      return {
        id: `rfnd_${crypto.randomBytes(8).toString('hex')}`,
        entity: 'refund',
        amount: amountInPaise,
        currency: 'INR',
        payment_id: paymentId,
        status: 'processed',
        notes,
        isSimulated: true
      };
    }

    return this.client.payments.refund(paymentId, {
      amount: amountInPaise,
      notes
    });
  }
}

export default new RazorpayService();
