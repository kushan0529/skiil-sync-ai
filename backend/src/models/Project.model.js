const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  requiredSkills: [{ type: String }],
  status: { type: String, enum: ['planning', 'active', 'completed', 'on-hold'], default: 'planning' }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
