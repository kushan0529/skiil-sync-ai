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
  progress: { type: Number, default: 0, min: 0, max: 100 },
  preference: { type: String, enum: ['low', 'medium', 'high'], default: 'high' },
  estimatedHours: Number,
  startDate: Date,
  deadline: Date,
  aiSuggestions: [suggestionSchema],
  workLogs: [{
    date: { type: Date, default: Date.now },
    content: String,
  }]
}, { timestamps: true });

async function recalculateProjectProgress(projectId) {
  if (!projectId) return;
  try {
    const Project = mongoose.model('Project');
    const Task = mongoose.model('Task');
    
    const tasks = await Task.find({ project: projectId });
    if (tasks.length === 0) {
      await Project.findByIdAndUpdate(projectId, { progress: 0 });
      return;
    }
    
    const totalProgress = tasks.reduce((sum, task) => sum + (task.progress || 0), 0);
    const avgProgress = Math.round(totalProgress / tasks.length);
    
    await Project.findByIdAndUpdate(projectId, { progress: avgProgress });
  } catch (error) {
    console.error('Error recalculating project progress:', error);
  }
}

TaskSchema.post('save', async function(doc) {
  await recalculateProjectProgress(doc.project);
});

TaskSchema.post('findOneAndUpdate', async function(doc) {
  if (doc && doc.project) {
    await recalculateProjectProgress(doc.project);
  }
});

TaskSchema.post('findOneAndDelete', async function(doc) {
  if (doc && doc.project) {
    await recalculateProjectProgress(doc.project);
  }
});

TaskSchema.post('insertMany', async function(docs) {
  const projectIds = [...new Set(docs.map(d => d.project.toString()))];
  for (const pid of projectIds) {
    await recalculateProjectProgress(pid);
  }
});

module.exports = mongoose.model('Task', TaskSchema);
