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
    const isManager = req.user.role === 'manager' || req.user.role === 'admin';
    
    if (!isManager) {
      // Find all projects where the user is a member
      const projects = await Project.find({
        $or: [
          { members: req.user._id },
          { owner: req.user._id }
        ]
      });
      const projectIds = projects.map(p => p._id);
      
      // Filter tasks belonging to these projects OR assigned directly to the user
      query = {
        $or: [
          { project: { $in: projectIds } },
          { assignee: req.user._id }
        ]
      };
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
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    const isAssignee = task.assignee && task.assignee.toString() === req.user._id.toString();
    const isProjectMember = task.project && task.project.members.some(m => m.toString() === req.user._id.toString());
    const isManager = req.user.role === 'manager' || req.user.role === 'admin';
    
    if (!isAssignee && !isProjectMember && !isManager) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }
    
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('project assignee');
    
    const io_instance = req.app.get('io');
    if (io_instance) {
      if (updatedTask.project) {
        io_instance.to(updatedTask.project._id.toString()).emit('taskUpdate', { type: 'updated', task: updatedTask });
        io_instance.to(updatedTask.project._id.toString()).emit('projectUpdate', { type: 'recalculate', projectId: updatedTask.project._id });
      }
      io_instance.emit('globalUpdate', { type: 'taskUpdated', taskId: updatedTask._id });
    }
    res.json(updatedTask);
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
