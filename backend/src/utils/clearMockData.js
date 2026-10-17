import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, closeDB } from '../config/db.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Customer from '../models/Customer.js';
import EmailLog from '../models/EmailLog.js';
import AuditLog from '../models/AuditLog.js';
import Product from '../models/Product.js';
import AdminUser from '../models/AdminUser.js';
import Setting from '../models/Setting.js';

export const clearMockData = async () => {
  console.log('[ClearMockData] Starting cleanup of mock and test records from database...');

  try {
    const ordersDeleted = await Order.deleteMany({});
    console.log(`[ClearMockData] Removed ${ordersDeleted.deletedCount} mock/test orders.`);

    const paymentsDeleted = await Payment.deleteMany({});
    console.log(`[ClearMockData] Removed ${paymentsDeleted.deletedCount} mock/test payments.`);

    const customersDeleted = await Customer.deleteMany({});
    console.log(`[ClearMockData] Removed ${customersDeleted.deletedCount} mock/test customers.`);

    const emailLogsDeleted = await EmailLog.deleteMany({});
    console.log(`[ClearMockData] Removed ${emailLogsDeleted.deletedCount} mock/test email logs.`);

    const auditLogsDeleted = await AuditLog.deleteMany({});
    console.log(`[ClearMockData] Removed ${auditLogsDeleted.deletedCount} test audit logs.`);

    // Check remaining essential collections
    const productCount = await Product.countDocuments();
    const adminCount = await AdminUser.countDocuments();
    const settingsCount = await Setting.countDocuments();

    console.log('----------------------------------------------------');
    console.log(`[ClearMockData] Cleanup complete.`);
    console.log(`[ClearMockData] Active Products preserved: ${productCount}`);
    console.log(`[ClearMockData] Admin Users preserved: ${adminCount}`);
    console.log(`[ClearMockData] Settings preserved: ${settingsCount}`);
    console.log(`[ClearMockData] Live database is now clean and ready for real devotees.`);
    console.log('----------------------------------------------------');
  } catch (err) {
    console.error('[ClearMockData] Failed to clear mock data:', err);
    throw err;
  }
};

// If run directly from CLI
if (process.argv[1]?.endsWith('clearMockData.js')) {
  (async () => {
    try {
      await connectDB();
      await clearMockData();
      await closeDB();
      process.exit(0);
    } catch (err) {
      console.error('[ClearMockData] Error:', err);
      process.exit(1);
    }
  })();
}
