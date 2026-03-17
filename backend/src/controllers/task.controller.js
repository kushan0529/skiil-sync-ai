const Task = require('../models/Task.model');

exports.createTask = async (req, res, next) => {
  try {
    const task = await Task.create(req.body);
    const io = req.app.get('io');
    if (io && task.project) {
      io.to(task.project.toString()).emit('taskUpdate', { type: 'created', task });
      io.emit('globalUpdate', { type: 'taskCreated', taskId: task._id });
    }
    res.json(task);
  } catch (err) {
    next(err);
  }
};

exports.listTasks = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      query.assignee = req.user._id;
    }
    const tasks = await Task.find(query).populate('project', 'name').populate('assignee', 'name');
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

exports.getTask = async (req, res, next) => {
  try{
    const task = await Task.findById(req.params.id).populate('assignee', 'name');
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('project assignee');
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    const io = req.app.get('io');
    const io_instance = req.app.get('io');
    if (io_instance) {
      if (task.project) {
        io_instance.to(task.project._id.toString()).emit('taskUpdate', { type: 'updated', task });
        io_instance.to(task.project._id.toString()).emit('projectUpdate', { type: 'recalculate', projectId: task.project._id });
      }
      io_instance.emit('globalUpdate', { type: 'taskUpdated', taskId: task._id });
    }
    res.json(task);
  } catch (err) {
    next(err);
  }
};

exports.listByProject = async (req, res, next) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId }).populate('assignee', 'name');
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

exports.assignee = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, { assignee: req.body.userId }, { new: true });
    res.json(task);
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ ok: true, message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
};
