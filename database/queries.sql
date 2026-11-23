-- ============================================================
--  Online Examination System – Useful SQL Queries
--  Demonstrates: INSERT, UPDATE, DELETE, SELECT, WHERE,
--  ORDER BY, JOIN, nested queries, aggregate functions,
--  GROUP BY, and HAVING
-- ============================================================

USE online_examination_system;

-- ============================================================
-- Q1. INSERT – Add a new student
-- ============================================================
INSERT INTO users (name, email, password, role)
VALUES ('Mark Taylor', 'mark@student.com', '$2b$10$hash_placeholder', 'student');

-- ============================================================
-- Q2. UPDATE – Activate an exam
-- ============================================================
UPDATE exams
SET status = 'active'
WHERE id = 1 AND status = 'draft';

-- ============================================================
-- Q3. DELETE – Remove a student who is no longer enrolled
--     (CASCADE will remove their attempts, answers, results)
-- ============================================================
DELETE FROM users
WHERE email = 'mark@student.com' AND role = 'student';

-- ============================================================
-- Q4. SELECT + WHERE + ORDER BY – Get all active exams
-- ============================================================
SELECT
  e.id,
  e.title,
  s.name  AS subject,
  e.duration_mins,
  e.total_marks,
  e.pass_marks,
  e.start_time,
  e.end_time
FROM exams e
JOIN subjects s ON e.subject_id = s.id
WHERE e.status = 'active'
  AND (e.end_time IS NULL OR e.end_time > NOW())
ORDER BY e.start_time ASC;

-- ============================================================
-- Q5. JOIN – List all questions with their subject name
-- ============================================================
SELECT
  q.id,
  s.name  AS subject,
  q.question_text,
  q.correct_option,
  q.marks
FROM questions q
JOIN subjects s ON q.subject_id = s.id
ORDER BY s.name, q.id;

-- ============================================================
-- Q6. JOIN (3 tables) – List students who attempted each exam
-- ============================================================
SELECT
  u.name   AS student_name,
  e.title  AS exam_title,
  ea.started_at,
  ea.submitted_at,
  ea.status
FROM exam_attempts ea
JOIN users u  ON ea.student_id = u.id
JOIN exams e  ON ea.exam_id    = e.id
ORDER BY e.title, u.name;

-- ============================================================
-- Q7. Aggregate + GROUP BY – Average score per exam
-- ============================================================
SELECT
  e.title                   AS exam_title,
  COUNT(r.id)               AS total_results,
  ROUND(AVG(r.score), 2)    AS avg_score,
  MAX(r.score)              AS highest_score,
  MIN(r.score)              AS lowest_score,
  SUM(CASE WHEN r.status = 'pass' THEN 1 ELSE 0 END) AS pass_count,
  SUM(CASE WHEN r.status = 'fail' THEN 1 ELSE 0 END) AS fail_count
FROM results r
JOIN exams e ON r.exam_id = e.id
GROUP BY e.id, e.title
ORDER BY avg_score DESC;

-- ============================================================
-- Q8. GROUP BY + HAVING – Exams with more than 1 attempt
-- ============================================================
SELECT
  e.title          AS exam_title,
  COUNT(ea.id)     AS attempt_count
FROM exam_attempts ea
JOIN exams e ON ea.exam_id = e.id
WHERE ea.status = 'submitted'
GROUP BY e.id, e.title
HAVING attempt_count > 1
ORDER BY attempt_count DESC;

-- ============================================================
-- Q9. Nested / Subquery – Students who scored above exam average
-- ============================================================
SELECT
  u.name           AS student_name,
  e.title          AS exam_title,
  r.score,
  r.percentage
FROM results r
JOIN users u  ON r.student_id = u.id
JOIN exams e  ON r.exam_id    = e.id
WHERE r.score > (
  SELECT AVG(r2.score)
  FROM results r2
  WHERE r2.exam_id = r.exam_id
)
ORDER BY e.title, r.score DESC;

-- ============================================================
-- Q10. Nested + Aggregate – Top scorer per exam
-- ============================================================
SELECT
  e.title          AS exam_title,
  u.name           AS top_scorer,
  r.score,
  r.percentage
FROM results r
JOIN users u  ON r.student_id = u.id
JOIN exams e  ON r.exam_id    = e.id
WHERE r.score = (
  SELECT MAX(r2.score)
  FROM results r2
  WHERE r2.exam_id = r.exam_id
)
ORDER BY e.title;

-- ============================================================
-- Q11. Using View – Exam summary report
-- ============================================================
SELECT * FROM v_exam_summary ORDER BY total_attempts DESC;

-- ============================================================
-- Q12. Using View – Student results with filter
-- ============================================================
SELECT *
FROM v_student_results
WHERE result_status = 'pass'
ORDER BY percentage DESC;

-- ============================================================
-- Q13. Using View – Subject with most questions
-- ============================================================
SELECT *
FROM v_subject_question_count
ORDER BY total_questions DESC
LIMIT 1;
