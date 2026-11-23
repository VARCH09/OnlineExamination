// routes/exams.js – Admin CRUD for exams + question assignment
const express  = require('express');
const router   = express.Router();
const db       = require('../config/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');

// ── GET /api/exams – list exams ──────────────────────────────
router.get('/', verifyToken, async (req, res) => {
  try {
    let query = `
      SELECT e.id, e.title, e.description, s.name AS subject_name, e.subject_id,
             e.duration_mins, e.total_marks, e.pass_marks, e.status,
             e.start_time, e.end_time, e.created_at,
             COUNT(eq.id) AS question_count
      FROM exams e
      JOIN subjects s ON e.subject_id = s.id
      LEFT JOIN exam_questions eq ON eq.exam_id = e.id
    `;
    const params = [];
    // Students only see active exams within time window
    if (req.user.role === 'student') {
      query += ` WHERE e.status = 'active' AND (e.end_time IS NULL OR e.end_time > NOW())`;
    }
    query += ' GROUP BY e.id ORDER BY e.created_at DESC';
    const [rows] = await db.query(query, params);
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch exams.' });
  }
});

// ── GET /api/exams/:id ───────────────────────────────────────
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.*, s.name AS subject_name,
              COUNT(eq.id) AS question_count
       FROM exams e
       JOIN subjects s ON e.subject_id = s.id
       LEFT JOIN exam_questions eq ON eq.exam_id = e.id
       WHERE e.id = ?
       GROUP BY e.id`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Exam not found.' });
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch exam.' });
  }
});

// ── POST /api/exams ──────────────────────────────────────────
router.post(
  '/',
  verifyToken, requireAdmin,
  validate.required(['subject_id', 'title', 'duration_mins', 'pass_marks']),
  async (req, res) => {
    const { subject_id, title, description, duration_mins, total_marks, pass_marks, status, start_time, end_time } = req.body;
    try {
      const [result] = await db.query(
        `INSERT INTO exams
         (subject_id, title, description, duration_mins, total_marks, pass_marks, status, start_time, end_time)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [subject_id, title.trim(), description?.trim() || null, duration_mins, total_marks || 0, pass_marks, status || 'draft', start_time || null, end_time || null]
      );
      return res.status(201).json({ success: true, message: 'Exam created.', data: { id: result.insertId } });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to create exam.' });
    }
  }
);

// ── PUT /api/exams/:id ───────────────────────────────────────
router.put('/:id', verifyToken, requireAdmin, validate.required(['title', 'duration_mins']), async (req, res) => {
  const { subject_id, title, description, duration_mins, total_marks, pass_marks, status, start_time, end_time } = req.body;
  try {
    const [result] = await db.query(
      `UPDATE exams
       SET subject_id=?, title=?, description=?, duration_mins=?,
           total_marks=?, pass_marks=?, status=?, start_time=?, end_time=?
       WHERE id=?`,
      [subject_id, title.trim(), description?.trim() || null, duration_mins, total_marks || 0, pass_marks || 0, status || 'draft', start_time || null, end_time || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Exam not found.' });
    return res.json({ success: true, message: 'Exam updated.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update exam.' });
  }
});

// ── DELETE /api/exams/:id ────────────────────────────────────
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM exams WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Exam not found.' });
    return res.json({ success: true, message: 'Exam deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete exam.' });
  }
});

// ── GET /api/exams/:id/questions – get questions for an exam ─
router.get('/:id/questions', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT q.id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d,
              q.marks, eq.order_num
              ${req.user.role === 'admin' ? ', q.correct_option' : ''}
       FROM exam_questions eq
       JOIN questions q ON eq.question_id = q.id
       WHERE eq.exam_id = ?
       ORDER BY eq.order_num`,
      [req.params.id]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch exam questions.' });
  }
});

// ── POST /api/exams/:id/questions – assign questions to exam ─
router.post('/:id/questions', verifyToken, requireAdmin, async (req, res) => {
  const { question_ids } = req.body; // array of question IDs
  if (!Array.isArray(question_ids) || question_ids.length === 0) {
    return res.status(400).json({ success: false, message: 'question_ids must be a non-empty array.' });
  }
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Remove old assignments
    await conn.query('DELETE FROM exam_questions WHERE exam_id = ?', [req.params.id]);

    // Insert new assignments
    const values = question_ids.map((qid, i) => [req.params.id, qid, i + 1]);
    await conn.query('INSERT INTO exam_questions (exam_id, question_id, order_num) VALUES ?', [values]);

    // Recalculate total_marks from selected questions
    const [markSum] = await conn.query(
      'SELECT COALESCE(SUM(q.marks), 0) AS total FROM exam_questions eq JOIN questions q ON eq.question_id = q.id WHERE eq.exam_id = ?',
      [req.params.id]
    );
    await conn.query('UPDATE exams SET total_marks = ? WHERE id = ?', [markSum[0].total, req.params.id]);

    await conn.commit();
    return res.json({ success: true, message: 'Questions assigned successfully.' });
  } catch (err) {
    await conn.rollback();
    return res.status(500).json({ success: false, message: 'Failed to assign questions.' });
  } finally {
    conn.release();
  }
});

// ── DELETE /api/exams/:id/questions/:qid – remove one question ─
router.delete('/:id/questions/:qid', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM exam_questions WHERE exam_id = ? AND question_id = ?',
      [req.params.id, req.params.qid]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Assignment not found.' });
    return res.json({ success: true, message: 'Question removed from exam.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to remove question.' });
  }
});

module.exports = router;
