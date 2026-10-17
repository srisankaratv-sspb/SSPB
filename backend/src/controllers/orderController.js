import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import AuditLog from '../models/AuditLog.js';
import Customer from '../models/Customer.js';
import orderService from '../services/orderService.js';
import brevoService from '../services/brevoService.js';
import { ORDER_STATUS, PAYMENT_STATUS } from '../config/constants.js';

export const createOrder = async (req, res) => {
  try {
    const { productSlug, quantity, customer } = req.body;
    const result = await orderService.createOrder({
      productSlug,
      quantity,
      customer,
      customerUser: req.customer
    });
    res.status(201).json({
      success: true,
      message: 'Order created successfully. Please complete payment.',
      data: result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

export const getOrderStatus = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = await Order.findOne({ orderNumber: orderNumber.toUpperCase() });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order ${orderNumber} not found.`
      });
    }

    // Return safe customer-facing view
    res.status(200).json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        customerName: order.customer.name,
        maskedPhone: order.customer.phone.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2'),
        deliveryCity: order.customer.city,
        deliveryState: order.customer.state,
        quantity: order.quantity,
        totalAmountInRupees: order.totalAmountInPaise / 100,
        currency: order.currency,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        tracking: order.tracking,
        timeline: order.timeline.map(t => ({
          status: t.status,
          note: t.note,
          timestamp: t.timestamp
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAdminOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, orderStatus, paymentStatus, startDate, endDate } = req.query;

    const query = {};

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { orderNumber: searchRegex },
        { 'customer.name': searchRegex },
        { 'customer.phone': searchRegex },
        { razorpayPaymentId: searchRegex },
        { razorpayOrderId: searchRegex }
      ];
    }

    if (orderStatus) {
      query.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    } else {
      query.paymentStatus = { $in: [PAYMENT_STATUS.PAID, PAYMENT_STATUS.CAPTURED, 'REFUNDED'] };
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Order.countDocuments(query);

    const statsAgg = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalBoxes: { $sum: '$quantity' },
          totalRevenuePaise: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'PAID'] }, '$totalAmountInPaise', 0]
            }
          },
          paidCount: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'PAID'] }, 1, 0]
            }
          },
          pendingCount: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'PENDING'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const stats = statsAgg[0] || {
      totalOrders: total,
      totalBoxes: 0,
      totalRevenuePaise: 0,
      paidCount: 0,
      pendingCount: 0
    };

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      data: {
        orders,
        stats: {
          totalOrders: stats.totalOrders || total,
          totalBoxes: stats.totalBoxes || 0,
          totalRevenueInRupees: (stats.totalRevenuePaise || 0) / 100,
          paidCount: stats.paidCount || 0,
          pendingCount: stats.pendingCount || 0
        },
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

export const getAdminOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const payment = await Payment.findOne({ orderId: order._id });

    res.status(200).json({
      success: true,
      data: {
        order,
        payment
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note = '', trackingNumber, carrier } = req.body;

    if (!Object.values(ORDER_STATUS).includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status transition' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = status;

    if (trackingNumber) {
      order.tracking.trackingNumber = trackingNumber;
    }
    if (carrier) {
      order.tracking.carrier = carrier;
    }
    if (status === ORDER_STATUS.DISPATCHED && !order.tracking.dispatchedAt) {
      order.tracking.dispatchedAt = new Date();
    }
    if (status === ORDER_STATUS.DELIVERED && !order.tracking.deliveredAt) {
      order.tracking.deliveredAt = new Date();
    }

    order.timeline.push({
      status,
      note: note || `Status changed from ${previousStatus} to ${status}`,
      timestamp: new Date(),
      updatedBy: req.adminUser.name
    });

    await order.save();

    // Trigger Brevo status update email if customer email exists
    try {
      if (order.customer.email && (status === ORDER_STATUS.DISPATCHED || status === ORDER_STATUS.DELIVERED)) {
        await brevoService.sendOrderStatusUpdate(order);
      }
    } catch (e) {
      console.warn(`[OrderController] Failed to send status email: ${e.message}`);
    }

    // Audit log
    await AuditLog.create({
      adminUserId: req.adminUser._id,
      adminEmail: req.adminUser.email,
      action: 'UPDATE_ORDER_STATUS',
      resourceType: 'ORDER',
      resourceId: order._id.toString(),
      changes: { previousStatus, newStatus: status, note, tracking: order.tracking },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const exportOrdersCSV = async (req, res) => {
  try {
    const orders = await Order.find({
      paymentStatus: { $in: [PAYMENT_STATUS.PAID, PAYMENT_STATUS.CAPTURED, 'REFUNDED'] }
    }).sort({ createdAt: -1 });

    const headers = [
      'Order Number',
      'Created At',
      'Customer Name',
      'Mobile Phone',
      'Email',
      'Address',
      'City',
      'State',
      'Pincode',
      'Quantity',
      'Unit Price (INR)',
      'Total Amount (INR)',
      'Payment Status',
      'Order Status',
      'Razorpay Order ID',
      'Razorpay Payment ID'
    ];

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = orders.map(o => [
      escapeCSV(o.orderNumber),
      escapeCSV(new Date(o.createdAt).toISOString()),
      escapeCSV(o.customer?.name),
      escapeCSV(o.customer?.phone),
      escapeCSV(o.customer?.email || ''),
      escapeCSV(o.customer?.address),
      escapeCSV(o.customer?.city),
      escapeCSV(o.customer?.state),
      escapeCSV(o.customer?.pincode),
      escapeCSV(o.quantity),
      escapeCSV(o.unitPriceInPaise / 100),
      escapeCSV(o.totalAmountInPaise / 100),
      escapeCSV(o.paymentStatus),
      escapeCSV(o.orderStatus),
      escapeCSV(o.razorpayOrderId || ''),
      escapeCSV(o.razorpayPaymentId || '')
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="sri_sankara_orders_${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteAdminOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Remove linked payments
    await Payment.deleteMany({ orderId: order._id });

    // Remove order
    await Order.findByIdAndDelete(id);

    // Audit log
    await AuditLog.create({
      adminUserId: req.adminUser._id,
      adminEmail: req.adminUser.email,
      action: 'DELETE_ORDER',
      resourceType: 'ORDER',
      resourceId: order._id.toString(),
      changes: {
        orderNumber: order.orderNumber,
        customer: order.customer,
        quantity: order.quantity,
        totalAmountInRupees: order.totalAmountInPaise / 100
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      message: `Order ${order.orderNumber} deleted successfully.`,
      data: { orderId: id, orderNumber: order.orderNumber }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCustomerOrders = async (req, res) => {
  try {
    const phone = req.query.phone ? req.query.phone.trim().replace(/[\s-]/g, '').replace(/^\+91/, '') : '';
    const email = req.query.email ? req.query.email.trim().toLowerCase() : '';

    if (!phone && !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number or email to view booked orders.'
      });
    }

    const query = { $or: [] };
    if (phone) {
      query.$or.push({ 'customer.phone': phone });
      query.$or.push({ 'customer.phone': `+91${phone}` });
    }
    if (email) {
      query.$or.push({ 'customer.email': email });
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    // Customer profile info
    let customer = await Customer.findOne({
      $or: [
        ...(phone ? [{ phone }, { phone: `+91${phone}` }] : []),
        ...(email ? [{ email }] : [])
      ]
    });

    const latestOrder = orders[0];

    const profileData = {
      name: customer?.name || latestOrder?.customer?.name || 'Devotee',
      phone: phone || customer?.phone || latestOrder?.customer?.phone || '',
      email: email || customer?.email || latestOrder?.customer?.email || '',
      address: latestOrder?.customer?.address || '',
      city: latestOrder?.customer?.city || '',
      state: latestOrder?.customer?.state || 'Tamil Nadu',
      pincode: latestOrder?.customer?.pincode || '',
      totalOrders: orders.length,
      totalBoxes: orders.reduce((acc, o) => acc + (o.quantity || 0), 0),
      totalSpentInRupees: orders
        .filter(o => o.paymentStatus === 'PAID' || o.paymentStatus === 'CAPTURED')
        .reduce((acc, o) => acc + ((o.totalAmountInPaise || 0) / 100), 0)
    };

    res.status(200).json({
      success: true,
      data: {
        customer: profileData,
        orders: orders.map(o => ({
          _id: o._id,
          orderNumber: o.orderNumber,
          productName: o.productName,
          quantity: o.quantity,
          unitPriceInRupees: o.unitPriceInPaise / 100,
          totalAmountInRupees: o.totalAmountInPaise / 100,
          paymentStatus: o.paymentStatus,
          orderStatus: o.orderStatus,
          customer: o.customer,
          tracking: o.tracking,
          timeline: o.timeline,
          createdAt: o.createdAt
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

