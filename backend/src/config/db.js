import 'dotenv/config';
import mongoose from 'mongoose';

let mongoMemoryServer = null;

export const connectDB = async (options = {}) => {
  const isTest = process.env.NODE_ENV === 'test' || options.useMemory;

  if (isTest) {
    try {
      console.log('[Database] Test environment: Starting isolated in-memory MongoDB...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] Connected to In-Memory MongoDB successfully at: ${memoryUri}`);
      return mongoose.connection;
    } catch (inMemErr) {
      console.error(`[Database] Failed to initialize in-memory MongoDB: ${inMemErr.message}`);
      throw inMemErr;
    }
  }

  const uri = process.env.MONGODB_URI;

  try {
    if (uri) {
      console.log(`[Database] Attempting connection to MongoDB at: ${uri.replace(/\/\/.*@/, '//<credentials>@')}`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[Database] MongoDB connected successfully to: ${mongoose.connection.host}`);
      return mongoose.connection;
    }
  } catch (err) {
    console.warn(`[Database] Direct MongoDB connection failed (${err.message}). Falling back to MongoMemoryServer for development...`);
  }

  // Fallback to in-memory MongoDB for painless dev/test if local MongoDB service is not started
  try {
    console.log('[Database] Starting in-memory MongoDB server...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[Database] Connected to In-Memory MongoDB successfully at: ${memoryUri}`);
    return mongoose.connection;
  } catch (inMemErr) {
    console.error(`[Database] Failed to initialize in-memory MongoDB: ${inMemErr.message}`);
    throw inMemErr;
  }
};

export const closeDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } catch (err) {
    console.error(`[Database] Error disconnecting database: ${err.message}`);
  }
};
