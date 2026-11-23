# 🎓 Online Examination System

A complete full-stack web application for conducting online exams.

| Layer    | Technology |
|----------|-----------|
| Frontend | React 18 + Vite |
| Backend  | Node.js + Express |
| Database | MySQL (via mysql2) |
| Auth     | JWT + bcrypt |

---

## 📁 Project Structure

```
DBS_Group/
├── database/
│   ├── schema.sql      ← Create all 8 tables + 3 views
│   ├── seed.sql        ← 50+ sample records
│   └── queries.sql     ← 13 demonstration SQL queries
├── backend/
│   ├── server.js       ← Express entry point
│   ├── config/db.js    ← MySQL connection pool
│   ├── middleware/
│   │   ├── auth.js     ← JWT verify + role guards
│   │   └── validate.js ← Input validation helpers
│   ├── routes/
│   │   ├── auth.js     ← /api/auth  (login, register, /me)
│   │   ├── users.js    ← /api/users (admin: manage students)
│   │   ├── subjects.js ← /api/subjects
│   │   ├── questions.js← /api/questions
│   │   ├── exams.js    ← /api/exams + question assignment
│   │   ├── attempts.js ← /api/attempts (start, answer, submit)
│   │   └── reports.js  ← /api/reports
│   ├── .env            ← Your secrets (never commit!)
│   ├── .env.example    ← Template
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/axios.js          ← Axios with JWT interceptor
    │   ├── context/AuthContext.jsx
    │   ├── components/Layout.jsx ← Sidebar + topbar
    │   └── pages/
    │       ├── Login.jsx
    │       ├── Register.jsx
    │       ├── Dashboard.jsx
    │       ├── Students.jsx
    │       ├── Subjects.jsx
    │       ├── Questions.jsx
    │       ├── Exams.jsx
    │       ├── ExamDetail.jsx    ← Assign questions to exams
    │       ├── AvailableExams.jsx
    │       ├── TakeExam.jsx      ← Countdown + answer saving
    │       ├── ResultDetail.jsx
    │       ├── MyResults.jsx
    │       ├── Attempts.jsx
    │       └── Reports.jsx
    ├── .env
    └── package.json
```

---

## ⚙️ Setup Instructions

### 1 — MySQL Setup

1. Open **MySQL Workbench** (or any MySQL client).
2. Run the schema file first:
   ```sql
   SOURCE path/to/DBS_Group/database/schema.sql;
   ```
3. Run the seed file to load sample data:
   ```sql
   SOURCE path/to/DBS_Group/database/seed.sql;
   ```
4. (Optional) Run demonstration queries:
   ```sql
   SOURCE path/to/DBS_Group/database/queries.sql;
   ```

> **Note:** The seed file uses a known bcrypt hash for the password `"password"`.
> Use this password when logging in with the demo accounts below.
> Any new accounts registered through the UI will hash correctly.

---

### 2 — Backend Setup

```bash
cd DBS_Group/backend

# 1. Install dependencies
npm install

# 2. Configure environment
#    Edit .env with your MySQL password and a secret key:
#    DB_PASSWORD=your_mysql_password
#    JWT_SECRET=any_long_random_string

# 3. Start the server
npm run dev      # development (nodemon, auto-restart)
# or
npm start        # production
```

The backend runs at **http://localhost:5000**

---

### 3 — Frontend Setup

```bash
cd DBS_Group/frontend

# 1. Install dependencies
npm install

# 2. Start Vite dev server
npm run dev
```

The frontend runs at **http://localhost:5173**

---

## 🔑 Demo Login Credentials

| Role    | Email               | Password |
|---------|---------------------|----------|
| Admin   | admin@exam.com      | password |
| Student | alice@student.com   | password |
| Student | bob@student.com     | password |

> You can also register a new student account from the Register page.

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint          | Access  | Description |
|--------|-------------------|---------|-------------|
| POST   | /api/auth/register| Public  | Student registration |
| POST   | /api/auth/login   | Public  | Login (returns JWT) |
| GET    | /api/auth/me      | Any     | Get current user |

