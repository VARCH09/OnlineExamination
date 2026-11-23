# 🎓 Online Examination System (SkillQuest)

A complete full-stack web application for conducting and managing online mock examinations, built with a modern EdTech interface inspired by platforms like Unacademy and NTA CBT platforms.

| Layer    | Technology |
|----------|-----------|
| Frontend | React 19 + Vite + Lucide Icons + React Router |
| Backend  | Node.js + Express |
| Database | MySQL (via `mysql2`) |
| Auth     | JWT + bcryptjs |

---

## 👥 Teammate Setup Guide (Replicate on Another System)

Share these instructions with any teammate who needs to run this project locally.

### 📌 Prerequisites
Make sure your system has:
1. **Git** ([Download Git](https://git-scm.com/downloads))
2. **Node.js v18 or higher** ([Download Node.js](https://nodejs.org/))
3. **MySQL Server** running locally (via MySQL Workbench, XAMPP, or Windows MySQL Service)

---

### Step 1: Clone the Repository
Open a terminal (PowerShell, Command Prompt, or Git Bash) and run:
```bash
git clone https://github.com/VARCH09/OnlineExamination.git
cd OnlineExamination
```

---

### Step 2: Configure the Backend & Database

1. Navigate to the `backend` directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create your local environment file from the example:
   - On **Windows (PowerShell)**:
     ```powershell
     Copy-Item .env.example .env
     ```
   - On **Mac / Linux / Git Bash**:
     ```bash
     cp .env.example .env
     ```

3. Open the newly created `backend/.env` file in VS Code or Notepad and set your local MySQL password:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_actual_mysql_password
   DB_NAME=online_examination_system

   JWT_SECRET=super_secret_jwt_key_change_me
   PORT=5000
   ```
   *(If your MySQL root user has no password, leave `DB_PASSWORD=` empty).*

4. **Run the 1-step automated database setup:**
   ```bash
   npm run setup-db
   ```
   > ✅ This automatically creates the `online_examination_system` database, builds all 8 tables and 3 views, and loads 50+ sample records and questions across 5 subjects.

---

### Step 3: Setup the Frontend

Open a **second terminal window** and run:
```bash
cd OnlineExamination/frontend
npm install
```

---

### Step 4: Run the Application

Keep **both terminals** open:

#### Terminal 1 (Backend Server)
```bash
cd OnlineExamination/backend
npm run dev
```
→ Server active at **http://localhost:5000**

#### Terminal 2 (Frontend Client)
```bash
cd OnlineExamination/frontend
npm run dev
```
→ Web Portal running at **http://localhost:5173**

Now open your browser and navigate to **http://localhost:5173**.

---

## 🔑 Demo Credentials (Or Use 1-Click Autofill on Login)

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | `admin@exam.com` | `password` | Manage students, questions, tests & view reports |
| **Student** | `alice@student.com` | `password` | Take mock tests, view scores & scorecard history |
| **Student** | `bob@student.com` | `password` | Student assessment account |

*(You can also register new student candidate accounts directly through the registration page).*

---

## 🗄️ Database Architecture

The MySQL database `online_examination_system` contains 8 interconnected tables:

1. **`users`**: Candidate and administrator accounts with bcrypt password hashes.
2. **`subjects`**: Academic disciplines (Mathematics, CS, DB Systems, Physics, English).
3. **`questions`**: 4-choice multiple choice items with correct keys and marks.
4. **`exams`**: Test definitions with duration, total marks, pass criteria, and schedule.
5. **`exam_questions`**: Many-to-many junction mapping question pools to exams.
6. **`exam_attempts`**: Individual student test sessions with timer and start/finish timestamps.
7. **`answers`**: Student's selected option per question in an attempt (enforces no duplicate answers).
8. **`results`**: Server-side evaluated scores, percentages, and pass/fail verdicts.

### SQL Views Available:
- `v_exam_summary`: Per-exam attempt count, average score, pass/fail totals.
- `v_student_results`: Detailed candidate test ledger.
- `v_subject_question_count`: Question pool volume per subject.

---

## 🛠️ Project Structure

```
OnlineExamination/
├── database/
│   ├── schema.sql           # Database DDL (8 tables + 3 views + constraints)
│   ├── seed.sql             # 50+ sample test questions and data
│   └── queries.sql          # 13 relational queries (JOIN, GROUP BY, subqueries)
├── backend/
│   ├── server.js            # Express server entry point
│   ├── config/db.js         # MySQL2 connection pool
│   ├── middleware/          # JWT auth guards & input validation
│   ├── routes/              # REST API controllers (auth, exams, attempts, reports)
│   ├── scripts/setup-db.js  # Automated DB initialization script
│   └── .env.example         # Environment template
└── frontend/
    ├── src/
    │   ├── components/      # EdTech layout, sidebar & navigation
    │   ├── context/         # AuthContext with localStorage token persistence
    │   ├── pages/           # 14 pages (CBT Room, Scorecard, Test Series, Admin)
    │   └── index.css        # Unacademy-inspired design system
    └── vite.config.js       # Vite configuration with API proxy
```
