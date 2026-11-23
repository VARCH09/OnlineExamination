// src/pages/Exams.jsx – Admin Examination Management
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Layers,
  Clock,
  Award,
  Search,
  X
} from 'lucide-react';

const EMPTY = { subject_id: '', title: '', description: '', duration_mins: 30, total_marks: 0, pass_marks: 5, status: 'draft', start_time: '', end_time: '' };

export default function Exams() {
  const [exams,       setExams]       = useState([]);
  const [subjects,    setSubjects]    = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState(null);
  const [selected,    setSelected]    = useState(null);
  const [form,        setForm]        = useState(EMPTY);
  const [errors,      setErrors]      = useState({});
  const [saving,      setSaving]      = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [e, s] = await Promise.all([api.get('/exams'), api.get('/subjects')]);
      setExams(e.data.data || []);
      setSubjects(s.data.data || []);
    } catch {
      toast.error('Failed to load examination catalog.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const toInput = (dt) => dt ? dt.slice(0, 16) : '';

  const openAdd  = () => { setForm(EMPTY); setErrors({}); setModal('add'); };
  const openEdit = (e) => {
    setSelected(e);
    setForm({
      subject_id: e.subject_id,
      title: e.title,
      description: e.description || '',
      duration_mins: e.duration_mins,
      total_marks: e.total_marks,
      pass_marks: e.pass_marks,
      status: e.status,
      start_time: toInput(e.start_time),
      end_time: toInput(e.end_time)
    });
    setErrors({});
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setSelected(null); };

  const validate = () => {
    const e = {};
    if (!form.subject_id)     e.subject_id    = 'Subject is required.';
    if (!form.title.trim())   e.title         = 'Title is required.';
    if (!form.duration_mins)  e.duration_mins = 'Duration is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, start_time: form.start_time || null, end_time: form.end_time || null };
      if (modal === 'add') {
        await api.post('/exams', payload);
        toast.success('Exam created successfully!');
      } else {
        await api.put(`/exams/${selected.id}`, payload);
        toast.success('Exam updated successfully!');
      }
      closeModal();
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e) => {
    if (!window.confirm(`Delete exam "${e.title}"?`)) return;
    try {
      await api.delete(`/exams/${e.id}`);
      toast.success('Exam deleted.');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

  const filtered = exams.filter(e =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.subject_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Examination Management 📝
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Create mock tests, set time limits and pass benchmarks, and map question papers.
          </p>
        </div>
        <button className="btn btn-primary btn-pill" onClick={openAdd}>
          <Plus size={16} />
          <span>Create Examination</span>
        </button>
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '1.15rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '420px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="Search exams by title or subject..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {/* Exams Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
            <p>Loading examination schedule...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileText size={30} />
            </div>
            <h3>No exams configured</h3>
            <p>Create your first mock test using the button above.</p>
          </div>
        ) : (
          <div className="table-wrap" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Exam Title</th>
                  <th>Subject</th>
                  <th>Duration</th>
                  <th>Marks (Total / Pass)</th>
                  <th>Assigned Qs</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td>
                      <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{e.title}</strong>
                    </td>
                    <td>
                      <span className="badge badge-purple">{e.subject_name}</span>
                    </td>
                    <td style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      {e.duration_mins} mins
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {e.total_marks} / <span style={{ color: 'var(--brand-green)' }}>{e.pass_marks}</span>
                    </td>
                    <td>
                      <span className="badge badge-info">{e.question_count} Qs</span>
                    </td>
                    <td>
                      <span className={`badge ${e.status === 'active' ? 'badge-success' : e.status === 'draft' ? 'badge-warning' : 'badge-muted'}`}>
                        {e.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.45rem' }}>
                        <Link
                          to={`/exams/${e.id}`}
                          className="btn btn-outline btn-sm"
                          style={{ borderColor: 'var(--brand-green)', color: 'var(--brand-green)', fontWeight: 700 }}
                          title="Assign Questions"
                        >
                          <Layers size={14} />
                          <span>Assign Qs</span>
                        </Link>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => openEdit(e)}
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--danger)', borderColor: '#FECACA' }}
                          onClick={() => handleDelete(e)}
                          title="Delete"
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
                {modal === 'add' ? 'Create New Examination' : 'Edit Exam Configuration'}
              </h3>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} noValidate>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <select
                  className={`form-control ${errors.subject_id ? 'error' : ''}`}
                  value={form.subject_id}
                  onChange={e => setForm(p => ({ ...p, subject_id: e.target.value }))}
                >
                  <option value="">— Select Subject —</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {errors.subject_id && <div className="form-error">{errors.subject_id}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Exam Title</label>
                <input
                  type="text"
                  className={`form-control ${errors.title ? 'error' : ''}`}
                  placeholder="e.g. Computer Science Term Assessment"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                />
                {errors.title && <div className="form-error">{errors.title}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Description / Instructions</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Assessment guidelines, marking scheme, etc."
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Duration (Minutes)</label>
                  <input
                    type="number"
                    min={1}
                    className={`form-control ${errors.duration_mins ? 'error' : ''}`}
                    value={form.duration_mins}
                    onChange={e => setForm(p => ({ ...p, duration_mins: +e.target.value }))}
                  />
                  {errors.duration_mins && <div className="form-error">{errors.duration_mins}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Pass Marks</label>
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    value={form.pass_marks}
                    onChange={e => setForm(p => ({ ...p, pass_marks: +e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Publication Status</label>
                <select
                  className="form-control"
                  value={form.status}
                  onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                >
                  <option value="draft">Draft (Hidden from students)</option>
                  <option value="active">Active (Available for testing)</option>
                  <option value="inactive">Inactive (Archived)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.75rem' }}>
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-pill" disabled={saving}>
                  {saving ? 'Saving...' : modal === 'add' ? 'Publish Exam' : 'Save Changes'}
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
  maxWidth: '540px',
  width: '100%',
  boxShadow: 'var(--shadow-lg)',
  maxHeight: '90vh',
  overflowY: 'auto'
};
