import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import { PAYMENT_STATUS, ORDER_STATUS } from '../config/constants.js';

class AnalyticsService {
  async getDashboardSummary() {
    // 1. Total order metrics - strictly confirmed paid orders
    const totalOrders = await Order.countDocuments({
      paymentStatus: { $in: [PAYMENT_STATUS.PAID, PAYMENT_STATUS.CAPTURED, 'REFUNDED'] }
    });
    
    // 2. Strict revenue aggregation: ONLY orders with paymentStatus === PAID or CAPTURED
    const verifiedOrders = await Order.find({
      paymentStatus: { $in: [PAYMENT_STATUS.PAID, PAYMENT_STATUS.CAPTURED] }
    }).select('totalAmountInPaise quantity');

    const totalVerifiedRevenueInPaise = verifiedOrders.reduce(
      (sum, ord) => sum + (ord.totalAmountInPaise || 0), 
      0
    );
    const totalBoxesSold = verifiedOrders.reduce(
      (sum, ord) => sum + (ord.quantity || 0), 
      0
    );

    // 3. Payment counts
    const successfulPayments = await Payment.countDocuments({
      status: { $in: [PAYMENT_STATUS.CAPTURED, PAYMENT_STATUS.PAID] }
    });
    const pendingPayments = await Payment.countDocuments({
      status: PAYMENT_STATUS.PENDING
    });
    const failedPayments = await Payment.countDocuments({
      status: PAYMENT_STATUS.FAILED
    });

    // 4. Refund statistics
    const refundedOrders = await Order.find({ 'refund.isRefunded': true }).select('refund');
    const totalRefundedInPaise = refundedOrders.reduce(
      (sum, ord) => sum + (ord.refund.amountInPaise || 0),
      0
    );

    // 5. Order status breakdown
    const statusCounts = {};
    for (const status of Object.values(ORDER_STATUS)) {
      statusCounts[status] = await Order.countDocuments({ orderStatus: status });
    }

    // 6. Recent 10 verified paid orders
    const recentOrders = await Order.find({
      paymentStatus: { $in: [PAYMENT_STATUS.PAID, PAYMENT_STATUS.CAPTURED, 'REFUNDED'] }
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderNumber customer.name customer.phone quantity totalAmountInPaise paymentStatus orderStatus createdAt');

    // 7. Daily revenue for the last 14 days
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const dailyTrends = await Order.aggregate([
      {
        $match: {
          paymentStatus: { $in: [PAYMENT_STATUS.PAID, PAYMENT_STATUS.CAPTURED] },
          createdAt: { $gte: fourteenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalRevenue: { $sum: '$totalAmountInPaise' },
          boxesCount: { $sum: '$quantity' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return {
      summary: {
        totalOrders,
        totalBoxesSold,
        totalVerifiedRevenueInPaise,
        totalVerifiedRevenueInRupees: totalVerifiedRevenueInPaise / 100,
        successfulPayments,
        pendingPayments,
        failedPayments,
        totalRefundedInPaise,
        totalRefundedInRupees: totalRefundedInPaise / 100
      },
      statusDistribution: statusCounts,
      recentOrders: recentOrders.map(o => ({
        id: o._id,
        orderNumber: o.orderNumber,
        customerName: o.customer?.name,
        customerPhone: o.customer?.phone,
        quantity: o.quantity,
        totalAmountInRupees: o.totalAmountInPaise / 100,
        paymentStatus: o.paymentStatus,
        orderStatus: o.orderStatus,
        createdAt: o.createdAt
      })),
      revenueTrends: dailyTrends.map(d => ({
        date: d._id,
        revenueInRupees: d.totalRevenue / 100,
        boxesCount: d.boxesCount,
        orderCount: d.orderCount
      }))
    };
  }
}

export default new AnalyticsService();
