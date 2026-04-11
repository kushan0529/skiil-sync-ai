const Project = require('../models/Project.model');
const Task = require('../models/Task.model');

const demoProjects = [
  {
    name: 'AI-Genius (AI/ML)',
    description: 'Next-generation AI-powered recommendation engine designed for high-scale e-commerce platforms. This project involves building high-performance Natural Language Processing (NLP) models using state-of-the-art transformer architectures to personalize user experiences, automate content discovery, and provide predictive analytics for customer behavior.',
    requiredSkills: ['Python', 'TensorFlow', 'OpenAI', 'NLP', 'Machine Learning'],
    status: 'planning',
    tasks: [
      { title: 'Data Preprocessing', description: 'Clean, normalize, and tokenize massive datasets for transformer model training.', priority: 'High', progress: 0 },
      { title: 'Model Architecture', description: 'Design and implement custom transformer layers optimized for recommendation accuracy.', priority: 'Medium', progress: 0 },
      { title: 'API Integration', description: 'Develop and expose the model via a high-performance, low-latency FastAPI endpoint.', priority: 'Low', progress: 0 }
    ]
  },
  {
    name: 'Web3-Explorer (Blockchain)',
    description: 'Deconstruct and revolutionize professional identity with a decentralized application for tracking skills on-chain. This project implements secure, immutable smart contracts on the Ethereum blockchain to provide verified skill tracking and verifiable NFT-based certifications for developers and organizations globally.',
    requiredSkills: ['Solidity', 'Ethereum', 'React', 'Web3.js', 'Blockchain'],
    status: 'planning',
    tasks: [
      { title: 'Smart Contract Design', description: 'Author and audit the core ERC-721 contract for immutable skill verification tokens.', priority: 'High', progress: 0 },
      { title: 'On-chain Event Tracking', description: 'Implement a high-speed indexer to track and sync contract events in real-time.', priority: 'Medium', progress: 0 }
    ]
  },
  {
    name: 'Cloud-Scale (DevOps)',
    description: 'Architect and manage global-scale auto-scaling infrastructure for enterprise-level e-commerce operations. The focus is on implementing high availability across multiple cloud regions, multi-tier disaster recovery strategies, and fully automated CI/CD pipelines to ensure 99.99% uptime for critical business services.',
    requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'DevOps'],
    status: 'planning',
    tasks: [
      { title: 'EKS Cluster Deployment', description: 'Provision and configure a production-grade Kubernetes cluster using Terraform IaC.', priority: 'High', progress: 0 },
      { title: 'Zero-Downtime Deployment', description: 'Implement canary and blue-green deployment strategies using Helm and Istio.', priority: 'Medium', progress: 0 }
    ]
  },
  {
    name: 'User-First (UI/UX)',
    description: 'Develop a next-generation workspace dashboard featuring highly interactive and fluid user experiences. This project leverages React and Framer Motion to create a workspace that feels alive, focusing on real-time collaborative editing, complex state management, and intuitive micro-interactions that redefine professional productivity.',
    requiredSkills: ['React', 'TypeScript', 'Tailwind', 'Figma', 'UI/UX'],
    status: 'planning',
    tasks: [
      { title: 'Design System Implementation', description: 'Translate complex Figma designs into a robust, accessible, and reusable component library.', priority: 'High', progress: 0 },
      { title: 'Real-time Sync Engine', description: 'Implement WebSocket-based synchronization for seamless live collaborative features.', priority: 'Medium', progress: 0 }
    ]
  },
  {
    name: 'Secure-Vault (Cybersecurity)',
    description: 'Engineer a robust, enterprise-grade encryption and threat detection platform. This project focuses on building zero-trust architectures, implementing AES-256 standards, and developing automated vulnerability scanning systems to proactively protect critical data assets against modern cyber threats.',
    requiredSkills: ['Go', 'AES-256', 'OAuth2', 'Cloud Security', 'Network Protocol'],
    status: 'in-progress',
    tasks: [
      { title: 'Encryption Module', description: 'Implement secure, audited end-to-end encryption for multi-tenant data storage.', priority: 'High', progress: 0 },
      { title: 'Threat Monitoring', description: 'Construct a real-time behavioral analysis system to detect and flag suspicious patterns.', priority: 'Medium', progress: 0 }
    ]
  },
  {
    name: 'Data-Flow (Data Engineering)',
    description: 'Construct a high-throughput, real-time data pipeline capable of processing billions of events per hour. Using a stack of Kafka and Apache Spark, this project delivers ultra-low latency analytics and provides business stakeholders with actionable insights derived from raw event streams in seconds.',
    requiredSkills: ['Kafka', 'Apache Spark', 'Scala', 'PostgreSQL', 'Data Lake'],
    status: 'planning',
    tasks: [
      { title: 'Stream Processor', description: 'Develop complex Spark Streaming jobs for real-time aggregation of transactional data.', priority: 'Medium', progress: 0 },
      { title: 'ETL Optimization', description: 'Tune and optimize distributed SQL queries for multi-terabyte analytical data lakes.', priority: 'High', progress: 0 }
    ]
  },
  {
    name: 'Mobile-Mate (Mobile App)',
    description: 'Build a cross-platform health and fitness tracking application with advanced offline-first capabilities. The project focuses on seamless multi-device synchronization, highly encrypted local-first data storage, and the development of custom native modules to ensure high-performance animations and sensor integration.',
    requiredSkills: ['React Native', 'SQLite', 'Firebase', 'Redux', 'iOS/Android'],
    status: 'planning',
    tasks: [
      { title: 'Offline Storage', description: 'Architect a robust, conflict-free synchronization engine using SQLite and Redux-Persist.', priority: 'High', progress: 0 },
      { title: 'Biometric Auth', description: 'Integrate native biometric authentication modules for both iOS and Android platforms.', priority: 'Medium', progress: 0 }
    ]
  },
  {
    name: 'Eco-Sync (Sustainability)',
    description: 'Create a comprehensive carbon footprint monitoring platform for complex global supply chains. This initiative integrates real-time IoT sensor data to provide end-to-end visibility into environmental impact, enabling companies to track sustainability goals and identify efficiency improvements with precision.',
    requiredSkills: ['Node.js', 'IoT', 'GraphQL', 'D3.js', 'Sustainability'],
    status: 'planning',
    tasks: [
      { title: 'IoT Hub Integration', description: 'Establish secure, high-speed telemetry streams from globally distributed IoT sensors.', priority: 'High', progress: 0 },
      { title: 'Metric Visualization', description: 'Develop advanced D3-based dashboards for visualizing complex environmental impact data.', priority: 'Medium', progress: 0 }
    ]
  },
  {
    name: 'Game-Engine (Graphics)',
    description: 'Develop a specialized, high-performance 3D rendering engine for advanced browser-based simulations and games. Utilizing WebGL 2.0 and WebAssembly, this project aims to achieve near-native execution speeds for complex physics calculations and high-fidelity real-time graphics rendering.',
    requiredSkills: ['C++', 'Rust', 'WebGL', 'WebAssembly', 'Physics Engine'],
    status: 'planning',
    tasks: [
      { title: 'Shader Optimization', description: 'Craft highly optimized GLSL shaders for physically-based rendering (PBR) effects.', priority: 'Medium', progress: 0 },
      { title: 'WASM Physics Bridge', description: 'Develop a high-performance collision detection bridge between JS and WASM/Rust.', priority: 'High', progress: 0 }
    ]
  },
  {
    name: 'Health-Pulse (BioTech)',
    description: 'Pioneer an AI-driven diagnostic platform for high-precision medical imaging analysis. This project implements advanced computer vision models to assist healthcare professionals in early disease detection, focusing on DICOM image processing, neural network interpretability, and secure cloud delivery.',
    requiredSkills: ['PyTorch', 'Computer Vision', 'DICOM', 'Medical AI', 'Cloud Computing'],
    status: 'planning',
    tasks: [
      { title: 'Image Segmentation', description: 'Train and validate deep learning models for pixel-perfect segmentation of medical scan data.', priority: 'High', progress: 0 },
      { title: 'Clinical API', description: 'Build a secure, scalable, and HIPAA-compliant API for medical data transmission.', priority: 'Medium', progress: 0 }
    ]
  }
];

