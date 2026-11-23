// routes/auth.js – Register & Login
const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../config/db');
const validate = require('../middleware/validate');

// ── POST /api/auth/register ──────────────────────────────────
router.post(
  '/register',
  validate.required(['name', 'email', 'password']),
  validate.email,
  validate.password,
  async (req, res) => {
    const { name, email, password } = req.body;
    try {
      // Check if email already exists
      const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'Email already registered.' });
      }

      // Hash password
      const hashed = await bcrypt.hash(password, 10);

      const [result] = await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name.trim(), email.toLowerCase().trim(), hashed, 'student']
      );

      return res.status(201).json({
        success: true,
        message: 'Registration successful. You can now log in.',
        data: { id: result.insertId },
      });
    } catch (err) {
      console.error('[register]', err);
      return res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
  }
);

// ── POST /api/auth/login ─────────────────────────────────────
router.post(
  '/login',
  validate.required(['email', 'password']),
  async (req, res) => {
    const { email, password } = req.body;
    try {
      const [rows] = await db.query(
        'SELECT id, name, email, password, role, is_active FROM users WHERE email = ?',
        [email.toLowerCase().trim()]
      );

      if (rows.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const user = rows[0];

      if (!user.is_active) {
        return res.status(403).json({ success: false, message: 'Account is deactivated. Contact admin.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      return res.json({
        success: true,
        message: 'Login successful.',
        data: {
          token,
          user: { id: user.id, name: user.name, email: user.email, role: user.role },
        },
      });
    } catch (err) {
      console.error('[login]', err);
      return res.status(500).json({ success: false, message: 'Server error during login.' });
    }
  }
);

// ── GET /api/auth/me ─────────────────────────────────────────
const { verifyToken } = require('../middleware/auth');
router.get('/me', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
