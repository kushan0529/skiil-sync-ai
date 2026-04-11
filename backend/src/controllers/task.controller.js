const Task = require('../models/Task.model');
const Project = require('../models/Project.model');
const User = require('../models/User.model');
const emailService = require('../services/email.service');

exports.createTask = async (req, res, next) => {
  try {
    const task = await Task.create(req.body);
    const io = req.app.get('io');
    if (io && task.project) {
      io.to(task.project.toString()).emit('taskUpdate', { type: 'created', task });
      io.emit('globalUpdate', { type: 'taskCreated', taskId: task._id });
    }

    // Send email if assigned (Non-blocking)
    if (task.assignee) {
      const currentUserId = req.user._id;
      const path = task.project ? `/projects/${task.project}` : '';
      
      Promise.all([
        User.findById(task.assignee),
        User.findById(currentUserId)
      ]).then(([assignee, manager]) => {
        if (assignee && manager) {
          emailService.sendTaskAssignmentEmail(task, assignee, manager, path)
            .then(status => console.log(`[task.controller] Background email status:`, status))
            .catch(err => console.error(`[task.controller] Background email error:`, err));
        }
      }).catch(err => console.error(`[task.controller] Error fetching users for background email:`, err));
    }

    res.json({ task, mailStatus: { success: true, message: 'Email triggered in background' } });
  } catch (err) {
    next(err);
  }
};

exports.listTasks = async (req, res, next) => {
  try {
    let query = {};
    const isManager = req.user.role === 'manager' || req.user.role === 'admin';
    
    // For both managers and members, we want tasks from projects they are part of
    const projects = await Project.find({
      $or: [
        { members: req.user._id },
        { owner: req.user._id }
      ]
    });
    const projectIds = projects.map(p => p._id);
    
    query = {
      $or: [
        { project: { $in: projectIds } },
        { assignee: req.user._id }
      ]
    };

    const tasks = await Task.find(query).populate('project', 'name requiredSkills').populate('assignee', 'name');
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

exports.getTask = async (req, res, next) => {
  try{
    const task = await Task.findById(req.params.id).populate('assignee', 'name');
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ task });
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const oldTask = await Task.findById(req.params.id).populate('project');
    if (!oldTask) return res.status(404).json({ error: 'Task not found' });
    
    // Check auth
    const isAssignee = oldTask.assignee && oldTask.assignee.toString() === req.user._id.toString();
    const isProjectMember = oldTask.project && oldTask.project.members && oldTask.project.members.some(m => m.toString() === req.user._id.toString());
    const isManager = req.user.role === 'manager' || req.user.role === 'admin';
    
    if (!isAssignee && !isProjectMember && !isManager) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }
    
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('project assignee');
    
    // Send email if assignee changed (Non-blocking)
    if (req.body.assignee && (!oldTask.assignee || oldTask.assignee.toString() !== req.body.assignee.toString())) {
      const currentUserId = req.user._id;
      const path = updatedTask.project ? `/projects/${updatedTask.project._id}` : '';
      
      Promise.all([
        User.findById(req.body.assignee),
        User.findById(currentUserId)
      ]).then(([assignee, manager]) => {
        if (assignee && manager) {
          emailService.sendTaskAssignmentEmail(updatedTask, assignee, manager, path)
            .then(status => console.log(`[task.controller] Background update email status:`, status))
            .catch(err => console.error(`[task.controller] Background update email error:`, err));
        }
      }).catch(err => console.error(`[task.controller] Error fetching users for background email update:`, err));
    }

    const io = req.app.get('io');
    if (io) {
      if (updatedTask.project) {
        io.to(updatedTask.project._id.toString()).emit('taskUpdate', { type: 'updated', task: updatedTask });
        io.to(updatedTask.project._id.toString()).emit('projectUpdate', { type: 'recalculate', projectId: updatedTask.project._id });
      }
      io.emit('globalUpdate', { type: 'taskUpdated', taskId: updatedTask._id });
    }
    res.json({ task: updatedTask, mailStatus: { success: true, message: 'Email triggered in background' } });
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
    const oldTask = await Task.findById(req.params.id);
    const task = await Task.findByIdAndUpdate(req.params.id, { assignee: req.body.userId }, { new: true }).populate('project');
    
    // Non-blocking email
    if (req.body.userId && (!oldTask.assignee || oldTask.assignee.toString() !== req.body.userId.toString())) {
      const currentUserId = req.user._id;
      const path = task.project ? `/projects/${task.project._id}` : '';
      
      Promise.all([
        User.findById(req.body.userId),
        User.findById(currentUserId)
      ]).then(([assignee, manager]) => {
        if (assignee && manager) {
          emailService.sendTaskAssignmentEmail(task, assignee, manager, path)
            .then(status => console.log(`[task.controller] Background assignment email status:`, status))
            .catch(err => console.error(`[task.controller] Background assignment email error:`, err));
        }
      });
    }

    res.json({ task, mailStatus: { success: true, message: 'Email triggered in background' } });
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
