// src/pages/ResultDetail.jsx – Unacademy Style Detailed Performance Scorecard
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import {
  Award,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Clock,
  ArrowRight,
  BookOpen,
  Share2,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function ResultDetail() {
  const { id: attemptId } = useParams();
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.get(`/attempts/${attemptId}/result`)
      .then(({ data }) => setResult(data.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to retrieve assessment scorecard.'))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
        <p>Computing your performance scorecard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card alert-error">
        <XCircle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  const isPassed = result.status === 'pass';

  return (
    <div style={{ maxWidth: 840, margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Top Breadcrumb & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Link to="/my-results" className="btn btn-outline btn-sm">
          ← Back to All Results
        </Link>
        <span className="badge badge-purple">
          Official Assessment Record #{attemptId}
        </span>
      </div>

      {/* Main Score Hero Card (Unacademy Style) */}
      <div className="result-hero-card">
        {/* Celebration / Alert Pill */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', background: isPassed ? 'var(--brand-green-subtle)' : 'var(--danger-bg)', color: isPassed ? 'var(--brand-green)' : 'var(--danger)', fontWeight: 800, fontSize: '0.86rem', marginBottom: '1.25rem' }}>
          {isPassed ? <Sparkles size={16} /> : <XCircle size={16} />}
          <span>{isPassed ? 'CONGRATULATIONS! QUALIFIED' : 'NEEDS PRACTICE & REVISION'}</span>
        </div>

        {/* Circular Gauge */}
        <div className={`result-score-gauge ${isPassed ? 'pass' : 'fail'}`}>
          <div className="result-score-number">{result.percentage}%</div>
          <div className="result-score-sub">{isPassed ? 'PASS' : 'FAIL'}</div>
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
          You scored {result.score} out of {result.total_marks} Marks
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '2rem' }}>
          Passing benchmark was <strong>{result.pass_marks} Marks</strong> in {result.exam_title}.
        </p>

        {/* 3 Metric Summary Chips */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            background: '#F8FAFC',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            textAlign: 'left',
            marginBottom: '2rem'
          }}
        >
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Subject Domain</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>{result.subject_name}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Accuracy Score</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: isPassed ? 'var(--brand-green)' : 'var(--danger)', marginTop: '0.2rem' }}>{result.percentage}%</div>
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Candidate Name</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>{result.student_name}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/available-exams" className="btn btn-primary btn-pill">
            <BookOpen size={16} />
            <span>Practice Another Exam</span>
          </Link>
          <Link to="/my-results" className="btn btn-outline btn-pill">
            <Award size={16} />
            <span>View All My Results</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
