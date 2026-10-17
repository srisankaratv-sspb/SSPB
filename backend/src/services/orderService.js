import crypto from 'crypto';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Customer from '../models/Customer.js';
import razorpayService from './razorpayService.js';
import brevoService from './brevoService.js';
import { ORDER_STATUS, PAYMENT_STATUS, DEFAULT_PRODUCT } from '../config/constants.js';

class OrderService {
  generateOrderNumber() {
    const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `SSK-2026-${randomPart}`;
  }

  normalizePhone(phone) {
    return phone.replace(/[\s-]/g, '').replace(/^\+91/, '');
  }

  validatePhone(phone) {
    const cleaned = this.normalizePhone(phone);
    return /^[6-9]\d{9}$/.test(cleaned);
  }

  validatePincode(pin) {
    return /^\d{6}$/.test(pin.trim());
  }

  async getActiveProduct(slug = DEFAULT_PRODUCT.slug) {
    let product = await Product.findOne({ slug, isActive: true });
    if (!product) {
      product = await Product.findOne({ isActive: true });
    }
    return product;
  }

  async createOrder({ productSlug, quantity, customer, customerUser = null }) {
    // 1. Validate quantity
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1 || qty > 20) {
      throw new Error('Quantity must be an integer between 1 and 20.');
    }

    // 2. Validate customer details
    if (!customer || !customer.name || customer.name.trim().length < 2) {
      throw new Error('Enter your full name (minimum 2 characters).');
    }
    if (!customer.phone || !this.validatePhone(customer.phone)) {
      throw new Error('Enter a valid 10-digit Indian mobile number.');
    }
    if (!customer.address || customer.address.trim().length < 8) {
      throw new Error('Enter your full delivery address (minimum 8 characters).');
    }
    if (!customer.city || customer.city.trim().length < 2) {
      throw new Error('Enter your city.');
    }
    if (!customer.state || customer.state.trim().length < 2) {
      throw new Error('Enter your state.');
    }
    if (!customer.pincode || !this.validatePincode(customer.pincode)) {
      throw new Error('Enter a valid 6-digit PIN code.');
    }

    // 3. Retrieve active product price from MongoDB (NEVER trust browser pricing)
    const product = await this.getActiveProduct(productSlug);
    if (!product) {
      throw new Error('Product is currently unavailable.');
    }

    // 4. Calculate total amount in integer paise
    const unitPriceInPaise = product.priceInPaise;
    const subtotalInPaise = qty * unitPriceInPaise;
    const deliveryChargeInPaise = 0; // Free delivery
    const discountInPaise = 0;
    const totalAmountInPaise = subtotalInPaise + deliveryChargeInPaise - discountInPaise;

    // 5. Generate human-readable order number
    const orderNumber = this.generateOrderNumber();
    const cleanPhone = this.normalizePhone(customer.phone);

    // 6. Create pending order record in MongoDB
    const order = new Order({
      orderNumber,
      customer: {
        name: customer.name.trim(),
        phone: cleanPhone,
        email: customer.email ? customer.email.trim().toLowerCase() : '',
        address: customer.address.trim(),
        city: customer.city.trim(),
        state: customer.state.trim() || 'Tamil Nadu',
        pincode: customer.pincode.trim()
      },
      customerId: customerUser?._id || null,
      productId: product._id,
      productName: product.name,
      quantity: qty,
      unitPriceInPaise,
      subtotalInPaise,
      deliveryChargeInPaise,
      discountInPaise,
      totalAmountInPaise,
      currency: product.currency || 'INR',
      paymentStatus: PAYMENT_STATUS.PENDING,
      orderStatus: ORDER_STATUS.CREATED,
      timeline: [{
        status: ORDER_STATUS.CREATED,
        note: `Order created for ${qty} box(es). Awaiting payment.`,
        timestamp: new Date(),
        updatedBy: 'Customer'
      }]
    });

    // 7. Create Razorpay order
    const razorpayOrder = await razorpayService.createOrder({
      orderNumber,
      amountInPaise: totalAmountInPaise,
      currency: product.currency || 'INR',
      notes: {
        productName: product.name,
        quantity: String(qty),
        customerName: customer.name.trim(),
        customerPhone: cleanPhone
      }
    });

    order.razorpayOrderId = razorpayOrder.id;
    order.orderStatus = ORDER_STATUS.PAYMENT_PENDING;
    order.timeline.push({
      status: ORDER_STATUS.PAYMENT_PENDING,
      note: `Razorpay order created with ID ${razorpayOrder.id}`,
      timestamp: new Date(),
      updatedBy: 'PaymentGateway'
    });

