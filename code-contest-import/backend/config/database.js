/*const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Prefer MONGO_URI, fall back to MONGODB_URI, then to local dev default
    const mongoUriFromEnv = process.env.MONGO_URI || process.env.MONGODB_URI;
    const defaultLocalUri = 'mongodb://127.0.0.1:27017/codecontest_dev';
    const isProduction = process.env.NODE_ENV === 'production';

    const mongoUri = mongoUriFromEnv || (!isProduction ? defaultLocalUri : undefined);

    if (!mongoUri) {
      throw new Error('MONGO_URI/MONGODB_URI missing. Provide in .env or set NODE_ENV!=production for local default.');
    }

    // Safe debug
    if (process.env.DEBUG_ENV === 'true') {
      const masked = mongoUri.replace(/([^:]+):([^@]+)@/, '***:***@');
      console.log('[DB] Using Mongo URI:', masked);
    }

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Allow app to continue in development without DB
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('⚠️  Continuing without database (development mode). Some API routes may be limited.');
    }
  }
};

module.exports = connectDB;*/

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use the MONGO_URI from .env (now pointing to MongoDB Atlas)
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('MONGO_URI is required in environment variables');
    }

    console.log('🔗 Connecting to MongoDB Atlas...');
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log('⚠️  Continuing in development mode without database');
    }
  }
};

module.exports = connectDB;


/*
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // TEMPORARY: Hardcode for testing
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codecontest';
    
    console.log('🔗 Connecting to MongoDB...');
    console.log('Using URI: mongodb://127.0.0.1:27017/codecontest');

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('⚠️  Continuing in development mode without database');
  }
};

module.exports = connectDB;*/