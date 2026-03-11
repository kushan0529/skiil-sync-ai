const Project = require('../models/Project.model');
const User = require('../models/User.model');
const aiService = require('../services/ai.service');
const { seedDemoProjects } = require('../utils/seedProjects');

exports.assignToBestProject = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // 1. Seed demo projects if they don't exist
    await seedDemoProjects(req.user._id);

    // 2. Find all planning projects
    const projects = await Project.find({ status: 'planning' });
    if (projects.length === 0) return res.status(404).json({ error: 'No projects available' });

    // 3. Get AI recommendation
    const recommendations = await aiService.recommendProjects(user, projects);
    
    if (recommendations.length === 0) {
      // Fallback: assign to first project if AI fails
      const project = projects[0];
      if (!project.members.includes(user._id)) {
        project.members.push(user._id);
        await project.save();
      }
      return res.json({ project, reason: 'Assigned based on availability' });
    }

    // 4. Assign to the best match
    const bestMatch = recommendations[0];
    const project = projects[bestMatch.projectIdIndex];
    
    if (project && !project.members.includes(user._id)) {
      project.members.push(user._id);
      await project.save();
    }

    res.json({ project, reason: bestMatch.reason });
  } catch (err) { next(err); }
};

exports.createProject = async (req, res, next) => {
  try {
    const { name, description, members, requiredSkills } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const project = await Project.create({ 
      name, 
      description, 
      owner: req.user._id, 
      members: members || [],
      requiredSkills: requiredSkills || []
    });
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

exports.recommendProjects = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const projects = await Project.find({ status: 'planning' }); // Only suggest planning projects
    const recommendations = await aiService.recommendProjects(user, projects);
    
    // Map recommendations back to project objects
    const result = recommendations.map(rec => ({
      project: projects[rec.projectIdIndex],
      score: rec.score,
      reason: rec.reason
    })).filter(r => r.project);

    res.json({ recommendations: result });
  } catch (err) { next(err); }
};
