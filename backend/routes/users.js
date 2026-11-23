// routes/users.js – Admin: manage students
const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const db       = require('../config/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

// All routes require admin
router.use(verifyToken, requireAdmin);

// ── GET /api/users  – list all students ─────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, email, role, is_active, created_at
       FROM users
       WHERE role = 'student'
       ORDER BY created_at DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[users GET]', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch students.' });
  }
});

// ── GET /api/users/:id ───────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ? AND role = ?',
      [req.params.id, 'student']
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found.' });
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch student.' });
  }
});

// ── POST /api/users  – create student ───────────────────────
router.post(
  '/',
  validate.required(['name', 'email', 'password']),
  validate.email,
  validate.password,
  async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'Email already exists.' });
      }
      const hashed = await bcrypt.hash(password, 10);
      const [result] = await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name.trim(), email.toLowerCase().trim(), hashed, 'student']
      );
      return res.status(201).json({ success: true, message: 'Student created.', data: { id: result.insertId } });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to create student.' });
    }
  }
);

// ── PUT /api/users/:id ───────────────────────────────────────
router.put('/:id', validate.required(['name', 'email']), async (req, res) => {
  const { name, email, is_active, password } = req.body;
  try {
    // If password provided, hash it
    let query, params;
    if (password && password.trim()) {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
      }
      const hashed = await bcrypt.hash(password, 10);
      query  = 'UPDATE users SET name=?, email=?, password=?, is_active=? WHERE id=? AND role=?';
      params = [name.trim(), email.toLowerCase().trim(), hashed, is_active !== undefined ? is_active : 1, req.params.id, 'student'];
    } else {
      query  = 'UPDATE users SET name=?, email=?, is_active=? WHERE id=? AND role=?';
      params = [name.trim(), email.toLowerCase().trim(), is_active !== undefined ? is_active : 1, req.params.id, 'student'];
    }
    const [result] = await db.query(query, params);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Student not found.' });
    return res.json({ success: true, message: 'Student updated.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Email already in use.' });
    return res.status(500).json({ success: false, message: 'Failed to update student.' });
  }
});

// ── DELETE /api/users/:id ────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM users WHERE id = ? AND role = ?', [req.params.id, 'student']);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Student not found.' });
    return res.json({ success: true, message: 'Student deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete student.' });
  }
});

module.exports = router;
