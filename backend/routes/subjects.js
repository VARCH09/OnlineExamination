// routes/subjects.js – Admin CRUD for subjects
const express  = require('express');
const router   = express.Router();
const db       = require('../config/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

// ── GET /api/subjects – public (students need to see subjects) ──
router.get('/', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.id, s.name, s.description, s.created_at,
              COUNT(q.id) AS question_count
       FROM subjects s
       LEFT JOIN questions q ON q.subject_id = s.id
       GROUP BY s.id
       ORDER BY s.name`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch subjects.' });
  }
});

// ── GET /api/subjects/:id ────────────────────────────────────
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM subjects WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Subject not found.' });
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch subject.' });
  }
});

// ── POST /api/subjects ───────────────────────────────────────
router.post(
  '/',
  verifyToken, requireAdmin,
  validate.required(['name']),
  async (req, res) => {
    const { name, description } = req.body;
    try {
      const [result] = await db.query(
        'INSERT INTO subjects (name, description) VALUES (?, ?)',
        [name.trim(), description?.trim() || null]
      );
      return res.status(201).json({ success: true, message: 'Subject created.', data: { id: result.insertId } });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Subject name already exists.' });
      return res.status(500).json({ success: false, message: 'Failed to create subject.' });
    }
  }
);

// ── PUT /api/subjects/:id ────────────────────────────────────
router.put('/:id', verifyToken, requireAdmin, validate.required(['name']), async (req, res) => {
  const { name, description } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE subjects SET name=?, description=? WHERE id=?',
      [name.trim(), description?.trim() || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Subject not found.' });
    return res.json({ success: true, message: 'Subject updated.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Subject name already exists.' });
    return res.status(500).json({ success: false, message: 'Failed to update subject.' });
  }
});

// ── DELETE /api/subjects/:id ─────────────────────────────────
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM subjects WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Subject not found.' });
    return res.json({ success: true, message: 'Subject deleted.' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ success: false, message: 'Cannot delete subject – exams are linked to it.' });
    }
    return res.status(500).json({ success: false, message: 'Failed to delete subject.' });
  }
});

module.exports = router;
