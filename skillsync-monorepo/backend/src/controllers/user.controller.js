const User = require('../models/User.model');
const { extractText, simpleSkillExtract } = require('../services/resume.service');

exports.getMe = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
};

exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Resume file required' });
    const buffer = req.file.buffer;
    const text = await extractText(buffer);
    const skills = await simpleSkillExtract(text);
    const updated = await User.findByIdAndUpdate(req.user._id, { skills, resumeUrl: 'uploaded' }, { new: true }).select('-password');
    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
};
