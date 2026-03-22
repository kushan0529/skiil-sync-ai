const Project = require('../models/Project.model');
const Task = require('../models/Task.model');

const demoProjects = [
  {
    name: 'AI-Genius (AI/ML)',
    description: 'AI-powered recommendation engine. Build high-performance NLP models.',
    requiredSkills: ['Python', 'TensorFlow', 'OpenAI', 'NLP', 'Machine Learning'],
    status: 'planning',
    tasks: [
      { title: 'Data Preprocessing', description: 'Clean and tokenize the dataset.', priority: 'High', progress: 0 },
      { title: 'Model Architecture', description: 'Design the transformer layers.', priority: 'Medium', progress: 0 }
    ]
  },
  {
    name: 'Web3-Explorer (Blockchain)',
    description: 'Decentralized application for tracking skills on-chain. Secure and transparent.',
    requiredSkills: ['Solidity', 'Ethereum', 'React', 'Web3.js', 'Blockchain'],
    status: 'planning',
    tasks: [
      { title: 'Smart Contract Design', description: 'Write the ERC-721 contract for skills.', priority: 'High', progress: 0 },
      { title: 'Frontend Integration', description: 'Connect Metamask to the DApp.', priority: 'Medium', progress: 0 }
    ]
  },

  {
    name: 'Cloud-Scale (DevOps)',
    description: 'Auto-scaling infrastructure for global e-commerce. Focus on reliability.',
    requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'DevOps'],
    status: 'planning',
    tasks: [
      { title: 'Kubernetes Cluster Setup', description: 'EKS cluster deployment using Terraform.', priority: 'High', progress: 0 },
      { title: 'CI/CD Pipeline', description: 'Configure GitHub Actions for automated deployment.', priority: 'Medium', progress: 0 }
    ]
  },
  {
    name: 'User-First (UI/UX)',
    description: 'Modern dashboard for task management. High focus on interactive experiences.',
    requiredSkills: ['React', 'TypeScript', 'Tailwind', 'Figma', 'UI/UX'],
    status: 'planning',
    tasks: [
      { title: 'Component Library Design', description: 'Create reusable UI components in Figma.', priority: 'High', progress: 0 },
      { title: 'Interactive Dashboard', description: 'Implement the Kanban board drag-and-drop.', priority: 'Medium', progress: 0 }
    ]
  }
];

async function seedDemoProjects(ownerId) {
  const createdProjects = [];
  const thirtyDaysOut = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const threeDaysOut = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  for (const demo of demoProjects) {
    let project = await Project.findOne({ name: demo.name });
    if (!project) {
      project = await Project.create({ 
        name: demo.name, 
        description: demo.description, 
        requiredSkills: demo.requiredSkills, 
        status: demo.status, 
        owner: ownerId,
        deadline: thirtyDaysOut
      });
      createdProjects.push(project);
    }
    
    // Always check tasks for these projects to ensure they are seeded
    for (const t of demo.tasks) {
      const taskExists = await Task.findOne({ title: t.title, project: project._id });
      if (!taskExists) {
        await Task.create({
          ...t,
          project: project._id,
          deadline: threeDaysOut
        });
      }
    }
  }
  return createdProjects;
}

module.exports = { seedDemoProjects };
