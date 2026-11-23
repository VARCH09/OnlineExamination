// src/pages/MyResults.jsx – Unacademy Style Candidate History & Performance
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';

export default function MyResults() {
  const [attempts, setAttempts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get('/attempts/my')
      .then(({ data }) => setAttempts(data.data || []))
      .catch(err => console.error('Failed to load past attempts', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
        <p>Loading your past examination history...</p>
      </div>
    );
  }

  const completed = attempts.filter(a => a.status === 'submitted');
  const passed = completed.filter(a => a.result === 'pass').length;
  const avgPercentage = completed.length > 0
    ? Math.round(completed.reduce((acc, c) => acc + (parseFloat(c.percentage) || 0), 0) / completed.length)
    : 0;

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
          My Performance Scorecard 🏆
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Review your assessment scores, accuracy percentages, and status across all exams.
        </p>
      </div>

      {/* Summary KPI Strip */}
      <div className="stat-grid" style={{ marginBottom: '1.75rem' }}>
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-blue">
            <FileText size={24} />
          </div>
          <div>
            <div className="stat-num">{attempts.length}</div>
            <div className="stat-label">Total Attempts</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-green">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="stat-num">{passed}</div>
            <div className="stat-label">Qualified Tests</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-purple">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-num">{avgPercentage}%</div>
            <div className="stat-label">Average Accuracy</div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {attempts.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">
            <Award size={32} />
          </div>
          <h3>No mock tests completed yet</h3>
          <p>Launch your first examination to track your performance and accuracy analytics.</p>
          <Link to="/available-exams" className="btn btn-primary btn-pill">
            <span>Browse Mock Exams</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrap" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Exam Title</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Verdict</th>
                  <th>Attempted On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a, i) => {
                  const isPass = a.result === 'pass';
                  const isSubmitted = a.status === 'submitted';

                  return (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{i + 1}</td>
                      <td>
                        <strong style={{ color: 'var(--text-main)', fontSize: '0.96rem' }}>
                          {a.exam_title}
                        </strong>
                      </td>
                      <td>
                        {isSubmitted ? (
                          <span className="badge badge-success">Completed</span>
                        ) : (
                          <span className="badge badge-warning">In Progress</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {a.score !== null ? `${a.score} / ${a.total_marks}` : '—'}
                      </td>
                      <td>
                        {a.percentage !== null ? (
                          <span style={{ fontWeight: 800, color: isPass ? 'var(--brand-green)' : 'var(--danger)' }}>
                            {a.percentage}%
                          </span>
                        ) : '—'}
                      </td>
                      <td>
                        {a.result ? (
                          <span className={`badge ${isPass ? 'badge-success' : 'badge-danger'}`}>
                            {isPass ? 'QUALIFIED' : 'FAILED'}
                          </span>
                        ) : (
                          <span className="badge badge-muted">Pending</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                        {new Date(a.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td>
                        {isSubmitted ? (
                          <Link to={`/result/${a.id}`} className="btn btn-outline btn-sm" style={{ fontWeight: 700 }}>
                            View Scorecard →
                          </Link>
                        ) : (
                          <Link to={`/take-exam/${a.id}`} className="btn btn-primary btn-sm btn-pill">
                            Resume Test
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
