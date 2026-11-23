// src/pages/Students.jsx – Admin Student Roster Management
import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Mail,
  Lock
} from 'lucide-react';

const EMPTY = { name: '', email: '', password: '', is_active: 1 };

export default function Students() {
  const [students, setStudents]       = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading]         = useState(true);
  const [modal, setModal]             = useState(null); // null | 'add' | 'edit'
  const [selected, setSelected]       = useState(null);
  const [form, setForm]               = useState(EMPTY);
  const [errors, setErrors]           = useState({});
  const [saving, setSaving]           = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setStudents(data.data || []);
    } catch {
      toast.error('Failed to load registered student candidates.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const openAdd = () => {
    setForm(EMPTY);
    setErrors({});
    setModal('add');
  };

  const openEdit = (s) => {
    setSelected(s);
    setForm({ name: s.name, email: s.email, password: '', is_active: s.is_active });
    setErrors({});
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = 'Candidate name is required.';
    if (!form.email.trim()) e.email = 'Valid email is required.';
    if (modal === 'add' && !form.password) e.password = 'Initial password is required.';
    else if (form.password && form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.post('/users', form);
        toast.success('Candidate enrolled successfully!');
      } else {
        await api.put(`/users/${selected.id}`, form);
        toast.success('Candidate profile updated!');
      }
      closeModal();
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Delete candidate "${s.name}"? All related examination attempts will be permanently erased.`)) return;
    try {
      await api.delete(`/users/${s.id}`);
      toast.success('Candidate record removed.');
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete operation failed.');
    }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Candidate Management 👩‍🎓
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Enroll, inspect, and update student profiles for online testing.
          </p>
        </div>
        <button className="btn btn-primary btn-pill" onClick={openAdd}>
          <UserPlus size={16} />
          <span>Enroll Candidate</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card" style={{ padding: '1.15rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '420px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="Search candidates by name or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
            <p>Loading candidate directory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Users size={30} />
            </div>
            <h3>No candidates found</h3>
            <p>Enroll your first student using the "Enroll Candidate" button above.</p>
          </div>
        ) : (
          <div className="table-wrap" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Candidate Name</th>
                  <th>Email ID</th>
                  <th>Account Status</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td>
                      <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{s.name}</strong>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{s.email}</td>
                    <td>
                      <span className={`badge ${s.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {s.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                      {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.45rem' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => openEdit(s)}
                          title="Edit Candidate"
                        >
                          <Edit2 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--danger)', borderColor: '#FECACA' }}
                          onClick={() => handleDelete(s)}
                          title="Delete Candidate"
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

      {/* Enroll/Edit Modal */}
      {modal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {modal === 'add' ? 'Enroll New Candidate' : 'Modify Candidate Profile'}
              </h3>
              <button
                onClick={closeModal}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} noValidate>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'error' : ''}`}
                  placeholder="e.g. Rachel Green"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'error' : ''}`}
                  placeholder="rachel@student.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                />
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  {modal === 'add' ? 'Password' : 'New Password (leave empty to retain existing)'}
                </label>
                <input
                  type="password"
                  className={`form-control ${errors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                />
                {errors.password && <div className="form-error">{errors.password}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Account Status</label>
                <select
                  className="form-control"
                  value={form.is_active}
                  onChange={e => setForm(p => ({ ...p, is_active: +e.target.value }))}
                >
                  <option value={1}>Active (Can take exams)</option>
                  <option value={0}>Deactivated (Access locked)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.75rem' }}>
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-pill" disabled={saving}>
                  {saving ? 'Saving...' : modal === 'add' ? 'Enroll Candidate' : 'Update Profile'}
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
  boxShadow: 'var(--shadow-lg)',
  maxHeight: '90vh',
  overflowY: 'auto'
};
