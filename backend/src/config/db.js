const mongoose = require('mongoose');

module.exports = async function connectDB(mongoUrl) {
  if (mongoose.connection.readyState >= 1) return;

  if (!mongoUrl) {
    console.error('Missing MONGO_URL environment variable.');
    throw new Error('Database configuration missing');
  }

  try {
    await mongoose.connect(mongoUrl);
    console.log('MongoDB connected ✅');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
};
