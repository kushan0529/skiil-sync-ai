const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  score: Number,
  reason: String,
}, { _id: false });

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  preference: { type: String, enum: ['low', 'medium', 'high'], default: 'high' },
  estimatedHours: Number,
  dueDate: Date,
  aiSuggestions: [suggestionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
