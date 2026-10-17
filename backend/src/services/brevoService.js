import 'dotenv/config';
import EmailLog from '../models/EmailLog.js';
import { EMAIL_TEMPLATES } from '../config/constants.js';

class BrevoService {
  constructor() {
    this.refreshConfig();
  }

  refreshConfig() {
    this.apiKey = process.env.BREVO_API_KEY || '';
    this.senderEmail = process.env.BREVO_SENDER_EMAIL || 'orders@srisankaratv.com';
    this.senderName = process.env.BREVO_SENDER_NAME || 'Sri Sankara TV';
    this.adminNotificationEmail = process.env.BREVO_ORDER_NOTIFICATION_EMAIL || 'admin@srisankaratv.com';

    this.isConfigured = Boolean(
      this.apiKey && 
      !this.apiKey.includes('your-brevo-api-key')
    );

    if (this.isConfigured) {
      console.log('[BrevoService] Initialized with live Brevo API credentials');
    } else {
      console.warn('[BrevoService] API key not configured. Running in simulated email mode for local development.');
    }
  }

  formatINR(paise) {
    return `₹${(paise / 100).toLocaleString('en-IN')}`;
  }

  async sendEmail({ toEmail, toName, subject, htmlContent, templateType, order = null }) {
    if (!toEmail) {
      console.warn(`[BrevoService] Skipping email: No recipient email provided for ${templateType}`);
      return null;
    }

    // Check idempotency: If this exact template was already sent successfully for this order, avoid duplicates
    if (order && templateType) {
      const existingSuccess = await EmailLog.findOne({
        orderId: order._id,
        templateType,
        recipientEmail: toEmail,
        status: { $in: ['SENT', 'DELIVERED'] }
      });

      if (existingSuccess) {
        console.log(`[BrevoService] Idempotency check: ${templateType} already sent to ${toEmail} for order ${order.orderNumber}`);
        return existingSuccess;
      }
    }

    const emailLog = new EmailLog({
      orderId: order ? order._id : null,
      orderNumber: order ? order.orderNumber : '',
      recipientEmail: toEmail,
      recipientName: toName || '',
      templateType,
      subject,
      status: 'PENDING',
      retryCount: 0
    });

    if (!this.isConfigured) {
      // Simulated delivery
      console.log(`\n================ SIMULATED BREVO EMAIL ================`);
      console.log(`To: ${toName} <${toEmail}>`);
      console.log(`From: ${this.senderName} <${this.senderEmail}>`);
      console.log(`Subject: ${subject}`);
      console.log(`Template: ${templateType}`);
      console.log(`=======================================================\n`);

      emailLog.status = 'SENT';
      emailLog.brevoMessageId = `sim_msg_${Date.now()}`;
      emailLog.sentAt = new Date();
      await emailLog.save();
      return emailLog;
    }

    try {
      const payload = {
        sender: { name: this.senderName, email: this.senderEmail },
        to: [{ email: toEmail, name: toName || '' }],
        subject,
        htmlContent
      };

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': this.apiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Brevo HTTP error ${response.status}`);
      }

      emailLog.status = 'SENT';
      emailLog.brevoMessageId = data.messageId || null;
      emailLog.sentAt = new Date();
      await emailLog.save();

      return emailLog;
    } catch (err) {
      console.error(`[BrevoService] Email sending failed:`, err);
      emailLog.status = 'FAILED';
      emailLog.errorMessage = err.message;
      await emailLog.save();
      return emailLog;
    }
  }

  async sendOrderConfirmation(order) {
    if (!order.customer.email) {
      console.log(`[BrevoService] Customer did not provide email for order ${order.orderNumber}. Skipping customer receipt.`);
      return null;
    }

    const subject = `Order Confirmed: Sri Sankara TV Soora Samhara Pooja Box (${order.orderNumber})`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #2B1B18; line-height: 1.6; border: 1px solid #E4D6BA; border-radius: 6px; overflow: hidden;">
        <div style="background-color: #2F0A12; color: #F6EBD6; padding: 24px; text-align: center;">
          <h1 style="color: #E4B655; margin: 0; font-size: 24px;">Sri Sankara TV</h1>
          <p style="margin: 8px 0 0; color: #D8C3A5; font-size: 14px;">சூரசம்ஹார பூஜை 2026</p>
        </div>
        <div style="padding: 24px; background-color: #FAF4E8;">
          <h2 style="color: #4A0F1B; margin-top: 0;">Namaskaram ${order.customer.name},</h2>
          <p>Thank you for reserving the blessed <strong>Soora Samhara Pooja Box 2026</strong>. Your payment of <strong>${this.formatINR(order.totalAmountInPaise)}</strong> has been verified and confirmed.</p>
          
          <div style="background: #FFFFFF; border: 1px solid #E4D6BA; padding: 18px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0 0 10px;"><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p style="margin: 0 0 10px;"><strong>Quantity:</strong> ${order.quantity} box(es)</p>
            <p style="margin: 0 0 10px;"><strong>Amount Paid:</strong> ${this.formatINR(order.totalAmountInPaise)}</p>
            <p style="margin: 0 0 10px;"><strong>Payment Status:</strong> <span style="color: #16A34A; font-weight: bold;">PAID</span></p>
            <p style="margin: 0;"><strong>Delivery To:</strong><br/>
              ${order.customer.name}<br/>
              ${order.customer.address}, ${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}<br/>
              Phone: ${order.customer.phone}
            </p>
          </div>

          <p>Your pooja box will travel through all six Arupadai Veedu temples and culminate at the sacred <strong>Thiruttani Yaagam on 15 November 2026</strong>. Following the Yaagam, it will be dispatched to your doorstep complete with the official Sri Sankara TV Authentication Certificate.</p>
          
          <p style="margin-top: 24px; font-size: 14px; color: #6A5750;">May Lord Murugan bestow divine health, prosperity, and spiritual peace upon you and your family.</p>
        </div>
        <div style="background-color: #2F0A12; color: #D8C3A5; text-align: center; padding: 16px; font-size: 12px;">
          Sri Sankara TV · Arupadai Temples to the Thiruttani Yaagam, 15 November 2026
        </div>
      </div>
    `;

    return this.sendEmail({
      toEmail: order.customer.email,
      toName: order.customer.name,
      subject,
      htmlContent,
      templateType: EMAIL_TEMPLATES.PAYMENT_SUCCESS,
      order
    });
  }

  async sendAdminNewOrderAlert(order) {
    if (!this.adminNotificationEmail) return null;

    const subject = `[NEW ORDER] ${order.orderNumber} - ${order.quantity} box(es) - ${this.formatINR(order.totalAmountInPaise)}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #4A0F1B;">New Verified Order Received</h2>
        <p>A new order has been paid and verified for the Soora Samhara Pooja Box 2026.</p>
        <ul>
          <li><strong>Order Number:</strong> ${order.orderNumber}</li>
          <li><strong>Customer:</strong> ${order.customer.name} (${order.customer.phone})</li>
          <li><strong>Quantity:</strong> ${order.quantity}</li>
          <li><strong>Total Amount:</strong> ${this.formatINR(order.totalAmountInPaise)}</li>
          <li><strong>City & State:</strong> ${order.customer.city}, ${order.customer.state}</li>
          <li><strong>Razorpay Payment ID:</strong> ${order.razorpayPaymentId || 'N/A'}</li>
        </ul>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/orders/${order._id}">View Order in Admin Dashboard</a></p>
      </div>
    `;

    return this.sendEmail({
      toEmail: this.adminNotificationEmail,
      toName: 'Order Desk Admin',
      subject,
      htmlContent,
      templateType: EMAIL_TEMPLATES.ADMIN_NEW_ORDER_ALERT,
      order
    });
  }

  async sendOrderStatusUpdate(order) {
    if (!order.customer.email) return null;

    const subject = `Order Update: Sri Sankara TV Pooja Box (${order.orderNumber}) is ${order.orderStatus}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E4D6BA;">
        <h2 style="color: #4A0F1B;">Order Status Update</h2>
        <p>Namaskaram ${order.customer.name},</p>
        <p>Your order <strong>${order.orderNumber}</strong> has been updated to: <strong>${order.orderStatus}</strong>.</p>
        ${order.tracking?.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.tracking.trackingNumber} (${order.tracking.carrier || 'Postal/Courier'})</p>` : ''}
        <p>Thank you for your devotion and patience.</p>
        <p>Sri Sankara TV</p>
      </div>
    `;

    return this.sendEmail({
      toEmail: order.customer.email,
      toName: order.customer.name,
      subject,
      htmlContent,
      templateType: EMAIL_TEMPLATES.ORDER_STATUS_UPDATE,
      order
    });
  }

  async retryEmail(emailLogId) {
    const emailLog = await EmailLog.findById(emailLogId).populate('orderId');
    if (!emailLog) {
      throw new Error('Email log record not found');
    }

    emailLog.retryCount += 1;
    await emailLog.save();

    // Resend using the stored template logic
    if (emailLog.orderId) {
      if (emailLog.templateType === EMAIL_TEMPLATES.PAYMENT_SUCCESS) {
        return this.sendOrderConfirmation(emailLog.orderId);
      }
      if (emailLog.templateType === EMAIL_TEMPLATES.ADMIN_NEW_ORDER_ALERT) {
        return this.sendAdminNewOrderAlert(emailLog.orderId);
      }
      if (emailLog.templateType === EMAIL_TEMPLATES.ORDER_STATUS_UPDATE) {
        return this.sendOrderStatusUpdate(emailLog.orderId);
      }
    }

    return emailLog;
  }
}

export default new BrevoService();
