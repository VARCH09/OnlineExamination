// src/pages/AvailableExams.jsx – Unacademy Mock Test Series Catalogue
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  Clock,
  Award,
  HelpCircle,
  Search,
  CheckCircle2,
  PlayCircle,
  Sparkles,
  BookOpen,
  Filter
} from 'lucide-react';

export default function AvailableExams() {
  const [exams, setExams]             = useState([]);
  const [myAtts, setMyAtts]           = useState([]);
  const [subjects, setSubjects]       = useState([]);
  const [selectedSub, setSelectedSub] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading]         = useState(true);
  const [starting, setStarting]       = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eRes, aRes, sRes] = await Promise.all([
          api.get('/exams'),
          api.get('/attempts/my'),
          api.get('/subjects'),
        ]);
        setExams(eRes.data.data || []);
        setMyAtts(aRes.data.data || []);
        setSubjects(sRes.data.data || []);
      } catch (err) {
        toast.error('Failed to load examination series.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getAttempt = (examId) => {
    return myAtts.find(a => a.exam_id === examId);
  };

  const handleStart = async (examId) => {
    setStarting(examId);
    try {
      const { data } = await api.post('/attempts/start', { exam_id: examId });
      toast.success(data.message || 'Exam started! Good luck.');
      navigate(`/take-exam/${data.data.attempt_id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not launch examination.');
    } finally {
      setStarting(null);
    }
  };

  // Filtered exams
  const filteredExams = exams.filter(exam => {
    const matchesSubject = selectedSub === 'ALL' || String(exam.subject_id) === String(selectedSub);
    const matchesSearch =
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.subject_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
        <p>Loading available test series...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header & Subtitle */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
          All India Mock Test Series 📝
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Real exam simulations with instant evaluation, scorecards, and time tracking.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.15rem 1.5rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Search by test name or subject..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Subject Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => setSelectedSub('ALL')}
              className={`btn btn-sm ${selectedSub === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              All Subjects ({exams.length})
            </button>
            {subjects.map(s => {
              const count = exams.filter(e => e.subject_id === s.id).length;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSub(s.id)}
                  className={`btn btn-sm ${selectedSub === s.id ? 'btn-primary' : 'btn-outline'}`}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  {s.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Test Cards Grid */}
      {filteredExams.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">
            <BookOpen size={28} />
          </div>
          <h3>No examinations match your filter</h3>
          <p>Try clearing your search query or choosing another subject category.</p>
          <button
            className="btn btn-primary btn-sm btn-pill"
            onClick={() => { setSearchQuery(''); setSelectedSub('ALL'); }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1.4rem' }}>
          {filteredExams.map(exam => {
            const attempt = getAttempt(exam.id);
            const isSubmitted = attempt?.status === 'submitted';
            const isInProgress = attempt?.status === 'in_progress';

            return (
              <div
                key={exam.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  marginBottom: 0,
                  border: isInProgress ? '2px solid var(--warning)' : undefined,
                  boxShadow: isInProgress ? '0 4px 16px rgba(245, 158, 11, 0.15)' : undefined
                }}
              >
                <div>
                  {/* Subject Tag & Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <span className="badge badge-purple">
                      {exam.subject_name}
                    </span>
                    {isSubmitted && (
                      <span className="badge badge-success">
                        <CheckCircle2 size={12} />
                        Completed
                      </span>
                    )}
                    {isInProgress && (
                      <span className="badge badge-warning">
                        <Clock size={12} />
                        In Progress
                      </span>
                    )}
                    {!attempt && (
                      <span className="badge badge-info">
                        <Sparkles size={12} />
                        Free Mock
                      </span>
                    )}
                  </div>

                  {/* Test Title */}
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.45rem', lineHeight: 1.35 }}>
                    {exam.title}
                  </h3>

                  {/* Test Description */}
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    {exam.description || 'Full length practice test covering standard curriculum questions.'}
                  </p>

                  {/* Metadata Matrix */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.65rem',
                      background: '#F8FAFC',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1.4rem',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Clock size={15} style={{ color: 'var(--brand-green)' }} />
                      <span>{exam.duration_mins} Minutes</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <HelpCircle size={15} style={{ color: 'var(--accent-blue)' }} />
                      <span>{exam.question_count || 10} Questions</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Award size={15} style={{ color: 'var(--accent-purple)' }} />
                      <span>{exam.total_marks} Total Marks</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <CheckCircle2 size={15} style={{ color: 'var(--success)' }} />
                      <span>Pass: {exam.pass_marks} Marks</span>
                    </div>
                  </div>
                </div>

                {/* Action CTA */}
                <div>
                  {isSubmitted ? (
                    <div style={{ display: 'flex', gap: '0.65rem' }}>
                      <Link
                        to={`/result/${attempt.id}`}
                        className="btn btn-outline btn-sm"
                        style={{ flex: 1, fontWeight: 700, borderColor: 'var(--border-color)' }}
                      >
                        Review Scorecard
                      </Link>
                    </div>
                  ) : isInProgress ? (
                    <button
                      className="btn btn-primary btn-sm btn-pill"
                      style={{ width: '100%', background: '#F59E0B', borderColor: '#D97706', boxShadow: 'none' }}
                      onClick={() => handleStart(exam.id)}
                      disabled={starting === exam.id}
                    >
                      <PlayCircle size={16} />
                      <span>{starting === exam.id ? 'Resuming...' : 'Resume Mock Test'}</span>
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm btn-pill"
                      style={{ width: '100%' }}
                      onClick={() => handleStart(exam.id)}
                      disabled={starting === exam.id}
                    >
                      <PlayCircle size={16} />
                      <span>{starting === exam.id ? 'Launching...' : 'Start Test Now'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
