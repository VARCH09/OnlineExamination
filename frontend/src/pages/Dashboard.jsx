// src/pages/Dashboard.jsx – Unacademy-Inspired EdTech Dashboard
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Users,
  BookOpen,
  HelpCircle,
  FileText,
  ClipboardList,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Award,
  Target
} from 'lucide-react';

export default function Dashboard() {
  const { isAdmin, user } = useAuth();
  const [stats, setStats]       = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (isAdmin) {
          const [usersRes, subsRes, qRes, examsRes, attsRes] = await Promise.all([
            api.get('/users'),
            api.get('/subjects'),
            api.get('/questions'),
            api.get('/exams'),
            api.get('/attempts'),
          ]);
          setStats({
            students:  usersRes.data.data.length,
            subjects:  subsRes.data.data.length,
            questions: qRes.data.data.length,
            exams:     examsRes.data.data.length,
            attempts:  attsRes.data.data.length,
          });
          setSubjects(subsRes.data.data);
        } else {
          const [examsRes, resultsRes, subsRes] = await Promise.all([
            api.get('/exams'),
            api.get('/attempts/my'),
            api.get('/subjects'),
          ]);
          const myAtts = resultsRes.data.data || [];
          const passedCount = myAtts.filter(r => r.result === 'pass').length;
          setStats({
            available: examsRes.data.data.length,
            attempted: myAtts.length,
            passed:    passedCount,
            passRate:  myAtts.length > 0 ? Math.round((passedCount / myAtts.length) * 100) : 0,
          });
          setSubjects(subsRes.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
        <p>Loading your learning space...</p>
      </div>
    );
  }

  // ── ADMIN VIEW ────────────────────────────────────────────
  if (isAdmin) {
    return (
      <div>
        {/* Admin Executive Banner */}
        <div className="ed-hero-banner">
          <div className="ed-hero-content">
            <div className="ed-hero-tag">
              <Sparkles size={14} />
              <span>Academic Operations Console</span>
            </div>
            <h1 className="ed-hero-title">
              Online Examination Management Hub
            </h1>
            <p className="ed-hero-desc">
              Monitor student submissions, curate question banks, orchestrate timed mock assessments, and analyze subject performance in real-time.
            </p>
            <div className="ed-hero-actions">
              <Link to="/exams" className="btn btn-primary btn-pill">
                <FileText size={16} />
                <span>Create Mock Test</span>
              </Link>
              <Link to="/reports" className="btn btn-outline btn-pill" style={{ background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.2)' }}>
                <TrendingUp size={16} />
                <span>View Performance Analytics</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Admin KPI Stat Cards */}
        <div className="stat-grid">
          <Link to="/students" className="stat-card">
            <div className="stat-icon-wrapper stat-icon-blue">
              <Users size={24} />
            </div>
            <div>
              <div className="stat-num">{stats?.students ?? 0}</div>
              <div className="stat-label">Active Candidates</div>
            </div>
          </Link>

          <Link to="/subjects" className="stat-card">
            <div className="stat-icon-wrapper stat-icon-purple">
              <BookOpen size={24} />
            </div>
            <div>
              <div className="stat-num">{stats?.subjects ?? 0}</div>
              <div className="stat-label">Subject Domains</div>
            </div>
          </Link>

          <Link to="/questions" className="stat-card">
            <div className="stat-icon-wrapper stat-icon-green">
              <HelpCircle size={24} />
            </div>
            <div>
              <div className="stat-num">{stats?.questions ?? 0}</div>
              <div className="stat-label">Questions in Pool</div>
            </div>
          </Link>

          <Link to="/exams" className="stat-card">
            <div className="stat-icon-wrapper stat-icon-amber">
              <FileText size={24} />
            </div>
            <div>
              <div className="stat-num">{stats?.exams ?? 0}</div>
              <div className="stat-label">Total Exams</div>
            </div>
          </Link>

          <Link to="/attempts" className="stat-card">
            <div className="stat-icon-wrapper stat-icon-blue">
              <ClipboardList size={24} />
            </div>
            <div>
              <div className="stat-num">{stats?.attempts ?? 0}</div>
              <div className="stat-label">Total Submissions</div>
            </div>
          </Link>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="card">
          <div className="card-title">
            <span>Quick Assessment Actions</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <Link to="/exams" style={{ textDecoration: 'none' }}>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', background: '#F8FAFC' }}>
                <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>+ New Examination</div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Configure duration, pass marks, and schedule.</div>
              </div>
            </Link>
            <Link to="/questions" style={{ textDecoration: 'none' }}>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', background: '#F8FAFC' }}>
                <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>+ Question Creator</div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Add 4-choice multiple choice items.</div>
              </div>
            </Link>
            <Link to="/students" style={{ textDecoration: 'none' }}>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', background: '#F8FAFC' }}>
                <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>Enroll Student</div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Create candidate accounts and credentials.</div>
              </div>
            </Link>
            <Link to="/reports" style={{ textDecoration: 'none' }}>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', background: '#F8FAFC' }}>
                <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>Audit & Reports</div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Review top scorers, pass/fail counts and views.</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── STUDENT VIEW (Unacademy Mock Test Portal) ─────────────
  return (
    <div>
      {/* Student Motivation Banner */}
      <div className="ed-hero-banner">
        <div className="ed-hero-content">
          <div className="ed-hero-tag">
            <Target size={14} />
            <span>Target College Mini Project • Daily Practice</span>
          </div>
          <h1 className="ed-hero-title">
            Welcome back, {user?.name}! 🎯
          </h1>
          <p className="ed-hero-desc">
            Practice with timed CBT mock examinations across Mathematics, Computer Science, Database Systems, Physics, and English.
          </p>
          <div className="ed-hero-actions">
            <Link to="/available-exams" className="btn btn-primary btn-pill">
              <span>Take a Mock Test</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/my-results"
              className="btn btn-outline btn-pill"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              <Award size={16} />
              <span>View My Scorecard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Student Metric Cards */}
      <div className="stat-grid">
        <Link to="/available-exams" className="stat-card">
          <div className="stat-icon-wrapper stat-icon-green">
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-num">{stats?.available ?? 0}</div>
            <div className="stat-label">Available Tests</div>
          </div>
        </Link>

        <Link to="/my-results" className="stat-card">
          <div className="stat-icon-wrapper stat-icon-blue">
            <ClipboardList size={24} />
          </div>
          <div>
            <div className="stat-num">{stats?.attempted ?? 0}</div>
            <div className="stat-label">Tests Completed</div>
          </div>
        </Link>

        <Link to="/my-results" className="stat-card">
          <div className="stat-icon-wrapper stat-icon-purple">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-num">{stats?.passed ?? 0}</div>
            <div className="stat-label">Exams Qualified</div>
          </div>
        </Link>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-amber">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-num">{stats?.passRate ?? 0}%</div>
            <div className="stat-label">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Subject Test Series Grid */}
      <div className="card">
        <div className="card-title">
          <span>Explore Subject Test Series</span>
          <Link to="/available-exams" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--brand-green)' }}>
            View All Tests →
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {subjects.map(s => (
            <div
              key={s.id}
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.35rem',
                background: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <span className="badge badge-purple" style={{ marginBottom: '0.75rem' }}>
                  {s.question_count || 10}+ Questions
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.45rem', color: 'var(--text-main)' }}>
                  {s.name}
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {s.description || 'Comprehensive evaluation covering foundational to advanced topics.'}
                </p>
              </div>
              <Link
                to="/available-exams"
                className="btn btn-outline btn-sm"
                style={{ width: '100%', borderColor: 'var(--border-color)', fontWeight: 700 }}
              >
                <span>Practice Series</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ size = 16, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
