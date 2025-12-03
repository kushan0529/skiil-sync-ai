const Project = require('../models/Project.model');

exports.createProject = async (req, res, next) => {
  try {
    const { name, description, members } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const project = await Project.create({ name, description, owner: req.user._id, members: members || [] });
    res.json({ project });
  } catch (err) { next(err); }
};

exports.listProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ $or: [{ owner: req.user._id }, { members: req.user._id }] }).populate('owner members', '-password');
    res.json({ projects });
  } catch (err) { next(err); }
};

exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('owner members', '-password');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ project });
  } catch (err) { next(err); }
};

exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('owner members', '-password');
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ project });
  } catch (err) { next(err); }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
};
