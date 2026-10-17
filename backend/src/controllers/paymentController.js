import orderService from '../services/orderService.js';
import razorpayService from '../services/razorpayService.js';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import AuditLog from '../models/AuditLog.js';
import { PAYMENT_STATUS } from '../config/constants.js';

export const verifyPayment = async (req, res) => {
  try {
    const { orderNumber, razorpayOrderId, razorpayPaymentId, razorpaySignature, orderToken, customer, quantity } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification parameters'
      });
    }

    const order = await orderService.verifyAndConfirmPayment({
      orderNumber,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      orderToken,
      customer,
      quantity
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified and order confirmed successfully',
      data: {
        orderNumber: order.orderNumber,
        customerName: order.customer.name,
        amountInRupees: order.totalAmountInPaise / 100,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        razorpayPaymentId: order.razorpayPaymentId
      }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    const result = await orderService.handleRazorpayWebhook({
      rawBody,
      signature,
      event: req.body
    });

    res.status(200).json({ success: true, result });
  } catch (err) {
    console.error('[PaymentController] Webhook error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getAdminPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    const query = {};
    if (status) query.status = status;
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { orderNumber: searchRegex },
        { razorpayPaymentId: searchRegex },
        { razorpayOrderId: searchRegex },
        { internalPaymentId: searchRegex }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate('orderId', 'customer quantity totalAmountInPaise');

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          total,
          page: parseInt(page, 10),
          pages: Math.ceil(total / parseInt(limit, 10)),
          limit: parseInt(limit, 10)
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const reconcilePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (!payment.razorpayPaymentId) {
      return res.status(400).json({ success: false, message: 'No Razorpay Payment ID to reconcile' });
    }

    const gatewayPayment = await razorpayService.fetchPayment(payment.razorpayPaymentId);
    
    payment.isReconciled = true;
    payment.reconciledAt = new Date();
    payment.rawGatewayResponse = gatewayPayment;
    
    if (gatewayPayment.status === 'captured') {
      payment.status = PAYMENT_STATUS.CAPTURED;
      const order = await Order.findById(payment.orderId);
      if (order && order.paymentStatus !== PAYMENT_STATUS.PAID) {
        order.paymentStatus = PAYMENT_STATUS.PAID;
        order.timeline.push({
          status: PAYMENT_STATUS.PAID,
          note: 'Payment reconciled and confirmed directly with Razorpay gateway.',
          timestamp: new Date(),
          updatedBy: req.adminUser.name
        });
        await order.save();
      }
    } else if (gatewayPayment.status === 'failed') {
      payment.status = PAYMENT_STATUS.FAILED;
    }
    
    await payment.save();

    await AuditLog.create({
      adminUserId: req.adminUser._id,
      adminEmail: req.adminUser.email,
      action: 'RECONCILE_PAYMENT',
      resourceType: 'PAYMENT',
      resourceId: payment._id.toString(),
      changes: { gatewayStatus: gatewayPayment.status },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      message: `Payment reconciled. Status: ${payment.status}`,
      data: payment
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const refundPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Customer requested refund' } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.status !== PAYMENT_STATUS.CAPTURED) {
      return res.status(400).json({ success: false, message: 'Only captured payments can be refunded' });
    }

    const order = await Order.findById(payment.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Associated order not found' });
    }

    // Call Razorpay Refund API
    const refundRes = await razorpayService.refundPayment({
      paymentId: payment.razorpayPaymentId,
      amountInPaise: payment.amountInPaise,
      notes: { orderNumber: order.orderNumber, reason }
    });

    payment.status = PAYMENT_STATUS.REFUNDED;
    await payment.save();

    order.paymentStatus = PAYMENT_STATUS.REFUNDED;
    order.refund = {
      isRefunded: true,
      amountInPaise: payment.amountInPaise,
      reason,
      refundedAt: new Date(),
      razorpayRefundId: refundRes.id
    };
    order.timeline.push({
      status: PAYMENT_STATUS.REFUNDED,
      note: `Refund of ₹${payment.amountInPaise / 100} processed via Razorpay. Reason: ${reason}`,
      timestamp: new Date(),
      updatedBy: req.adminUser.name
    });
    await order.save();

    await AuditLog.create({
      adminUserId: req.adminUser._id,
      adminEmail: req.adminUser.email,
      action: 'REFUND_PAYMENT',
      resourceType: 'PAYMENT',
      resourceId: payment._id.toString(),
      changes: { refundId: refundRes.id, amountInRupees: payment.amountInPaise / 100, reason },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId: refundRes.id,
        order
      }
    });
  } catch (err) {
    console.error('[PaymentController] Refund error details:', err.message, err.stack);
    res.status(500).json({ success: false, message: err.message });
  }
};
