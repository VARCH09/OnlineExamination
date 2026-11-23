// src/pages/Login.jsx – Unacademy-Inspired Split Showcase Authentication
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  BookOpen,
  Award
} from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]         = useState({ email: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.email.trim())    e.email    = 'Email address is required.';
    if (!form.password.trim()) e.password = 'Password is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.data.user, data.data.token);
      toast.success(`Welcome back, ${data.data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Invalid credentials. Please verify email and password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click credentials autofill helper (ideal for college evaluators / practical exams)
  const autofillDemo = (role) => {
    if (role === 'admin') {
      setForm({ email: 'admin@exam.com', password: 'password' });
    } else {
      setForm({ email: 'alice@student.com', password: 'password' });
    }
    setErrors({});
    setApiError('');
  };

  return (
    <div className="auth-split-wrapper">
      {/* Left EdTech Showcase Banner */}
      <div className="auth-showcase-panel">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '2.5rem' }}>
            <div className="sidebar-logo-icon">
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                SkillQuest
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--brand-green-light)', fontWeight: 700, textTransform: 'uppercase' }}>
                Online Examination Platform
              </div>
            </div>
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>
            The Modern Standard for Academic Evaluations.
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '480px', marginBottom: '2.5rem' }}>
            A secure full-stack testing ecosystem powered by timed NTA-style computer based exams, automated scoring, and real-time subject analytics.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '440px' }}>
            {[
              'Secure timed examination room with live question palette',
              'Server-side grading engine with instant score calculation',
              'Multi-subject question bank with parameterized MySQL architecture',
            ].map((text, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.92rem', color: '#E2E8F0' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--brand-green)', flexShrink: 0 }} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Social Proof Strip */}
        <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            College Practical Project
          </div>
          <div style={{ fontSize: '0.88rem', color: '#FFFFFF', fontWeight: 600 }}>
            Built with React, Node.js, Express & MySQL (mysql2)
          </div>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          <div style={{ marginBottom: '1.85rem' }}>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
              Sign in to your portal
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Enter your registered credentials to access your dashboard.
            </p>
          </div>

          {apiError && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'error' : ''}`}
                placeholder="candidate@student.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className={`form-control ${errors.password ? 'error' : ''}`}
                placeholder="Enter password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-pill"
              style={{ width: '100%', padding: '0.85rem 1rem', marginTop: '0.5rem' }}
              disabled={loading}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Account'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Credentials Fillers */}
          <div style={{ marginTop: '1.75rem', padding: '1.15rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
              ⚡ 1-Click Demo Evaluation Autofill:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.78rem', fontWeight: 700 }}
                onClick={() => autofillDemo('admin')}
              >
                <ShieldCheck size={14} style={{ color: 'var(--accent-purple)' }} />
                <span>Admin Demo</span>
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.78rem', fontWeight: 700 }}
                onClick={() => autofillDemo('student')}
              >
                <GraduationCap size={14} style={{ color: 'var(--brand-green)' }} />
                <span>Student Demo</span>
              </button>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.92rem', color: 'var(--text-muted)' }}>
            New student candidate? <Link to="/register" style={{ fontWeight: 700, color: 'var(--brand-green)' }}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
