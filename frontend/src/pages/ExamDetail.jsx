// src/pages/ExamDetail.jsx – Admin: Question Mapping Console
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  HelpCircle,
  Clock,
  Award,
  Layers,
  BookOpen
} from 'lucide-react';

export default function ExamDetail() {
  const { id } = useParams();
  const [exam,         setExam]        = useState(null);
  const [assigned,     setAssigned]    = useState([]);
  const [allQuestions, setAllQuestions]= useState([]);
  const [selected,     setSelected]    = useState([]);
  const [loading,      setLoading]     = useState(true);
  const [saving,       setSaving]      = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [examRes, assignedRes] = await Promise.all([
        api.get(`/exams/${id}`),
        api.get(`/exams/${id}/questions`),
      ]);
      setExam(examRes.data.data);
      setAssigned(assignedRes.data.data || []);
      setSelected((assignedRes.data.data || []).map(q => q.id));

      const qRes = await api.get('/questions', { params: { subject_id: examRes.data.data.subject_id } });
      setAllQuestions(qRes.data.data || []);
    } catch {
      toast.error('Failed to load examination question mappings.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleQuestion = (qid) => {
    setSelected(prev =>
      prev.includes(qid) ? prev.filter(item => item !== qid) : [...prev, qid]
    );
  };

  const handleSelectAll = () => {
    if (selected.length === allQuestions.length) {
      setSelected([]);
    } else {
      setSelected(allQuestions.map(q => q.id));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post(`/exams/${id}/questions`, { question_ids: selected });
      toast.success('Question paper assignments updated!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update question paper.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
        <p>Loading question paper builder...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="alert alert-error">
        <span>Exam paper not found.</span>
      </div>
    );
  }

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
        <Link to="/exams" className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Exams</span>
        </Link>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Question Paper Composer 📋
          </h1>
          <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Curate test items for "{exam.title}"
          </span>
        </div>
      </div>

      {/* Exam Specs Bar */}
      <div className="card" style={{ padding: '1.25rem 1.75rem', marginBottom: '1.5rem', background: '#F8FAFC' }}>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.9rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Subject: </span>
            <strong style={{ color: 'var(--text-main)' }}>{exam.subject_name}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Duration: </span>
            <strong style={{ color: 'var(--text-main)' }}>{exam.duration_mins} Minutes</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Pass Criteria: </span>
            <strong style={{ color: 'var(--brand-green)' }}>{exam.pass_marks} Marks</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Status: </span>
            <span className={`badge ${exam.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
              {exam.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Question Selection Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Curriculum Question Pool
            </h3>
            <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              {selected.length} of {allQuestions.length} questions mapped to this exam
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {allQuestions.length > 0 && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleSelectAll}
              >
                {selected.length === allQuestions.length ? 'Deselect All' : 'Select All Pool'}
              </button>
            )}
            <button
              className="btn btn-primary btn-sm btn-pill"
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={15} />
              <span>{saving ? 'Updating...' : 'Save Question Paper'}</span>
            </button>
          </div>
        </div>

        {allQuestions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <HelpCircle size={30} />
            </div>
            <h3>No questions registered in {exam.subject_name}</h3>
            <p>Please populate the question bank for this subject first.</p>
            <Link to="/questions" className="btn btn-primary btn-sm btn-pill">
              Go to Question Bank
            </Link>
          </div>
        ) : (
          <div className="table-wrap" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '48px', textAlign: 'center' }}>Map</th>
                  <th>#</th>
                  <th>Question Statement</th>
                  <th>Correct Answer</th>
                  <th>Marks</th>
                </tr>
              </thead>
              <tbody>
                {allQuestions.map((q, i) => {
                  const isChecked = selected.includes(q.id);
                  return (
                    <tr
                      key={q.id}
                      onClick={() => toggleQuestion(q.id)}
                      style={{
                        cursor: 'pointer',
                        background: isChecked ? 'var(--brand-green-subtle)' : undefined
                      }}
                    >
                      <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleQuestion(q.id)}
                          style={{ width: '16px', height: '16px', accentColor: 'var(--brand-green)', cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{i + 1}</td>
                      <td style={{ maxWidth: 520, fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.5 }}>
                        {q.question_text}
                      </td>
                      <td>
                        <span className="badge badge-success">
                          Option {q.correct_option}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        +{q.marks || 1}
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
