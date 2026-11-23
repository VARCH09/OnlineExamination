-- ============================================================
--  Online Examination System – Seed Data
--  Run AFTER schema.sql
--  Passwords are bcrypt hashes of the values shown in comments
-- ============================================================

USE online_examination_system;

-- ============================================================
-- USERS
-- Password for admin@exam.com  → "Admin@123"
-- Password for all students    → "Student@123"
-- (bcrypt rounds=10 hashes, generated offline)
-- ============================================================
INSERT INTO users (name, email, password, role) VALUES
('Super Admin',    'admin@exam.com',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Alice Johnson',  'alice@student.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
('Bob Smith',      'bob@student.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
('Carol White',    'carol@student.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
('David Brown',    'david@student.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),
('Eva Green',      'eva@student.com',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student');

-- NOTE: The seed uses a known bcrypt hash for the demo password "password".
-- In the real app, bcrypt will hash whatever the user registers with.
-- For testing, register new accounts through the UI which will hash correctly.

-- ============================================================
-- SUBJECTS
-- ============================================================
INSERT INTO subjects (name, description) VALUES
('Mathematics',      'Basic and applied mathematics covering algebra, calculus, and statistics.'),
('Computer Science', 'Fundamentals of programming, data structures, and algorithms.'),
('Physics',          'Classical mechanics, thermodynamics, optics, and modern physics.'),
('English',          'Grammar, comprehension, writing, and literature.'),
('Database Systems', 'Relational databases, SQL, normalization, and transactions.');

-- ============================================================
-- QUESTIONS  (10 per subject = 50 questions)
-- ============================================================

-- Mathematics (subject_id = 1)
INSERT INTO questions (subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks) VALUES
(1, 'What is the value of π (pi) approximately?', '3.14', '2.71', '1.41', '1.73', 'A', 1),
(1, 'What is 15% of 200?',                         '25',   '30',   '35',   '40',  'B', 1),
(1, 'If x² = 49, what is x?',                      '6',    '7',    '8',    '9',   'B', 1),
(1, 'What is the derivative of x²?',               'x',    '2x',   'x/2',  '2',   'B', 1),
(1, 'What is the value of 2^10?',                  '512',  '1024', '2048', '256',  'B', 1),
(1, 'What is the area of a circle with radius 5?', '50π',  '25π',  '10π',  '5π',  'B', 1),
(1, 'Simplify: 3(2 + 4)',                          '12',   '18',   '15',   '21',  'B', 1),
(1, 'What is the LCM of 4 and 6?',                 '12',   '8',    '24',   '16',  'A', 1),
(1, 'What is log₁₀(1000)?',                        '2',    '3',    '4',    '1',   'B', 1),
(1, 'The sum of angles in a triangle is?',         '90°',  '180°', '270°', '360°','B', 1);

-- Computer Science (subject_id = 2)
INSERT INTO questions (subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks) VALUES
(2, 'Which data structure uses FIFO order?',                     'Stack',   'Queue',       'Tree',  'Graph',  'B', 1),
(2, 'What does HTML stand for?',                                 'Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Text Modular Language', 'None', 'A', 1),
(2, 'Which sorting algorithm has O(n log n) average time?',      'Bubble Sort', 'Selection Sort', 'Merge Sort', 'Insertion Sort', 'C', 1),
(2, 'What is the binary representation of decimal 10?',          '1010', '1100', '0101', '1001', 'A', 1),
(2, 'Which language is used for web styling?',                   'HTML', 'CSS', 'JavaScript', 'PHP', 'B', 1),
(2, 'What does OOP stand for?',                                  'Object Oriented Programming', 'Open Operating Platform', 'Ordered Object Processing', 'None', 'A', 1),
(2, 'Which is NOT a programming paradigm?',                      'Functional', 'Procedural', 'Circular', 'Object-Oriented', 'C', 1),
(2, 'What does RAM stand for?',                                  'Random Access Memory', 'Read Access Memory', 'Rapid Access Module', 'None', 'A', 1),
(2, 'Time complexity of binary search is?',                      'O(n)', 'O(n²)', 'O(log n)', 'O(1)', 'C', 1),
(2, 'Which symbol is used for single-line comment in JavaScript?','##', '//', '/* */', '--', 'B', 1);

-- Physics (subject_id = 3)
INSERT INTO questions (subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks) VALUES
(3, 'What is the SI unit of force?',                     'Joule',  'Newton', 'Watt',   'Pascal', 'B', 1),
(3, 'Speed of light in vacuum is approximately?',         '3×10⁶ m/s', '3×10⁸ m/s', '3×10¹⁰ m/s', '3×10⁴ m/s', 'B', 1),
(3, 'Which law states F = ma?',                           'Newton''s First Law', 'Newton''s Second Law', 'Newton''s Third Law', 'Hooke''s Law', 'B', 1),
(3, 'What is the unit of electric resistance?',           'Ampere', 'Volt', 'Ohm', 'Watt', 'C', 1),
(3, 'Energy = mass × speed of light². This is?',          'E = mc²', 'F = ma', 'V = IR', 'P = IV', 'A', 1),
(3, 'Which type of wave does not require a medium?',      'Sound',  'Water', 'Electromagnetic', 'Seismic', 'C', 1),
(3, 'The acceleration due to gravity on Earth is?',       '8.9 m/s²', '9.8 m/s²', '10.8 m/s²', '11.2 m/s²', 'B', 1),
(3, 'What is the unit of power?',                         'Joule', 'Watt', 'Newton', 'Pascal', 'B', 1),
(3, 'Ohm''s Law states?',                                  'V = IR', 'F = ma', 'P = mv', 'E = mc²', 'A', 1),
(3, 'Which color has the highest frequency in visible light?', 'Red', 'Green', 'Yellow', 'Violet', 'D', 1);

-- English (subject_id = 4)
INSERT INTO questions (subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks) VALUES
(4, 'Which is a noun?',                           'Run',    'Beautiful', 'Happiness', 'Quickly', 'C', 1),
(4, 'Choose the synonym of "Happy":',             'Sad',    'Joyful',    'Angry',     'Tired',   'B', 1),
(4, 'Which is the correct past tense of "go"?',   'Goed',   'Goes',      'Gone',      'Went',    'D', 1),
(4, 'What is an antonym of "begin"?',             'Start',  'Continue',  'End',       'Initiate','C', 1),
(4, 'Identify the adjective: "She wore a red dress."', 'wore', 'dress', 'red', 'she', 'C', 1),
(4, 'Which sentence uses correct grammar?',       'She doesn''t know (wrong).', 'She doesn''t knows.', 'She doesn''t know.', 'She not know.', 'C', 1),
(4, 'The plural of "child" is?',                  'Childs', 'Childes', 'Children', 'Childrens', 'C', 1),
(4, 'Choose the correct spelling:',               'Recieve', 'Receive', 'Receve', 'Recieve', 'B', 1),
(4, 'What is the subject in: "The cat sat on the mat."?', 'sat', 'mat', 'cat', 'on', 'C', 1),
(4, 'Which is a compound sentence?',              'She runs fast.', 'She runs, and he walks.', 'Running fast is fun.', 'None', 'B', 1);

-- Database Systems (subject_id = 5)
INSERT INTO questions (subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks) VALUES
(5, 'What does SQL stand for?',                             'Structured Query Language', 'Simple Query Language', 'Standard Query Logic', 'None', 'A', 1),
(5, 'Which SQL command retrieves data?',                    'INSERT', 'UPDATE', 'SELECT', 'DELETE', 'C', 1),
(5, 'What is a primary key?',                               'A key that can be NULL', 'A key that uniquely identifies a record', 'A foreign key', 'None', 'B', 1),
(5, 'Which normal form eliminates partial dependencies?',   '1NF', '2NF', '3NF', 'BCNF', 'B', 1),
(5, 'What does JOIN do in SQL?',                            'Deletes records', 'Combines rows from two tables', 'Creates a table', 'Updates records', 'B', 1),
(5, 'Which clause filters groups in SQL?',                  'WHERE', 'ORDER BY', 'HAVING', 'GROUP BY', 'C', 1),
(5, 'ACID properties stand for?',                           'Atomicity, Consistency, Isolation, Durability', 'Access, Control, Integrity, Data', 'None', 'All of the above', 'A', 1),
(5, 'Which SQL keyword removes duplicate rows?',            'DISTINCT', 'UNIQUE', 'DIFFERENT', 'ONLY', 'A', 1),
(5, 'A foreign key references?',                            'Primary key of another table', 'Primary key of the same table', 'Any column', 'None', 'A', 1),
(5, 'Which command is used to change table structure?',     'MODIFY', 'UPDATE', 'ALTER', 'CHANGE', 'C', 1);

-- ============================================================
-- EXAMS
-- ============================================================
INSERT INTO exams (subject_id, title, description, duration_mins, total_marks, pass_marks, status, start_time, end_time) VALUES
(1, 'Mathematics Mid-Term',   'Basic math exam for mid semester.',  30, 10, 5, 'active',   '2026-11-01 09:00:00', '2026-12-31 23:59:00'),
(2, 'CS Fundamentals Quiz',   'Quiz on CS basics.',                 20, 10, 5, 'active',   '2026-11-01 09:00:00', '2026-12-31 23:59:00'),
(3, 'Physics Unit Test',      'Unit test on physics concepts.',     25, 10, 5, 'active',   '2026-11-01 09:00:00', '2026-12-31 23:59:00'),
(4, 'English Grammar Test',   'Test on English grammar and usage.', 20, 10, 5, 'active',   '2026-11-01 09:00:00', '2026-12-31 23:59:00'),
(5, 'Database Systems Exam',  'Comprehensive DB exam.',             30, 10, 5, 'active',   '2026-11-01 09:00:00', '2026-12-31 23:59:00');

-- ============================================================
-- EXAM_QUESTIONS  (assign all 10 questions of each subject to its exam)
-- Math exam (exam_id=1) → questions 1-10
-- CS exam   (exam_id=2) → questions 11-20
-- Physics   (exam_id=3) → questions 21-30
-- English   (exam_id=4) → questions 31-40
-- DB        (exam_id=5) → questions 41-50
-- ============================================================
INSERT INTO exam_questions (exam_id, question_id, order_num) VALUES
(1,1,1),(1,2,2),(1,3,3),(1,4,4),(1,5,5),(1,6,6),(1,7,7),(1,8,8),(1,9,9),(1,10,10),
(2,11,1),(2,12,2),(2,13,3),(2,14,4),(2,15,5),(2,16,6),(2,17,7),(2,18,8),(2,19,9),(2,20,10),
(3,21,1),(3,22,2),(3,23,3),(3,24,4),(3,25,5),(3,26,6),(3,27,7),(3,28,8),(3,29,9),(3,30,10),
(4,31,1),(4,32,2),(4,33,3),(4,34,4),(4,35,5),(4,36,6),(4,37,7),(4,38,8),(4,39,9),(4,40,10),
(5,41,1),(5,42,2),(5,43,3),(5,44,4),(5,45,5),(5,46,6),(5,47,7),(5,48,8),(5,49,9),(5,50,10);

-- ============================================================
-- EXAM_ATTEMPTS & ANSWERS & RESULTS  (sample completed attempts)
-- ============================================================

-- Alice attempts Math exam (all correct → 10/10 → pass)
INSERT INTO exam_attempts (exam_id, student_id, started_at, submitted_at, status, time_taken) VALUES
(1, 2, '2026-11-10 10:00:00', '2026-11-10 10:28:00', 'submitted', 1680);

INSERT INTO answers (attempt_id, question_id, selected_option) VALUES
(1,1,'A'),(1,2,'B'),(1,3,'B'),(1,4,'B'),(1,5,'B'),(1,6,'B'),(1,7,'B'),(1,8,'A'),(1,9,'B'),(1,10,'B');

INSERT INTO results (attempt_id, student_id, exam_id, score, total_marks, percentage, status) VALUES
(1, 2, 1, 10, 10, 100.00, 'pass');

-- Bob attempts Math exam (6 correct → 6/10 → pass)
INSERT INTO exam_attempts (exam_id, student_id, started_at, submitted_at, status, time_taken) VALUES
(1, 3, '2026-11-10 11:00:00', '2026-11-10 11:25:00', 'submitted', 1500);

INSERT INTO answers (attempt_id, question_id, selected_option) VALUES
(2,1,'A'),(2,2,'B'),(2,3,'B'),(2,4,'A'),(2,5,'B'),(2,6,'A'),(2,7,'B'),(2,8,'A'),(2,9,'B'),(2,10,'A');

INSERT INTO results (attempt_id, student_id, exam_id, score, total_marks, percentage, status) VALUES
(2, 3, 1, 6, 10, 60.00, 'pass');

-- Carol attempts CS exam (4 correct → 4/10 → fail)
INSERT INTO exam_attempts (exam_id, student_id, started_at, submitted_at, status, time_taken) VALUES
(2, 4, '2026-11-11 09:00:00', '2026-11-11 09:18:00', 'submitted', 1080);

INSERT INTO answers (attempt_id, question_id, selected_option) VALUES
(3,11,'B'),(3,12,'A'),(3,13,'C'),(3,14,'A'),(3,15,'B'),(3,16,'A'),(3,17,'C'),(3,18,'A'),(3,19,'C'),(3,20,'A');

INSERT INTO results (attempt_id, student_id, exam_id, score, total_marks, percentage, status) VALUES
(3, 4, 2, 4, 10, 40.00, 'fail');

-- David attempts Physics exam (8 correct → 8/10 → pass)
INSERT INTO exam_attempts (exam_id, student_id, started_at, submitted_at, status, time_taken) VALUES
(3, 5, '2026-11-12 14:00:00', '2026-11-12 14:22:00', 'submitted', 1320);

INSERT INTO answers (attempt_id, question_id, selected_option) VALUES
(4,21,'B'),(4,22,'B'),(4,23,'B'),(4,24,'C'),(4,25,'A'),(4,26,'C'),(4,27,'B'),(4,28,'B'),(4,29,'A'),(4,30,'A');

INSERT INTO results (attempt_id, student_id, exam_id, score, total_marks, percentage, status) VALUES
(4, 5, 3, 8, 10, 80.00, 'pass');

-- Eva attempts DB exam (5 correct → 5/10 → pass)
INSERT INTO exam_attempts (exam_id, student_id, started_at, submitted_at, status, time_taken) VALUES
(5, 6, '2026-11-13 10:00:00', '2026-11-13 10:28:00', 'submitted', 1680);

INSERT INTO answers (attempt_id, question_id, selected_option) VALUES
(5,41,'A'),(5,42,'C'),(5,43,'B'),(5,44,'B'),(5,45,'B'),(5,46,'A'),(5,47,'A'),(5,48,'A'),(5,49,'A'),(5,50,'A');

INSERT INTO results (attempt_id, student_id, exam_id, score, total_marks, percentage, status) VALUES
(5, 6, 5, 5, 10, 50.00, 'pass');