async function seedOneProject(ownerId) {
  const thirtyDaysOut = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const threeDaysOut = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  // Find a project that doesn't exist yet for this user
  // We'll check by name AND owner
  for (const demo of demoProjects) {
    const projectExists = await Project.findOne({ name: demo.name, owner: ownerId });
    
    if (!projectExists) {
      const project = await Project.create({ 
        name: demo.name, 
        description: demo.description, 
        requiredSkills: demo.requiredSkills, 
        status: demo.status, 
        owner: ownerId,
        deadline: thirtyDaysOut
      });

      // Seed tasks
      for (const t of demo.tasks) {
        await Task.create({
          ...t,
          project: project._id,
          deadline: threeDaysOut
        });
      }

      return project;
    }
  }

  // If all projects already exist, add a copy of the first one with a random suffix
  const firstDemo = demoProjects[0];
  const suffix = Math.floor(Math.random() * 1000);
  const project = await Project.create({ 
    name: `${firstDemo.name} #${suffix}`, 
    description: firstDemo.description, 
    requiredSkills: firstDemo.requiredSkills, 
    status: firstDemo.status, 
    owner: ownerId,
    deadline: thirtyDaysOut
  });

  for (const t of firstDemo.tasks) {
    await Task.create({
      ...t,
      project: project._id,
      deadline: threeDaysOut
    });
  }

  return project;
}

module.exports = { seedOneProject };