### Users (Students)
| Method | Endpoint        | Access | Description |
|--------|-----------------|--------|-------------|
| GET    | /api/users      | Admin  | List all students |
| POST   | /api/users      | Admin  | Create student |
| PUT    | /api/users/:id  | Admin  | Update student |
| DELETE | /api/users/:id  | Admin  | Delete student |

### Subjects
| Method | Endpoint           | Access | Description |
|--------|--------------------|--------|-------------|
| GET    | /api/subjects      | Any    | List subjects |
| POST   | /api/subjects      | Admin  | Create subject |
| PUT    | /api/subjects/:id  | Admin  | Update subject |
| DELETE | /api/subjects/:id  | Admin  | Delete subject |

### Questions
| Method | Endpoint            | Access | Description |
|--------|---------------------|--------|-------------|
| GET    | /api/questions      | Any    | List questions |
| POST   | /api/questions      | Admin  | Create question |
| PUT    | /api/questions/:id  | Admin  | Update question |
| DELETE | /api/questions/:id  | Admin  | Delete question |

### Exams
| Method | Endpoint                      | Access  | Description |
|--------|-------------------------------|---------|-------------|
| GET    | /api/exams                    | Any     | List exams |
| POST   | /api/exams                    | Admin   | Create exam |
| PUT    | /api/exams/:id                | Admin   | Update exam |
| DELETE | /api/exams/:id                | Admin   | Delete exam |
| GET    | /api/exams/:id/questions      | Any     | Questions in exam |
| POST   | /api/exams/:id/questions      | Admin   | Assign questions |
| DELETE | /api/exams/:id/questions/:qid | Admin   | Remove question |

### Attempts
| Method | Endpoint                  | Access  | Description |
|--------|---------------------------|---------|-------------|
| GET    | /api/attempts             | Admin   | All attempts |
| GET    | /api/attempts/my          | Student | My attempts |
| POST   | /api/attempts/start       | Student | Start exam |
| POST   | /api/attempts/:id/answer  | Student | Save answer |
| POST   | /api/attempts/:id/submit  | Student | Submit exam |
| GET    | /api/attempts/:id/result  | Any     | Get result |

### Reports
| Method | Endpoint                              | Access | Description |
|--------|---------------------------------------|--------|-------------|
| GET    | /api/reports/exam-summary             | Admin  | Exam stats |
| GET    | /api/reports/pass-fail                | Admin  | Pass/fail counts |
| GET    | /api/reports/top-scorers              | Admin  | Top 10 students |
| GET    | /api/reports/above-average            | Admin  | Above-avg students |
| GET    | /api/reports/subject-question-count   | Admin  | Subject stats |
| GET    | /api/reports/student-results          | Admin  | All results |

---

## 🗄️ Database Relationships

```
users (id) ←── exam_attempts.student_id
users (id) ←── results.student_id

subjects (id) ←── questions.subject_id
subjects (id) ←── exams.subject_id

exams (id) ←── exam_questions.exam_id
exams (id) ←── exam_attempts.exam_id
exams (id) ←── results.exam_id

questions (id) ←── exam_questions.question_id
questions (id) ←── answers.question_id

exam_attempts (id) ←── answers.attempt_id
exam_attempts (id) ←── results.attempt_id  (1-to-1, UNIQUE)
```

### Key Constraints
- Passwords are stored as **bcrypt hashes** (10 rounds)
- Duplicate answers for the same question in the same attempt are prevented via UNIQUE key
- A student cannot start an already-submitted exam (server-enforced)
- Correct answers are **never sent to the student** before submission
- Score is calculated **server-side** after submission
- Foreign-key CASCADE deletes propagate correctly

---

## 🚀 Run Commands (Quick Reference)

```bash
# Terminal 1 – Backend
cd DBS_Group/backend
npm run dev

# Terminal 2 – Frontend
cd DBS_Group/frontend
npm run dev
```

Then open http://localhost:5173 in your browser.

---

## 📋 SQL Views

| View | Description |
|------|-------------|
| `v_exam_summary` | Per-exam attempt count, avg/max/min score, pass/fail counts |
| `v_student_results` | All results with student name, exam title, subject, score |
| `v_subject_question_count` | Questions per subject and total marks available |
