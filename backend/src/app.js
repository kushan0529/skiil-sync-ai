require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const connectDB = require('./config/db');  // Simple version you made

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const aiRoutes = require('./routes/ai.routes');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

// ✅ CONNECT DB ONCE at startup (NOT middleware)
connectDB(process.env.MONGO_URL);

// Middleware (correct order)
app.use(cors(/*{ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }*/));
app.use(express.json({ limit: '8mb' }));

// Routes
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

app.use(errorMiddleware);

module.exports = app;
