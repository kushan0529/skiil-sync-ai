const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, unique: true, lowercase: true },
  password: { type: String },
  role: { type: String, enum: ['admin', 'manager', 'member'], default: 'member' },
  skills: [{ type: String }],
  resumeUrl: { type: String },
  availabilityScore: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
