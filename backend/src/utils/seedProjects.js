const Project = require('../models/Project.model');
const Task = require('../models/Task.model');

const demoProjects = [
  {
    name: 'AI-Genius (AI/ML)',
    description: 'AI-powered recommendation engine. Build high-performance NLP models.',
    requiredSkills: ['Python', 'TensorFlow', 'OpenAI', 'NLP', 'Machine Learning'],
    status: 'planning',
    tasks: [
      { title: 'Data Preprocessing', description: 'Clean and tokenize the dataset.', priority: 'High' },
      { title: 'Model Architecture', description: 'Design the transformer layers.', priority: 'Medium' }
    ]
  },
  {
    name: 'Web3-Explorer (Blockchain)',
    description: 'Decentralized application for tracking skills on-chain. Secure and transparent.',
    requiredSkills: ['Solidity', 'Ethereum', 'React', 'Web3.js', 'Blockchain'],
    status: 'planning',
    tasks: [
      { title: 'Smart Contract Design', description: 'Write the ERC-721 contract for skills.', priority: 'High' },
      { title: 'Frontend Integration', description: 'Connect Metamask to the DApp.', priority: 'Medium' }
    ]
  },
  {
    name: 'Data-Harbor (Big Data)',
    description: 'Real-time data pipeline for financial insights. Processing millions of events per second.',
    requiredSkills: ['Spark', 'Kafka', 'Scala', 'SQL', 'Big Data'],
    status: 'planning',
    tasks: [
      { title: 'Kafka Producer Setup', description: 'Configure producers for high-throughput.', priority: 'High' },
      { title: 'Spark SQL Queries', description: 'Write analytical queries for data processing.', priority: 'Medium' }
    ]
  },
  {
    name: 'Cloud-Scale (DevOps)',
    description: 'Auto-scaling infrastructure for global e-commerce. Focus on reliability.',
    requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'DevOps'],
    status: 'planning',
    tasks: [
      { title: 'Kubernetes Cluster Setup', description: 'EKS cluster deployment using Terraform.', priority: 'High' },
      { title: 'CI/CD Pipeline', description: 'Configure GitHub Actions for automated deployment.', priority: 'Medium' }
    ]
  },
  {
    name: 'User-First (UI/UX)',
    description: 'Modern dashboard for task management. High focus on interactive experiences.',
    requiredSkills: ['React', 'TypeScript', 'Tailwind', 'Figma', 'UI/UX'],
    status: 'planning',
    tasks: [
      { title: 'Component Library Design', description: 'Create reusable UI components in Figma.', priority: 'High' },
      { title: 'Interactive Dashboard', description: 'Implement the Kanban board drag-and-drop.', priority: 'Medium' }
    ]
  }
];

async function seedDemoProjects(ownerId) {
  for (const demo of demoProjects) {
    let project = await Project.findOne({ name: demo.name });
    if (!project) {
      project = await Project.create({ 
        name: demo.name, 
        description: demo.description, 
        requiredSkills: demo.requiredSkills, 
        status: demo.status, 
        owner: ownerId 
      });
      
      // Seed tasks for this project
      for (const t of demo.tasks) {
        await Task.create({
          ...t,
          project: project._id,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        });
      }
    }
  }
}

module.exports = { seedDemoProjects };
