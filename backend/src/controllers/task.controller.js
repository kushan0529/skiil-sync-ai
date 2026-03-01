const Task = require('../models/Task.model');

exports.createTask = async (req, res, next) => {
  try {
    const task = await Task.create(req.body);
    res.json(task);
  } catch (err) {
    next(err);
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.find().populate('assignee', 'name');
    res.json(task);
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
