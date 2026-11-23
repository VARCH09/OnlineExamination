// routes/attempts.js – Student: start exam, save answers, submit
const express  = require('express');
const router   = express.Router();
const db       = require('../config/db');
const { verifyToken, requireStudent, requireAdmin } = require('../middleware/auth');

// ── POST /api/attempts/start – student starts an exam ────────
router.post('/start', verifyToken, requireStudent, async (req, res) => {
  const { exam_id } = req.body;
  if (!exam_id) return res.status(400).json({ success: false, message: 'exam_id is required.' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Check exam exists and is active
    const [exams] = await conn.query(
      `SELECT id, status, start_time, end_time, duration_mins, total_marks, pass_marks
       FROM exams WHERE id = ?`,
      [exam_id]
    );
    if (exams.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }
    const exam = exams[0];
    if (exam.status !== 'active') {
      await conn.rollback();
      return res.status(403).json({ success: false, message: 'Exam is not active.' });
    }
    const now = new Date();
    if (exam.end_time && new Date(exam.end_time) < now) {
      await conn.rollback();
      return res.status(403).json({ success: false, message: 'Exam time window has passed.' });
    }

    // Check if student already has an in_progress attempt
    const [inProgress] = await conn.query(
      `SELECT id FROM exam_attempts
       WHERE exam_id = ? AND student_id = ? AND status = 'in_progress'`,
      [exam_id, req.user.id]
    );
    if (inProgress.length > 0) {
      await conn.rollback();
      return res.json({
        success: true,
        message: 'Resuming existing attempt.',
        data: { attempt_id: inProgress[0].id, exam },
      });
    }

    // Check if already submitted
    const [submitted] = await conn.query(
      `SELECT id FROM exam_attempts
       WHERE exam_id = ? AND student_id = ? AND status = 'submitted'`,
      [exam_id, req.user.id]
    );
    if (submitted.length > 0) {
      await conn.rollback();
      return res.status(409).json({ success: false, message: 'You have already submitted this exam.' });
    }

    // Create new attempt
    const [result] = await conn.query(
      'INSERT INTO exam_attempts (exam_id, student_id, status) VALUES (?, ?, ?)',
      [exam_id, req.user.id, 'in_progress']
    );
    await conn.commit();
    return res.status(201).json({
      success: true,
      message: 'Exam started.',
      data: { attempt_id: result.insertId, exam },
    });
  } catch (err) {
    await conn.rollback();
    console.error('[attempts/start]', err);
    return res.status(500).json({ success: false, message: 'Failed to start exam.' });
  } finally {
    conn.release();
  }
});

// ── POST /api/attempts/:id/answer – save/update an answer ────
router.post('/:id/answer', verifyToken, requireStudent, async (req, res) => {
  const { question_id, selected_option } = req.body;
  if (!question_id) return res.status(400).json({ success: false, message: 'question_id is required.' });

  try {
    // Verify attempt belongs to this student and is in_progress
    const [attempts] = await db.query(
      'SELECT id, status FROM exam_attempts WHERE id = ? AND student_id = ?',
      [req.params.id, req.user.id]
    );
    if (attempts.length === 0) return res.status(404).json({ success: false, message: 'Attempt not found.' });
    if (attempts[0].status !== 'in_progress') {
      return res.status(409).json({ success: false, message: 'This attempt has already been submitted.' });
    }

    // Upsert answer (INSERT or UPDATE on duplicate)
    await db.query(
      `INSERT INTO answers (attempt_id, question_id, selected_option)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE selected_option = VALUES(selected_option)`,
      [req.params.id, question_id, selected_option || null]
    );
    return res.json({ success: true, message: 'Answer saved.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to save answer.' });
  }
});

// ── POST /api/attempts/:id/submit – submit exam & compute score
router.post('/:id/submit', verifyToken, requireStudent, async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Verify attempt
    const [attempts] = await conn.query(
      `SELECT ea.id, ea.exam_id, ea.student_id, ea.status, e.pass_marks, e.total_marks
       FROM exam_attempts ea
       JOIN exams e ON ea.exam_id = e.id
       WHERE ea.id = ? AND ea.student_id = ?`,
      [req.params.id, req.user.id]
    );
    if (attempts.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'Attempt not found.' });
    }
    const attempt = attempts[0];
    if (attempt.status !== 'in_progress') {
      await conn.rollback();
      return res.status(409).json({ success: false, message: 'Exam already submitted.' });
    }

    // Calculate score: join answers with questions to compare selected vs correct
    const [scoreData] = await conn.query(
      `SELECT
         SUM(CASE WHEN a.selected_option = q.correct_option THEN q.marks ELSE 0 END) AS score,
         SUM(q.marks) AS total
       FROM answers a
       JOIN questions q ON a.question_id = q.id
       WHERE a.attempt_id = ?`,
      [req.params.id]
    );

    const score     = scoreData[0].score || 0;
    const total     = attempt.total_marks || scoreData[0].total || 0;
    const percentage = total > 0 ? parseFloat(((score / total) * 100).toFixed(2)) : 0;
    const status    = score >= attempt.pass_marks ? 'pass' : 'fail';

    // Calculate time taken
    const timeTaken = req.body.time_taken || null;

    // Update attempt
    await conn.query(
      `UPDATE exam_attempts SET status='submitted', submitted_at=NOW(), time_taken=? WHERE id=?`,
      [timeTaken, req.params.id]
    );

    // Insert result
    await conn.query(
      `INSERT INTO results (attempt_id, student_id, exam_id, score, total_marks, percentage, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.params.id, attempt.student_id, attempt.exam_id, score, total, percentage, status]
    );

    await conn.commit();
    return res.json({
      success: true,
      message: 'Exam submitted successfully.',
      data: { score, total, percentage, status, pass_marks: attempt.pass_marks },
    });
  } catch (err) {
    await conn.rollback();
    console.error('[attempts/submit]', err);
    return res.status(500).json({ success: false, message: 'Failed to submit exam.' });
  } finally {
    conn.release();
  }
});

// ── GET /api/attempts/my – student's own attempts ────────────
router.get('/my', verifyToken, requireStudent, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ea.id, ea.exam_id, e.title AS exam_title, ea.status,
              ea.started_at, ea.submitted_at, r.score, r.total_marks, r.percentage, r.status AS result
       FROM exam_attempts ea
       JOIN exams e ON ea.exam_id = e.id
       LEFT JOIN results r ON r.attempt_id = ea.id
       WHERE ea.student_id = ?
       ORDER BY ea.started_at DESC`,
      [req.user.id]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch attempts.' });
  }
});

// ── GET /api/attempts/:id/result – get result of an attempt ──
router.get('/:id/result', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, u.name AS student_name, e.title AS exam_title,
              e.pass_marks, s.name AS subject_name
       FROM results r
       JOIN exam_attempts ea ON r.attempt_id = ea.id
       JOIN users u  ON r.student_id = u.id
       JOIN exams e  ON r.exam_id = e.id
       JOIN subjects s ON e.subject_id = s.id
       WHERE r.attempt_id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Result not found.' });
    // Students can only see their own result
    if (req.user.role === 'student' && rows[0].student_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch result.' });
  }
});

// ── GET /api/attempts – admin: view all attempts ─────────────
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ea.id, u.name AS student_name, e.title AS exam_title,
              ea.status, ea.started_at, ea.submitted_at,
              r.score, r.total_marks, r.percentage, r.status AS result
       FROM exam_attempts ea
       JOIN users u ON ea.student_id = u.id
       JOIN exams e ON ea.exam_id = e.id
       LEFT JOIN results r ON r.attempt_id = ea.id
       ORDER BY ea.started_at DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch attempts.' });
  }
});

module.exports = router;
