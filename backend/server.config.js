// Production server configuration
// Add this to your backend/server.js if not already present

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// =====================================
// Security Middleware
// =====================================

// Helmet: Add security headers
app.use(helmet());

// CORS: Allow frontend only
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// =====================================
// Body Parser
// =====================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================
// Request Logging (Production)
// =====================================

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// =====================================
// Health Check Endpoint
// =====================================

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// =====================================
// API Routes
// =====================================

app.use('/api/auth', require('./routes/auth'));
app.use('/api/gigs', require('./routes/gigs'));
app.use('/api/bids', require('./routes/bids'));

// =====================================
// 404 Handler
// =====================================

app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.path 
  });
});

// =====================================
// Error Handler (Must be last)
// =====================================

app.use((err, req, res, next) => {
  console.error('[ERROR]', err);

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // Duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// =====================================
// Start Server
// =====================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════╗
║      GigFlow Backend Server        ║
╠════════════════════════════════════╣
║ Environment: ${process.env.NODE_ENV || 'development'.padEnd(21)}
║ Port:        ${PORT.toString().padEnd(25)}
║ URL:         http://localhost:${PORT.toString().padEnd(19)}
║ Frontend:    ${(process.env.FRONTEND_URL || 'http://localhost:5173').substring(0, 25)}
╚════════════════════════════════════╝
  `);
});

// =====================================
// Graceful Shutdown
// =====================================

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
