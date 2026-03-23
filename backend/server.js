require('dotenv').config()

const http = require('http');
const app = require('./src/app');

const PORT = process.env.PORT || 4040;
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { 
    origin: process.env.FRONTEND_URL || '*', 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true 
  },
  transports: ['polling', 'websocket'], // Ensure backend supports both
  allowEIO3: true // Backward compatibility if needed
});

app.set('io', io);



io.on('connection', (socket) => {
  console.log('[socket] connected', socket.id);

  socket.on('joinProject', (projectId) => {
    socket.join(projectId);
    console.log(`[socket] ${socket.id} joinProject ${projectId}`);
  });

  socket.on('leaveProject', (projectId) => {
    socket.leave(projectId);
    console.log(`[socket] ${socket.id} leaveProject ${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log('[socket] disconnected', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

module.exports = server;
module.exports.app = app;
