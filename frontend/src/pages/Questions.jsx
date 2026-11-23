// src/pages/Questions.jsx – Admin Question Bank Pool Management
import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Filter,
  CheckCircle2
} from 'lucide-react';

const EMPTY = { subject_id: '', question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A', marks: 1 };

export default function Questions() {
  const [questions,   setQuestions]   = useState([]);
  const [subjects,    setSubjects]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState(null);
  const [selected,    setSelected]    = useState(null);
  const [form,        setForm]        = useState(EMPTY);
  const [errors,      setErrors]      = useState({});
  const [saving,      setSaving]      = useState(false);
  const [filterSub,   setFilterSub]   = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterSub ? { subject_id: filterSub } : {};
      const [q, s] = await Promise.all([
        api.get('/questions', { params }),
        api.get('/subjects'),
      ]);
      setQuestions(q.data.data || []);
      setSubjects(s.data.data || []);
    } catch {
      toast.error('Failed to load question repository.');
    } finally {
      setLoading(false);
    }
  }, [filterSub]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openAdd  = () => { setForm(EMPTY); setErrors({}); setModal('add'); };
  const openEdit = (q) => {
    setSelected(q);
    setForm({
      subject_id: q.subject_id,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option,
      marks: q.marks
    });
    setErrors({});
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setSelected(null); };

  const validate = () => {
    const e = {};
    if (!form.subject_id)             e.subject_id    = 'Subject is required.';
    if (!form.question_text.trim())   e.question_text = 'Question text is required.';
    if (!form.option_a.trim())        e.option_a      = 'Option A is required.';
    if (!form.option_b.trim())        e.option_b      = 'Option B is required.';
    if (!form.option_c.trim())        e.option_c      = 'Option C is required.';
    if (!form.option_d.trim())        e.option_d      = 'Option D is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.post('/questions', form);
        toast.success('Question added to bank!');
      } else {
        await api.put(`/questions/${selected.id}`, form);
        toast.success('Question updated!');
      }
      closeModal();
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (q) => {
    if (!window.confirm('Delete this question permanently?')) return;
    try {
      await api.delete(`/questions/${q.id}`);
      toast.success('Question removed.');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

  const filtered = questions.filter(q =>
    q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.subject_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Question Repository ❓
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Curate multiple choice items with assigned answer keys and mark allocations.
          </p>
        </div>
        <button className="btn btn-primary btn-pill" onClick={openAdd}>
          <Plus size={16} />
          <span>Add Question</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.15rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '420px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Search question contents..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <select
              className="form-control"
              style={{ width: '220px' }}
              value={filterSub}
              onChange={e => setFilterSub(e.target.value)}
            >
              <option value="">All Subjects ({questions.length})</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
            <p>Loading questions...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <HelpCircle size={30} />
            </div>
            <h3>No questions found</h3>
            <p>Add new test items to build the assessment pool.</p>
          </div>
        ) : (
          <div className="table-wrap" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Subject</th>
                  <th>Question Statement</th>
                  <th>Correct Key</th>
                  <th>Marks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q, i) => (
                  <tr key={q.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td>
                      <span className="badge badge-purple">{q.subject_name}</span>
                    </td>
                    <td style={{ maxWidth: 440, fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.5 }}>
                      {q.question_text}
                    </td>
                    <td>
                      <span className="badge badge-success" style={{ fontWeight: 800 }}>
                        Key: Option {q.correct_option}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      +{q.marks || 1}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.45rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(q)}>
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--danger)', borderColor: '#FECACA' }}
                          onClick={() => handleDelete(q)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {modal === 'add' ? 'Add Question to Bank' : 'Edit Question Details'}
              </h3>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} noValidate>
              <div className="form-group">
                <label className="form-label">Subject Category *</label>
                <select
                  className={`form-control ${errors.subject_id ? 'error' : ''}`}
                  value={form.subject_id}
                  onChange={e => setForm(p => ({ ...p, subject_id: e.target.value }))}
                >
                  <option value="">— Select Subject —</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {errors.subject_id && <div className="form-error">{errors.subject_id}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Question Text *</label>
                <textarea
                  className={`form-control ${errors.question_text ? 'error' : ''}`}
                  rows={3}
                  placeholder="Type the question statement..."
                  value={form.question_text}
                  onChange={e => setForm(p => ({ ...p, question_text: e.target.value }))}
                />
                {errors.question_text && <div className="form-error">{errors.question_text}</div>}
              </div>

              {['a', 'b', 'c', 'd'].map(opt => (
                <div className="form-group" key={opt}>
                  <label className="form-label">Option {opt.toUpperCase()} *</label>
                  <input
                    className={`form-control ${errors[`option_${opt}`] ? 'error' : ''}`}
                    placeholder={`Answer choice for option ${opt.toUpperCase()}...`}
                    value={form[`option_${opt}`]}
                    onChange={e => setForm(p => ({ ...p, [`option_${opt}`]: e.target.value }))}
                  />
                  {errors[`option_${opt}`] && <div className="form-error">{errors[`option_${opt}`]}</div>}
                </div>
              ))}

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Correct Option Answer Key *</label>
                  <select
                    className="form-control"
                    value={form.correct_option}
                    onChange={e => setForm(p => ({ ...p, correct_option: e.target.value }))}
                  >
                    {['A', 'B', 'C', 'D'].map(o => (
                      <option key={o} value={o}>Option {o}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Marks Value</label>
                  <input
                    type="number"
                    min={1}
                    className="form-control"
                    value={form.marks}
                    onChange={e => setForm(p => ({ ...p, marks: +e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.75rem' }}>
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-pill" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(12, 20, 33, 0.65)',
  backdropFilter: 'blur(5px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '1.5rem'
};

const modalStyle = {
  background: '#FFFFFF',
  borderRadius: 'var(--radius-xl)',
  padding: '2.25rem',
  maxWidth: '560px',
  width: '100%',
  boxShadow: 'var(--shadow-lg)',
  maxHeight: '90vh',
  overflowY: 'auto'
};
