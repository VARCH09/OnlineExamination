-- ============================================================
--  Online Examination System – Database Schema
--  Database : online_examination_system
--  Author   : DBS_Group
-- ============================================================

CREATE DATABASE IF NOT EXISTS online_examination_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE online_examination_system;

-- ============================================================
-- 1. USERS  (stores both admin and student accounts)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id           INT            NOT NULL AUTO_INCREMENT,
  name         VARCHAR(100)   NOT NULL,
  email        VARCHAR(150)   NOT NULL,
  password     VARCHAR(255)   NOT NULL,          -- bcrypt hash, never plain text
  role         ENUM('admin','student') NOT NULL DEFAULT 'student',
  is_active    TINYINT(1)     NOT NULL DEFAULT 1,
  created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- ============================================================
-- 2. SUBJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS subjects (
  id           INT            NOT NULL AUTO_INCREMENT,
  name         VARCHAR(150)   NOT NULL,
  description  TEXT,
  created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_subjects_name (name)
) ENGINE=InnoDB;

-- ============================================================
-- 3. QUESTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS questions (
  id              INT            NOT NULL AUTO_INCREMENT,
  subject_id      INT            NOT NULL,
  question_text   TEXT           NOT NULL,
  option_a        VARCHAR(500)   NOT NULL,
  option_b        VARCHAR(500)   NOT NULL,
  option_c        VARCHAR(500)   NOT NULL,
  option_d        VARCHAR(500)   NOT NULL,
  correct_option  ENUM('A','B','C','D') NOT NULL,
  marks           INT            NOT NULL DEFAULT 1
                  CHECK (marks > 0),
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                 ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_questions_subject
    FOREIGN KEY (subject_id) REFERENCES subjects (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 4. EXAMS
-- ============================================================
CREATE TABLE IF NOT EXISTS exams (
  id             INT            NOT NULL AUTO_INCREMENT,
  subject_id     INT            NOT NULL,
  title          VARCHAR(200)   NOT NULL,
  description    TEXT,
  duration_mins  INT            NOT NULL DEFAULT 30
                 CHECK (duration_mins > 0),
  total_marks    INT            NOT NULL DEFAULT 0,
  pass_marks     INT            NOT NULL DEFAULT 0,
  status         ENUM('draft','active','inactive') NOT NULL DEFAULT 'draft',
  start_time     DATETIME,
  end_time       DATETIME,
  created_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_exams_subject
    FOREIGN KEY (subject_id) REFERENCES subjects (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 5. EXAM_QUESTIONS  (many-to-many: exams ↔ questions)
-- ============================================================
CREATE TABLE IF NOT EXISTS exam_questions (
  id           INT  NOT NULL AUTO_INCREMENT,
  exam_id      INT  NOT NULL,
  question_id  INT  NOT NULL,
  order_num    INT  NOT NULL DEFAULT 1,

  PRIMARY KEY (id),
  UNIQUE KEY uq_exam_question (exam_id, question_id),
  CONSTRAINT fk_eq_exam
    FOREIGN KEY (exam_id) REFERENCES exams (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_eq_question
    FOREIGN KEY (question_id) REFERENCES questions (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 6. EXAM_ATTEMPTS  (one row per student per exam attempt)
-- ============================================================
CREATE TABLE IF NOT EXISTS exam_attempts (
  id           INT      NOT NULL AUTO_INCREMENT,
  exam_id      INT      NOT NULL,
  student_id   INT      NOT NULL,
  started_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  submitted_at DATETIME,
  status       ENUM('in_progress','submitted','expired') NOT NULL DEFAULT 'in_progress',
  time_taken   INT,                              -- seconds actually spent

  PRIMARY KEY (id),
  -- One active attempt per student per exam (allow retakes only when previous is submitted/expired)
  CONSTRAINT fk_attempts_exam
    FOREIGN KEY (exam_id) REFERENCES exams (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_attempts_student
    FOREIGN KEY (student_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 7. ANSWERS  (student's selected option for each question)
-- ============================================================
CREATE TABLE IF NOT EXISTS answers (
  id            INT  NOT NULL AUTO_INCREMENT,
  attempt_id    INT  NOT NULL,
  question_id   INT  NOT NULL,
  selected_option ENUM('A','B','C','D'),          -- NULL means skipped

  PRIMARY KEY (id),
  -- Prevent duplicate answers for same question in same attempt
  UNIQUE KEY uq_answers_attempt_question (attempt_id, question_id),
  CONSTRAINT fk_answers_attempt
    FOREIGN KEY (attempt_id) REFERENCES exam_attempts (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_answers_question
    FOREIGN KEY (question_id) REFERENCES questions (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 8. RESULTS  (computed after submission)
-- ============================================================
CREATE TABLE IF NOT EXISTS results (
  id            INT  NOT NULL AUTO_INCREMENT,
  attempt_id    INT  NOT NULL,
  student_id    INT  NOT NULL,
  exam_id       INT  NOT NULL,
  score         INT  NOT NULL DEFAULT 0,
  total_marks   INT  NOT NULL DEFAULT 0,
  percentage    DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  status        ENUM('pass','fail') NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_results_attempt (attempt_id),   -- one result per attempt
  CONSTRAINT fk_results_attempt
    FOREIGN KEY (attempt_id) REFERENCES exam_attempts (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_results_student
    FOREIGN KEY (student_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_results_exam
    FOREIGN KEY (exam_id) REFERENCES exams (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- VIEWS
-- ============================================================

-- View 1: Exam summary with attempt counts and averages
CREATE OR REPLACE VIEW v_exam_summary AS
SELECT
  e.id                                    AS exam_id,
  e.title                                 AS exam_title,
  s.name                                  AS subject_name,
  e.duration_mins,
  e.total_marks,
  e.pass_marks,
  e.status                                AS exam_status,
  COUNT(DISTINCT ea.id)                   AS total_attempts,
  COUNT(DISTINCT CASE WHEN r.status = 'pass' THEN r.id END) AS pass_count,
  COUNT(DISTINCT CASE WHEN r.status = 'fail' THEN r.id END) AS fail_count,
  ROUND(AVG(r.score), 2)                  AS avg_score,
  MAX(r.score)                            AS highest_score,
  MIN(r.score)                            AS lowest_score
FROM exams e
JOIN subjects s       ON e.subject_id = s.id
LEFT JOIN exam_attempts ea ON ea.exam_id = e.id AND ea.status = 'submitted'
LEFT JOIN results r   ON r.attempt_id = ea.id
GROUP BY e.id, e.title, s.name, e.duration_mins, e.total_marks, e.pass_marks, e.status;

-- View 2: Student results with student details
CREATE OR REPLACE VIEW v_student_results AS
SELECT
  r.id                                    AS result_id,
  u.id                                    AS student_id,
  u.name                                  AS student_name,
  u.email                                 AS student_email,
  e.title                                 AS exam_title,
  s.name                                  AS subject_name,
  r.score,
  r.total_marks,
  r.percentage,
  r.status                                AS result_status,
  ea.started_at,
  ea.submitted_at,
  r.created_at                            AS result_date
FROM results r
JOIN exam_attempts ea ON r.attempt_id = ea.id
JOIN users u          ON r.student_id = u.id
JOIN exams e          ON r.exam_id = e.id
JOIN subjects s       ON e.subject_id = s.id;

-- View 3: Subject-wise question count
CREATE OR REPLACE VIEW v_subject_question_count AS
SELECT
  s.id                                    AS subject_id,
  s.name                                  AS subject_name,
  s.description,
  COUNT(q.id)                             AS total_questions,
  SUM(q.marks)                            AS total_marks_available,
  COUNT(DISTINCT e.id)                    AS total_exams
FROM subjects s
LEFT JOIN questions q ON q.subject_id = s.id
LEFT JOIN exams e     ON e.subject_id = s.id
GROUP BY s.id, s.name, s.description;
