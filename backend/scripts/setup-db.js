// scripts/setup-db.js
// Run this once to create the database, tables, views, and seed data.
// Usage: node scripts/setup-db.js

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs    = require('fs');
const path  = require('path');

async function setup() {
  console.log('🔌 Connecting to MySQL...');

  // Connect WITHOUT specifying a database (so we can create it)
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,   // needed to run the full SQL files
  });

  console.log('✅ Connected!\n');

  // Drop existing database so we always start clean (safe for dev/setup)
  const dbName = process.env.DB_NAME || 'online_examination_system';
  console.log(`🗑️  Dropping existing database "${dbName}" (if any)...`);
  await conn.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
  console.log('   ✅ Done.\n');

  const files = [
    path.join(__dirname, '..', '..', 'database', 'schema.sql'),
    path.join(__dirname, '..', '..', 'database', 'seed.sql'),
  ];

  for (const file of files) {
    const name = path.basename(file);
    console.log(`📄 Running ${name}...`);
    const sql = fs.readFileSync(file, 'utf8');
    try {
      await conn.query(sql);
      console.log(`   ✅ ${name} done.\n`);
    } catch (err) {
      console.error(`   ❌ Error in ${name}:`, err.message);
      await conn.end();
      process.exit(1);
    }
  }

  console.log('🎉 Database setup complete!');
  console.log('   Database : online_examination_system');
  console.log('   Tables   : users, subjects, questions, exams,');
  console.log('              exam_questions, exam_attempts, answers, results');
  console.log('   Views    : v_exam_summary, v_student_results, v_subject_question_count');
  console.log('\n👤 Demo login: admin@exam.com / password');
  console.log('👤 Demo login: alice@student.com / password\n');

  await conn.end();
}

setup().catch(err => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
