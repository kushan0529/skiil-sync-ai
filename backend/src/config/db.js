const mongoose = require('mongoose');

module.exports = async function connectDB(mongoUrl) {
  try {
    await mongoose.connect(mongoUrl);
    console.log('MongoDB connected ✅');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
};


