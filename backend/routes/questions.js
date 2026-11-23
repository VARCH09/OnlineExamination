// routes/questions.js – Admin CRUD for questions
const express  = require('express');
const router   = express.Router();
const db       = require('../config/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

// ── GET /api/questions – list all (admin) or by subject ──────
router.get('/', verifyToken, async (req, res) => {
  try {
    const { subject_id } = req.query;
    let query = `
      SELECT q.id, q.subject_id, s.name AS subject_name,
             q.question_text, q.option_a, q.option_b, q.option_c, q.option_d,
             q.correct_option, q.marks, q.created_at
      FROM questions q
      JOIN subjects s ON q.subject_id = s.id
    `;
    const params = [];
    if (subject_id) { query += ' WHERE q.subject_id = ?'; params.push(subject_id); }
    query += ' ORDER BY q.id';
    const [rows] = await db.query(query, params);
    // Hide correct_option from students
    if (req.user.role === 'student') {
      rows.forEach(r => delete r.correct_option);
    }
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch questions.' });
  }
});

// ── GET /api/questions/:id ───────────────────────────────────
router.get('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT q.*, s.name AS subject_name FROM questions q
       JOIN subjects s ON q.subject_id = s.id
       WHERE q.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Question not found.' });
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch question.' });
  }
});

// ── POST /api/questions ──────────────────────────────────────
router.post(
  '/',
  verifyToken, requireAdmin,
  validate.required(['subject_id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option']),
  async (req, res) => {
    const { subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks } = req.body;
    const validOptions = ['A', 'B', 'C', 'D'];
    if (!validOptions.includes(correct_option?.toUpperCase())) {
      return res.status(400).json({ success: false, message: 'correct_option must be A, B, C, or D.' });
    }
    try {
      const [result] = await db.query(
        `INSERT INTO questions
         (subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [subject_id, question_text.trim(), option_a.trim(), option_b.trim(), option_c.trim(), option_d.trim(), correct_option.toUpperCase(), marks || 1]
      );
      return res.status(201).json({ success: true, message: 'Question created.', data: { id: result.insertId } });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to create question.' });
    }
  }
);

// ── PUT /api/questions/:id ───────────────────────────────────
router.put(
  '/:id',
  verifyToken, requireAdmin,
  validate.required(['subject_id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option']),
  async (req, res) => {
    const { subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks } = req.body;
    try {
      const [result] = await db.query(
        `UPDATE questions
         SET subject_id=?, question_text=?, option_a=?, option_b=?, option_c=?, option_d=?, correct_option=?, marks=?
         WHERE id=?`,
        [subject_id, question_text.trim(), option_a.trim(), option_b.trim(), option_c.trim(), option_d.trim(), correct_option.toUpperCase(), marks || 1, req.params.id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Question not found.' });
      return res.json({ success: true, message: 'Question updated.' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to update question.' });
    }
  }
);

// ── DELETE /api/questions/:id ────────────────────────────────
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM questions WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Question not found.' });
    return res.json({ success: true, message: 'Question deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete question.' });
  }
});

module.exports = router;
