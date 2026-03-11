const User = require('../models/User.model');
const resumeService = require('../services/resume.service');

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('name email role skills _id');
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Resume file required' });
    const buffer = req.file.buffer;
    const skills = await resumeService.getSkillsFromResume(buffer);
    const updated = await User.findByIdAndUpdate(req.user._id, { skills, resumeUrl: 'uploaded' }, { new: true }).select('-password');
    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
};
