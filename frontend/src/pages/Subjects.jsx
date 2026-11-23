// src/pages/Subjects.jsx – Admin Subject Curriculum Directory
import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  HelpCircle
} from 'lucide-react';

const EMPTY = { name: '', description: '' };

export default function Subjects() {
  const [subjects, setSubjects]       = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading]         = useState(true);
  const [modal, setModal]             = useState(null);
  const [selected, setSelected]       = useState(null);
  const [form, setForm]               = useState(EMPTY);
  const [errors, setErrors]           = useState({});
  const [saving, setSaving]           = useState(false);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/subjects');
      setSubjects(data.data || []);
    } catch {
      toast.error('Failed to load subject directory.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

  const openAdd  = () => { setForm(EMPTY); setErrors({}); setModal('add'); };
  const openEdit = (s) => {
    setSelected(s);
    setForm({ name: s.name, description: s.description || '' });
    setErrors({});
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setSelected(null); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Subject title is required.';
    setErrors(e);
    return !e.name;
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.post('/subjects', form);
        toast.success('Subject domain added!');
      } else {
        await api.put(`/subjects/${selected.id}`, form);
        toast.success('Subject updated!');
      }
      closeModal();
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Delete subject "${s.name}"? Exams associated with this subject must be removed first.`)) return;
    try {
      await api.delete(`/subjects/${s.id}`);
      toast.success('Subject deleted.');
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    }
  };

  const filtered = subjects.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Subject Catalog 📚
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Manage core academic disciplines, modules, and question bank linkages.
          </p>
        </div>
        <button className="btn btn-primary btn-pill" onClick={openAdd}>
          <Plus size={16} />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '1.15rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '420px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
            <p>Loading subjects...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <BookOpen size={30} />
            </div>
            <h3>No subjects cataloged</h3>
            <p>Add subjects to begin categorizing question banks and mock tests.</p>
          </div>
        ) : (
          <div className="table-wrap" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Subject Name</th>
                  <th>Description</th>
                  <th>Question Bank</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td>
                      <strong style={{ color: 'var(--text-main)', fontSize: '0.96rem' }}>{s.name}</strong>
                    </td>
                    <td style={{ maxWidth: 360, color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                      {s.description || '—'}
                    </td>
                    <td>
                      <span className="badge badge-info">
                        <HelpCircle size={12} />
                        {s.question_count || 0} Questions
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.45rem' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--danger)', borderColor: '#FECACA' }}
                          onClick={() => handleDelete(s)}
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
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

      {modal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {modal === 'add' ? 'Add Subject Domain' : 'Edit Subject'}
              </h3>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} noValidate>
              <div className="form-group">
                <label className="form-label">Subject Name *</label>
                <input
                  className={`form-control ${errors.name ? 'error' : ''}`}
                  placeholder="e.g. Data Structures & Algorithms"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Curriculum Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Overview of curriculum modules covered..."
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-pill" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Subject'}
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
  maxWidth: '480px',
  width: '100%',
  boxShadow: 'var(--shadow-lg)'
};
