require('dotenv').config();

const http = require('http');
const app = require('./src/app');

const PORT = process.env.PORT || 4040;
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { 
    origin: (origin, callback) => {
      // Allow all origins for now to ensure global access, or you can restrict to Vercel/Localhost
      callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true 
  },
  transports: ['polling', 'websocket'],
  allowEIO3: true
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('[socket] connected', socket.id);

  socket.on('joinProject', (projectId) => {
    socket.join(projectId);
    console.log(`[socket] ${socket.id} joined project ${projectId}`);
  });

  socket.on('leaveProject', (projectId) => {
    socket.leave(projectId);
    console.log(`[socket] ${socket.id} left project ${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log('[socket] disconnected', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = server;
module.exports.app = app;


// HTTP (Normal Way): Client polls server repeatedly (GET /updates) → High latency, wasteful bandwidth, server overload.

// Sockets Advantage: Persistent, bidirectional connection → Server pushes updates instantly to specific clients/rooms (like projectId).

// HTTP:     Client → Req → Server → Resp → Wait → Req → ...
// Sockets:  Client ↔ Server (live stream, no polling)

//Your Use Case: SkillSync's joinProject enables real-time collaboration—notifications, live AI responses, or team updates within projects without page refreshes. Perfect for MERN apps needing live features.