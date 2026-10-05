const mongoose = require('mongoose');
const dns = require('dns');

// Set DNS servers to resolve SRV queries properly on Windows
dns.setServers(['8.8.8.8', '8.8.4.4']); // Google DNS

const connectDB = async (uri = process.env.MONGODB_URI) => {
  try {
    if (!uri) {
      throw new Error('MONGODB_URI is required');
    }

    const opts = {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4
    };

    console.log('Attempting MongoDB connection...');
    await mongoose.connect(uri, opts);
    console.log('✅ MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

module.exports = connectDB;
