import app from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import { seedDatabase } from '../src/utils/seed.js';

let isReady = false;

export default async function handler(req, res) {
  if (!isReady) {
    try {
      await connectDB();
      await seedDatabase();
      isReady = true;
    } catch (err) {
      console.error('[Vercel Serverless] Failed to connect/seed DB:', err);
    }
  }
  return app(req, res);
}
