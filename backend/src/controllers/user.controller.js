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
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Resume file required' });
    
    // If manager is uploading for a specific user
    const targetUserId = req.body.userId || req.user._id;
    
    // Only allow self-upload or manager/admin upload
    if (targetUserId.toString() !== req.user._id.toString() && 
        req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const buffer = req.file.buffer;
    const skills = await resumeService.getSkillsFromResume(buffer);
    const updated = await User.findByIdAndUpdate(targetUserId, { skills, resumeUrl: 'uploaded' }, { new: true }).select('-password');
    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
};

exports.approveUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ ok: true, user });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ ok: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};