    await order.save();

    // Link or upsert customer profile record
    try {
      let customerRecord = await Customer.findOne({ phone: cleanPhone });
      if (!customerRecord) {
        customerRecord = new Customer({
          name: customer.name.trim(),
          phone: cleanPhone,
          email: customer.email ? customer.email.trim().toLowerCase() : '',
          addresses: [{
            address: customer.address.trim(),
            city: customer.city.trim(),
            state: customer.state.trim() || 'Tamil Nadu',
            pincode: customer.pincode.trim()
          }],
          totalOrders: 1,
          totalSpentInPaise: 0,
          lastOrderAt: new Date()
        });
        await customerRecord.save();
      } else {
        customerRecord.lastOrderAt = new Date();
        if (customer.email && !customerRecord.email) {
          customerRecord.email = customer.email.trim().toLowerCase();
        }
        await customerRecord.save();
      }
      order.customerId = customerRecord._id;
      await order.save();
    } catch (custErr) {
      console.warn(`[OrderService] Initial customer upsert note: ${custErr.message}`);
    }

    // 8. Create internal Payment record
    const internalPaymentId = `PAY-${orderNumber}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const payment = new Payment({
      internalPaymentId,
      orderId: order._id,
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amountInPaise: totalAmountInPaise,
      currency: product.currency || 'INR',
      status: PAYMENT_STATUS.PENDING
    });
    await payment.save();

    return {
      orderId: order._id,
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amountInPaise: totalAmountInPaise,
      amountInRupees: totalAmountInPaise / 100,
      currency: product.currency || 'INR',
      keyId: razorpayService.getKeyId(),
      productName: product.name,
      quantity: qty,
      customer: order.customer
    };
  }

  async verifyAndConfirmPayment({ orderNumber, razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    const order = await Order.findOne({ orderNumber });
    if (!order) {
      throw new Error(`Order ${orderNumber} not found.`);
    }

    // Check if order is already verified and paid
    if (order.paymentStatus === PAYMENT_STATUS.CAPTURED || order.paymentStatus === PAYMENT_STATUS.PAID) {
      console.log(`[OrderService] Order ${orderNumber} is already confirmed.`);
      return order;
    }

    // Verify HMAC-SHA256 signature
    const isValidSignature = razorpayService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });

    if (!isValidSignature) {
      order.timeline.push({
        status: PAYMENT_STATUS.FAILED,
        note: `Payment signature verification failed for payment ID: ${razorpayPaymentId}`,
        timestamp: new Date(),
        updatedBy: 'SecurityMiddleware'
      });
      await order.save();
      throw new Error('Payment signature verification failed. The transaction could not be verified.');
    }

    // Fetch authoritative gateway payment record
    const gatewayPayment = await razorpayService.fetchPayment(razorpayPaymentId);

    // Update internal Payment record
    let payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      payment = new Payment({
        internalPaymentId: `PAY-${order.orderNumber}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
        orderId: order._id,
        orderNumber: order.orderNumber,
        razorpayOrderId
      });
    }

    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.amountInPaise = order.totalAmountInPaise;
    payment.status = PAYMENT_STATUS.CAPTURED;
    payment.method = gatewayPayment.method || 'upi';
    payment.bank = gatewayPayment.bank || null;
    payment.wallet = gatewayPayment.wallet || null;
    payment.vpa = gatewayPayment.vpa || null;
    payment.email = gatewayPayment.email || order.customer.email || null;
    payment.contact = gatewayPayment.contact || order.customer.phone || null;
    payment.rawGatewayResponse = gatewayPayment;
    payment.verifiedAt = new Date();
    await payment.save();

    // Mark Order as Paid
    order.paymentStatus = PAYMENT_STATUS.PAID;
    order.orderStatus = ORDER_STATUS.PAID;
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.timeline.push({
      status: ORDER_STATUS.PAID,
      note: `Payment verified successfully via Razorpay (Payment ID: ${razorpayPaymentId}, Method: ${payment.method}).`,
      timestamp: new Date(),
      updatedBy: 'RazorpayGateway'
    });
    await order.save();

    // Upsert Customer profile
    try {
      let customer = await Customer.findOne({ phone: order.customer.phone });
      if (!customer) {
        customer = new Customer({
          name: order.customer.name,
          phone: order.customer.phone,
          email: order.customer.email,
          addresses: [{
            address: order.customer.address,
            city: order.customer.city,
            state: order.customer.state,
            pincode: order.customer.pincode
          }],
          totalOrders: 1,
          totalSpentInPaise: order.totalAmountInPaise,
          lastOrderAt: new Date()
        });
      } else {
        customer.totalOrders += 1;
        customer.totalSpentInPaise += order.totalAmountInPaise;
        customer.lastOrderAt = new Date();
        if (order.customer.email && !customer.email) {
          customer.email = order.customer.email;
        }
      }
      await customer.save();
      order.customerId = customer._id;
      await order.save();
    } catch (custErr) {
      console.warn(`[OrderService] Error upserting customer: ${custErr.message}`);
    }

    // Trigger transactional notifications via Brevo
    try {
      await brevoService.sendOrderConfirmation(order);
      await brevoService.sendAdminNewOrderAlert(order);
      order.notificationStatus.customerEmailSent = Boolean(order.customer.email);
      order.notificationStatus.adminAlertSent = true;
      order.notificationStatus.lastEmailSentAt = new Date();
      await order.save();
    } catch (emailErr) {
      console.error(`[OrderService] Error triggering Brevo emails: ${emailErr.message}`);
      order.notificationStatus.failureReason = emailErr.message;
      await order.save();
    }

    return order;
  }

  async handleRazorpayWebhook({ rawBody, signature, event }) {
    // 1. Verify signature
    const isValid = razorpayService.verifyWebhookSignature({
      rawBody,
      signature
    });

    if (!isValid) {
      console.error('[OrderService] Webhook signature verification failed');
      throw new Error('Invalid webhook signature');
    }

    const eventId = event.id;
    const eventType = event.event;
    console.log(`[OrderService] Processing webhook event: ${eventType} (ID: ${eventId})`);

    const paymentEntity = event.payload?.payment?.entity;
    if (!paymentEntity) {
      return { received: true, ignored: true, reason: 'No payment entity in payload' };
    }

    const razorpayOrderId = paymentEntity.order_id;
    const razorpayPaymentId = paymentEntity.id;

    // Check idempotency on payment record
    let payment = await Payment.findOne({ razorpayOrderId });
    if (payment && payment.webhookEventIds.includes(eventId)) {
      console.log(`[OrderService] Webhook event ${eventId} already processed (idempotent).`);
      return { received: true, duplicate: true };
    }

    const order = await Order.findOne({ razorpayOrderId });
    if (!order) {
      console.warn(`[OrderService] Webhook received for unknown order with Razorpay Order ID: ${razorpayOrderId}`);
      return { received: true, error: 'Order not found' };
    }

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      if (!payment) {
        payment = new Payment({
          internalPaymentId: `PAY-${order.orderNumber}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
          orderId: order._id,
          orderNumber: order.orderNumber,
          razorpayOrderId
        });
      }

      payment.razorpayPaymentId = razorpayPaymentId;
      payment.amountInPaise = paymentEntity.amount || order.totalAmountInPaise;
      payment.status = PAYMENT_STATUS.CAPTURED;
      payment.method = paymentEntity.method;
      payment.bank = paymentEntity.bank;
      payment.vpa = paymentEntity.vpa;
      payment.webhookEventIds.push(eventId);
      payment.verifiedAt = new Date();
      await payment.save();

      if (order.paymentStatus !== PAYMENT_STATUS.PAID) {
        order.paymentStatus = PAYMENT_STATUS.PAID;
        order.orderStatus = ORDER_STATUS.PAID;
        order.razorpayPaymentId = razorpayPaymentId;
        order.timeline.push({
          status: ORDER_STATUS.PAID,
          note: `Payment confirmed via webhook event ${eventType} (${eventId})`,
          timestamp: new Date(),
          updatedBy: 'RazorpayWebhook'
        });
        await order.save();

        // Brevo email
        await brevoService.sendOrderConfirmation(order);
        await brevoService.sendAdminNewOrderAlert(order);
      }
    } else if (eventType === 'payment.failed') {
      if (payment) {
        payment.status = PAYMENT_STATUS.FAILED;
        payment.errorDetails = {
          code: paymentEntity.error_code,
          description: paymentEntity.error_description,
          source: paymentEntity.error_source,
          step: paymentEntity.error_step,
          reason: paymentEntity.error_reason
        };
        payment.webhookEventIds.push(eventId);
        await payment.save();
      }

      order.paymentStatus = PAYMENT_STATUS.FAILED;
      order.timeline.push({
        status: PAYMENT_STATUS.FAILED,
        note: `Payment failed: ${paymentEntity.error_description || 'Unknown error'}`,
        timestamp: new Date(),
        updatedBy: 'RazorpayWebhook'
      });
      await order.save();
    }

    return { received: true, eventType };
  }
}

export default new OrderService();
