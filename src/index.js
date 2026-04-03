require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const db = require('./db/connection');
const taskRoutes = require('./routes/tasks');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan('combined')); // Logging — visible in Railway's log viewer
app.use(express.static(path.join(__dirname, 'public')));

// ─── Health Check Endpoint ──────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const dbResult = await db.query('SELECT NOW()');
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      dbTime: dbResult.rows[0].now,
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime()
    });
  } catch (err) {
    console.error('Health check failed:', err.message);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: err.message
    });
  }
});

// ─── API Routes ─────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// ─── Serve frontend ─────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// ─── Global Error Handler ───────────────────────────────
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${err.message}`);
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// ─── Start Server ───────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(` Task Manager running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Database: ${process.env.DATABASE_URL ? 'configured' : 'NOT configured'}`);
});
