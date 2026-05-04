require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const gigsRoutes = require('./routes/gigs');
const bidsRoutes = require('./routes/bids');

const app = express();
const server = http.createServer(app);

// Accept requests from both local and deployed frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://gigflow-frontend.netlify.app'
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  }
});

app.use(express.json());
app.use(cookieParser());
app.use(cors({ 
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Store user socket connections
const userSockets = {};

io.on('connection', (socket) => {
  console.log('🔗 User connected:', socket.id);
  
  // Register user to socket mapping
  socket.on('register', (userId) => {
    userSockets[userId] = socket.id;
    console.log(`📝 User ${userId} registered with socket ${socket.id}`);
    console.log('📊 Active sockets:', Object.keys(userSockets));
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    // Remove user from mapping
    for (let userId in userSockets) {
      if (userSockets[userId] === socket.id) {
        delete userSockets[userId];
        console.log(`🗑️  Removed user ${userId} from socket mapping`);
        break;
      }
    }
  });
});

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  req.userSockets = userSockets;
  next();
});

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    cookies: req.cookies,
    hasToken: !!req.cookies.token
  });
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigsRoutes);
app.use('/api/bids', bidsRoutes);

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => console.log('Server running on port', PORT));
  })
  .catch(err => {
    console.error('DB connection error', err);
  });
