const express = require('express');
const cors = require('cors'); 
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || true }));
app.use(express.json({ limit: '8mb' }));

connectDB(process.env.MONGO_URL);
 
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

app.use(errorMiddleware);

module.exports = app;
