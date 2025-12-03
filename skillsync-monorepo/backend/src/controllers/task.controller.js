const Task = require('../models/Task.model');
const User = require('../models/User.model');
const { recommendAssignees } = require('../services/ai.service');

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, project, requiredSkills, estimatedHours, dueDate, candidateMemberIds } = req.body;
    if (!title || !project) return res.status(400).json({ error: 'title and project required' });

    const task = await Task.create({
      title,
      description,
      project,
      requiredSkills: requiredSkills || [],
      estimatedHours,
      dueDate
    });

    if (candidateMemberIds && candidateMemberIds.length) {
      const users = await User.find({ _id: { $in: candidateMemberIds } });
      const suggestions = await recommendAssignees(task, users);
      task.aiSuggestions = suggestions
        .map(s => ({
          userId: users[s.userIdIndex]?._id || null,
          score: s.score || 0,
          reason: s.reason || ''
        }))
        .filter(s => s.userId);
      await task.save();
    }

    const io = req.app.get('io');
    if (io) io.to(task.project.toString()).emit('taskCreated', task);

    res.json({ task });
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const io = req.app.get('io');
    if (io) io.to(task.project.toString()).emit('taskUpdated', task);

    res.json({ task });
  } catch (err) {
    next(err);
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignee aiSuggestions.userId', '-password');
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ task });
  } catch (err) {
    next(err);
  }
};

exports.listByProject = async (req, res, next) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId }).populate('assignee', '-password');
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};
