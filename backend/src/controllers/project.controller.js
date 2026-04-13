const Project = require('../models/Project.model');
const Task = require('../models/Task.model');
const User = require('../models/User.model');
const aiService = require('../services/ai.service');
const { seedOneProject } = require('../utils/seedProjects');
const emailService = require('../services/email.service');

exports.assignToBestProject = async (req, res, next) => {
  try {
    const targetUserId = req.body.userId || req.user._id;
    
    // 1. Parallel fetch User and Planning Projects (Fast)
    const [user, projects] = await Promise.all([
      User.findById(targetUserId),
      Project.find({ status: 'planning' }).lean()
    ]);

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (projects.length === 0) return res.status(404).json({ error: 'No planning projects available' });

    // 2. Get AI recommendation (Fast Groq call)
    const recommendations = await aiService.recommendProjects(user, projects);
    
    let assignedProject = null;
    let reason = '';

    if (recommendations.length === 0) {
      assignedProject = projects[0];
      reason = 'Assigned based on availability';
    } else {
      const bestMatch = recommendations[0];
      assignedProject = projects[bestMatch.projectIdIndex] || projects[0];
      reason = bestMatch.reason;
    }

    // 3. Persist assignment in background but await the critical save
    if (!assignedProject.members.some(m => m.toString() === user._id.toString())) {
      await Project.updateOne(
        { _id: assignedProject._id },
        { $addToSet: { members: user._id } }
      );
    }

    // Send email notification in background (Non-blocking for faster response)
    if (assignedProject) {
      console.log(`[project.controller] Triggering background email to ${user.email} for project ${assignedProject.name}`);
      const currentUserId = req.user._id;
      const path = `/projects/${assignedProject._id}`;
      
      User.findById(currentUserId).then(manager => {
        if (manager) {
          emailService.sendProjectAssignmentEmail(assignedProject, user, manager, path)
            .then(status => console.log(`[project.controller] Background email sent:`, status))
            .catch(err => console.error(`[project.controller] Background email failed:`, err.message));
        }
      });
    }

    res.json({ 
      project: assignedProject, 
      reason, 
      mailStatus: { success: true, message: 'Assignment processed. Notification email is being sent.' } 
    });

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

    // Send emails to all members in parallel (Non-blocking)
    if (members && members.length > 0) {
      const manager = await User.findById(req.user._id);
      const path = `/projects/${project._id}`;
      
      // We don't await this, let them send in background
      Promise.all(members.map(async (memberId) => {
        const member = await User.findById(memberId);
        if (member && member.email) {
          return emailService.sendProjectAssignmentEmail(project, member, manager, path);
        }
      })).then(results => {
        console.log(`[project.controller] Batch email results:`, results.length);
      }).catch(err => console.error(`[project.controller] Batch email error:`, err));
    }

    let message = 'Project created successfully. Notifications are being sent to members.';
    res.json({ project, message, mailStatus: { success: true } });
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

    const oldMembers = project.members.map(m => m.toString());
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('owner members', '-password');
    
    // Check for new members
    const currentMembers = updatedProject.members.map(m => (m._id || m).toString());
    const newMembers = currentMembers.filter(mId => !oldMembers.includes(mId));

    // Process emails in background
    // Send to: newly added members OR if explicitly requested via forceNotify
    const targetEmails = req.body.forceNotify ? currentMembers : newMembers;

    if (targetEmails.length > 0) {
      const manager = await User.findById(req.user._id);
      const path = `/projects/${updatedProject._id}`;
      
      Promise.all(targetEmails.map(async (memberId) => {
        const member = await User.findById(memberId);
        if (member && member.email) {
          return emailService.sendProjectAssignmentEmail(updatedProject, member, manager, path);
        }
      })).then(results => {
        console.log(`[project.controller] Assignment notifications dispatched:`, results.length);
      }).catch(err => console.error(`[project.controller] Update email background error:`, err));
    }

    res.json({ 
      project: updatedProject, 
      message: 'Project updated successfully. Notifications triggered for new members.',
      mailStatus: { success: true } 
    });
  } catch (err) { 
    next(err); 
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    // Delete all tasks associated with this project (Background)
    Task.deleteMany({ project: req.params.id }).catch(err => console.error('[project.controller] Task deletion error:', err));
    
    res.json({ ok: true });
  } catch (err) { next(err); }
};

exports.seed = async (req, res, next) => {
  try {
    const created = await seedOneProject(req.user._id);
    res.json({ message: 'Demo project seeded successfully.', project: created });
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
