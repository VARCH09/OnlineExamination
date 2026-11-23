// src/pages/Attempts.jsx – Admin: Live Candidate Attempts Log
import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  ClipboardList,
  Search,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award
} from 'lucide-react';

export default function Attempts() {
  const [attempts, setAttempts]       = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading,  setLoading]        = useState(true);

  useEffect(() => {
    api.get('/attempts')
      .then(({ data }) => setAttempts(data.data || []))
      .catch(err => console.error('Failed to load attempts', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
        <p>Loading candidate assessment history...</p>
      </div>
    );
  }

  const filtered = attempts.filter(a =>
    a.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.exam_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Live Candidate Assessment Feed 📋
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Track all ongoing and submitted examination attempts in real-time.
        </p>
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '1.15rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '420px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="Search candidate name or exam title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <ClipboardList size={30} />
            </div>
            <h3>No examination attempts recorded</h3>
            <p>Once candidates start taking mock tests, their live logs will appear here.</p>
          </div>
        ) : (
          <div className="table-wrap" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Candidate</th>
                  <th>Exam Title</th>
                  <th>Session Status</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Outcome</th>
                  <th>Started At</th>
                  <th>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => {
                  const isSubmitted = a.status === 'submitted';
                  const isPass = a.result === 'pass';

                  return (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{i + 1}</td>
                      <td>
                        <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{a.student_name}</strong>
                      </td>
                      <td>{a.exam_title}</td>
                      <td>
                        <span className={`badge ${isSubmitted ? 'badge-success' : 'badge-warning'}`}>
                          {isSubmitted ? 'SUBMITTED' : 'IN PROGRESS'}
                        </span>
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
                        {new Date(a.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                        {new Date(a.started_at).toLocaleDateString()}
                      </td>
                      <td style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                        {a.submitted_at ? (
                          <>
                            {new Date(a.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                            {new Date(a.submitted_at).toLocaleDateString()}
                          </>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
