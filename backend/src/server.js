import 'dotenv/config';

import app from './app.js';
import { connectDB, closeDB } from './config/db.js';
import { seedDatabase } from './utils/seed.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Ensure initial seed data exists
    await seedDatabase();

    // 3. Start Express server
    const server = app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(` Sri Sankara TV E-Commerce Backend Server Running`);
      console.log(` Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(` Port        : ${PORT}`);
      console.log(` API URL     : http://localhost:${PORT}/api/v1`);
      console.log(` Health      : http://localhost:${PORT}/health`);
      console.log(`======================================================\n`);
    });

    // Graceful shutdown
    const handleShutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        console.log('[Server] HTTP server closed.');
        await closeDB();
        console.log('[Server] Database connection closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));

  } catch (err) {
    console.error('[Server] Critical startup error:', err);
    process.exit(1);
  }
}

startServer();
