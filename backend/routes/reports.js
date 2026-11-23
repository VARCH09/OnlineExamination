// routes/reports.js – Admin reports and analytics
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.use(verifyToken, requireAdmin);

// ── GET /api/reports/exam-summary ───────────────────────────
// Exam-wise: attempts, avg score, pass/fail counts
router.get('/exam-summary', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM v_exam_summary ORDER BY total_attempts DESC');
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate exam summary.' });
  }
});

// ── GET /api/reports/student-results ────────────────────────
// All student results
router.get('/student-results', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM v_student_results ORDER BY result_date DESC');
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch student results.' });
  }
});

// ── GET /api/reports/subject-question-count ─────────────────
router.get('/subject-question-count', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM v_subject_question_count ORDER BY total_questions DESC');
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch subject stats.' });
  }
});

// ── GET /api/reports/top-scorers ─────────────────────────────
// Top 10 students by highest percentage
router.get('/top-scorers', async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.name AS student_name, u.email,
              e.title AS exam_title,
              r.score, r.total_marks, r.percentage, r.status
       FROM results r
       JOIN users u ON r.student_id = u.id
       JOIN exams e ON r.exam_id = e.id
       ORDER BY r.percentage DESC
       LIMIT 10`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch top scorers.' });
  }
});

// ── GET /api/reports/above-average ──────────────────────────
// Students who scored above exam average
router.get('/above-average', async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.name AS student_name, e.title AS exam_title,
              r.score, r.percentage,
              ROUND((SELECT AVG(r2.score) FROM results r2 WHERE r2.exam_id = r.exam_id), 2) AS exam_avg
       FROM results r
       JOIN users u ON r.student_id = u.id
       JOIN exams e ON r.exam_id = e.id
       WHERE r.score > (SELECT AVG(r2.score) FROM results r2 WHERE r2.exam_id = r.exam_id)
       ORDER BY e.title, r.score DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch above-average students.' });
  }
});

// ── GET /api/reports/pass-fail ───────────────────────────────
// Pass/fail count per exam
router.get('/pass-fail', async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.title AS exam_title,
              COUNT(r.id) AS total_attempts,
              SUM(CASE WHEN r.status='pass' THEN 1 ELSE 0 END) AS pass_count,
              SUM(CASE WHEN r.status='fail' THEN 1 ELSE 0 END) AS fail_count,
              ROUND(AVG(r.score), 2) AS avg_score
       FROM results r
       JOIN exams e ON r.exam_id = e.id
       GROUP BY e.id, e.title
       ORDER BY total_attempts DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch pass/fail report.' });
  }
});

module.exports = router;
