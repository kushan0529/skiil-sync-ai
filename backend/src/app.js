require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const path = require('path');
const connectDB = require('./config/db');  

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const aiRoutes = require('./routes/ai.routes');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

if (!process.env.MONGO_URL) {
  console.error('[error] Missing MONGO_URL in environment variables');
} else {
  connectDB(process.env.MONGO_URL).catch(err => {
    console.error('[error] MongoDB initial connection failed:', err.message);
  });
}

// Middlewares
app.use(cors());
app.use(express.json({ limit: '8mb' }));

// 1. API Routes (MUST come before static files)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => res.json({ 
  ok: true, 
  ts: Date.now(), 
  db: require('mongoose').connection.readyState 
}));

// 2. Serve static files from the React frontend app
// This assumes your frontend build folder is in 'frontend/dist'
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// 3. Catch-all route: Send back React's index.html for any non-API request
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist', 'index.html'));
});

app.use(errorMiddleware);

module.exports = app;
