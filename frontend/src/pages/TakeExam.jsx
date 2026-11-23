// src/pages/TakeExam.jsx – Unacademy / NTA Style Computer-Based Test (CBT) Interface
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  RotateCcw,
  Send,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';

export default function TakeExam() {
  const { id: attemptId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam]                     = useState(null);
  const [questions, setQuestions]           = useState([]);
  const [answers, setAnswers]               = useState({});       // { questionId: 'A'|'B'|'C'|'D' }
  const [reviewMarked, setReviewMarked]     = useState(new Set());// Set of questionIds marked for review
  const [current, setCurrent]               = useState(0);
  const [timeLeft, setTimeLeft]             = useState(null);     // in seconds
  const [loading, setLoading]               = useState(true);
  const [submitting, setSubmitting]         = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const startTime = useRef(Date.now());
  const timerRef  = useRef(null);

  // Load Exam and Questions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const attRes = await api.get('/attempts/my');
        const attempt = attRes.data.data.find(a => String(a.id) === String(attemptId));
        if (!attempt) {
          toast.error('Test attempt session not found.');
          navigate('/available-exams');
          return;
        }
        if (attempt.status === 'submitted') {
          navigate(`/result/${attemptId}`);
          return;
        }

        const [examRes, qRes] = await Promise.all([
          api.get(`/exams/${attempt.exam_id}`),
          api.get(`/exams/${attempt.exam_id}/questions`),
        ]);

        setExam(examRes.data.data);
        setQuestions(qRes.data.data || []);
        setTimeLeft(examRes.data.data.duration_mins * 60);
      } catch (err) {
        toast.error('Failed to initialize test session.');
        navigate('/available-exams');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [attemptId, navigate]);

  // Countdown Timer
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      handleFinalSubmit(true);
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft]);

  // Auto-save answer to server
  const saveAnswer = useCallback(async (questionId, option) => {
    try {
      await api.post(`/attempts/${attemptId}/answer`, {
        question_id: questionId,
        selected_option: option,
      });
    } catch (err) {
      console.warn('Background answer save warning', err);
    }
  }, [attemptId]);

  // Select Option
  const handleSelectOption = (option) => {
    const q = questions[current];
    if (!q) return;
    setAnswers(prev => ({ ...prev, [q.id]: option }));
    saveAnswer(q.id, option);
  };

  // Clear current response
  const handleClearResponse = () => {
    const q = questions[current];
    if (!q) return;
    setAnswers(prev => {
      const next = { ...prev };
      delete next[q.id];
      return next;
    });
    saveAnswer(q.id, null);
  };

  // Toggle Mark for Review
  const handleToggleReview = () => {
    const q = questions[current];
    if (!q) return;
    setReviewMarked(prev => {
      const next = new Set(prev);
      if (next.has(q.id)) {
        next.delete(q.id);
      } else {
        next.add(q.id);
      }
      return next;
    });
  };

  // Submit Logic
  const handleFinalSubmit = async (isAutoExpired = false) => {
    if (submitting) return;
    setSubmitting(true);
    clearTimeout(timerRef.current);

    try {
      const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);
      await api.post(`/attempts/${attemptId}/submit`, { time_taken: timeTaken });
      toast.success(isAutoExpired ? 'Time up! Exam submitted automatically.' : 'Exam submitted successfully!');
      navigate(`/result/${attemptId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please check connection.');
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
        <p>Configuring secure assessment environment...</p>
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="card empty-state">
        <AlertTriangle size={36} style={{ color: 'var(--danger)', margin: '0 auto 1rem' }} />
        <h3>No questions available for this test</h3>
        <p>Please contact the test administrator.</p>
      </div>
    );
  }

  const q = questions[current];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const reviewCount = reviewMarked.size;
  const unansweredCount = totalQuestions - answeredCount;
  const isTimeCritical = timeLeft !== null && timeLeft < 120; // under 2 mins

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* CBT Layout Grid */}
      <div className="cbt-container">
        {/* Main Question & Answering Column */}
        <div className="cbt-main-panel">
          {/* Header Bar */}
          <div className="cbt-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.2rem' }}>
                <span className="badge badge-purple">{exam.subject_name}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>CBT Mode</span>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {exam.title}
              </h2>
            </div>

            {/* Timer Badge */}
            <div className={`cbt-timer-badge ${isTimeCritical ? 'danger' : ''}`}>
              <Clock size={18} />
              <span>{timeLeft !== null ? formatTime(timeLeft) : '--:--'}</span>
            </div>
          </div>

          {/* Active Question Box */}
          <div className="cbt-question-card">
            <div className="cbt-question-meta">
              <span className="cbt-q-number">
                Question {current + 1} of {totalQuestions}
              </span>
              <span className="cbt-q-marks">
                Marks: +{q.marks || 1}.0 / -0.0
              </span>
            </div>

            <div className="cbt-question-text">
              {q.question_text}
            </div>

            {/* 4 Interactive Option Cards */}
            <div className="cbt-options-list">
              {['A', 'B', 'C', 'D'].map(opt => {
                const isSelected = answers[q.id] === opt;
                const optionKey = `option_${opt.toLowerCase()}`;
                const optionText = q[optionKey];

                return (
                  <div
                    key={opt}
                    onClick={() => handleSelectOption(opt)}
                    className={`cbt-option-card ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="cbt-option-indicator">
                      {opt}
                    </div>
                    <div style={{ flex: 1, color: isSelected ? 'var(--text-main)' : undefined }}>
                      {optionText}
                    </div>
                    {isSelected && (
                      <CheckCircle2 size={18} style={{ color: 'var(--brand-green)' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Navigation Controls */}
          <div className="cbt-actions-bar">
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setCurrent(c => Math.max(0, c - 1))}
                disabled={current === 0}
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <button
                className="btn btn-outline btn-sm"
                onClick={handleClearResponse}
                disabled={!answers[q.id]}
                title="Deselect answer"
              >
                <RotateCcw size={15} />
                <span>Clear</span>
              </button>

              <button
                className="btn btn-outline btn-sm"
                onClick={handleToggleReview}
                style={{
                  color: reviewMarked.has(q.id) ? 'var(--accent-purple)' : undefined,
                  borderColor: reviewMarked.has(q.id) ? 'var(--accent-purple)' : undefined,
                  background: reviewMarked.has(q.id) ? 'var(--accent-purple-subtle)' : undefined
                }}
              >
                <Bookmark size={15} />
                <span>{reviewMarked.has(q.id) ? 'Marked for Review' : 'Review Later'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {current < totalQuestions - 1 ? (
                <button
                  className="btn btn-primary btn-sm btn-pill"
                  onClick={() => setCurrent(c => Math.min(totalQuestions - 1, c + 1))}
                >
                  <span>Save & Next</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  className="btn btn-success btn-sm btn-pill"
                  onClick={() => setShowSubmitModal(true)}
                >
                  <Send size={16} />
                  <span>Review & Submit</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Question Palette Panel (Unacademy Style) */}
        <div className="cbt-sidebar-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem' }}>
            <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Question Palette
            </h4>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {answeredCount}/{totalQuestions} Answered
            </span>
          </div>

          {/* Color-Coded Legend */}
          <div className="cbt-palette-legend">
            <div className="cbt-legend-item">
              <span className="cbt-legend-dot" style={{ background: 'var(--brand-green)' }} />
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="cbt-legend-item">
              <span className="cbt-legend-dot" style={{ background: 'var(--accent-purple)' }} />
              <span>Review ({reviewCount})</span>
            </div>
            <div className="cbt-legend-item">
              <span className="cbt-legend-dot" style={{ background: '#E2E8F0' }} />
              <span>Unanswered ({unansweredCount})</span>
            </div>
            <div className="cbt-legend-item">
              <span className="cbt-legend-dot" style={{ background: '#2563EB' }} />
              <span>Current Item</span>
            </div>
          </div>

          {/* Question Jump Grid */}
          <div className="cbt-palette-grid">
            {questions.map((item, idx) => {
              const isAnswered = !!answers[item.id];
              const isReview   = reviewMarked.has(item.id);
              const isCurrent  = idx === current;

              let btnClass = 'cbt-palette-btn';
              if (isCurrent)  btnClass += ' current';
              if (isReview)   btnClass += ' review';
              else if (isAnswered) btnClass += ' answered';

              return (
                <button
                  key={item.id}
                  className={btnClass}
                  onClick={() => setCurrent(idx)}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Test Submission Action */}
          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setShowSubmitModal(true)}
            >
              <Send size={16} />
              <span>Submit Assessment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modern Submit Confirmation Dialog Modal */}
      {showSubmitModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(12, 20, 33, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem'
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              padding: '2.25rem',
              maxWidth: '460px',
              width: '100%',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--brand-green-subtle)',
                  color: 'var(--brand-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}
              >
                <HelpCircle size={28} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Ready to submit your test?
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Please review your submission summary before finalizing. Once submitted, answers cannot be edited.
              </p>
            </div>

            {/* Test Stats Matrix */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.85rem',
                marginBottom: '1.5rem',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <div>Total Questions: <strong>{totalQuestions}</strong></div>
              <div>Answered: <strong style={{ color: 'var(--brand-green)' }}>{answeredCount}</strong></div>
              <div>Unanswered: <strong style={{ color: 'var(--danger)' }}>{unansweredCount}</strong></div>
              <div>For Review: <strong style={{ color: 'var(--accent-purple)' }}>{reviewCount}</strong></div>
            </div>

            {/* Modal Buttons */}
            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <button
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
              >
                Resume Test
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1.2 }}
                onClick={() => handleFinalSubmit(false)}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
