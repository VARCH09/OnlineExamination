// server.js – Express application entry point
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes      = require('./routes/auth');
const userRoutes      = require('./routes/users');
const subjectRoutes   = require('./routes/subjects');
const questionRoutes  = require('./routes/questions');
const examRoutes      = require('./routes/exams');
const attemptRoutes   = require('./routes/attempts');
const reportRoutes    = require('./routes/reports');

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/subjects',  subjectRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/exams',     examRoutes);
app.use('/api/attempts',  attemptRoutes);
app.use('/api/reports',   reportRoutes);

// ── Health check ────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// ── 404 handler ─────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ── Global error handler ────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
