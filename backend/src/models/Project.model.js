const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  requiredSkills: [{ type: String }],
  status: { type: String, enum: ['planning', 'active', 'completed', 'on-hold'], default: 'planning' },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  startDate: { type: Date },
  deadline: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
