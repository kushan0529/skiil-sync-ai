const Project = require('../models/Project.model');
const Task = require('../models/Task.model');
const User = require('../models/User.model');
const aiService = require('../services/ai.service');
const { seedDemoProjects } = require('../utils/seedProjects');

exports.assignToBestProject = async (req, res, next) => {
  try {
    const targetUserId = req.body.userId || req.user._id;
    const user = await User.findById(targetUserId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // 1. Seed demo projects if they don't exist
    await seedDemoProjects(targetUserId);

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
    const { name, description, members, requiredSkills, startDate, deadline, tasks } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    
    const project = await Project.create({ 
      name, 
      description, 
      owner: req.user._id, 
      members: members || [],
      requiredSkills: requiredSkills || [],
      startDate,
      deadline
    });

    // Create tasks if provided
    if (tasks && Array.isArray(tasks) && tasks.length > 0) {
      const taskDocs = tasks.map(t => ({
        ...t,
        project: project._id,
      }));
      await Task.insertMany(taskDocs);
    }

    let message = 'Project created successfully';
    

    res.json({ project, message });
  } catch (err) { next(err); }
};

exports.listProjects = async (req, res, next) => {
  try {
    // Return all projects to all users so they can see the global project landscape
    const projects = await Project.find().populate('owner members', '-password');
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
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    const isMember = project.members.some(m => m.toString() === req.user._id.toString());
    const isOwner = project.owner && project.owner.toString() === req.user._id.toString();
    const isManager = req.user.role === 'manager' || req.user.role === 'admin';
    
    if (!isMember && !isOwner && !isManager) {
      return res.status(403).json({ error: 'Not authorized to update this project' });
    }
    
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('owner members', '-password');
    res.json({ project: updatedProject });
  } catch (err) { next(err); }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    // Delete all tasks associated with this project
    await Task.deleteMany({ project: req.params.id });
    
    res.json({ ok: true });
  } catch (err) { next(err); }
};

exports.seed = async (req, res, next) => {
  try {
    const created = await seedDemoProjects(req.user._id);
    res.json({ message: `${created.length} demo projects seeded successfully.`, projects: created });
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
