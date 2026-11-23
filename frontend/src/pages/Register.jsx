// src/pages/Register.jsx – Candidate Registration Portal
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm]         = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Full name is required.';
    if (!form.email.trim())   e.email   = 'Valid email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email format.';
    if (!form.password)       e.password = 'Password is required.';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password
      });
      toast.success('Registration successful! Please log in with your credentials.');
      navigate('/login');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, type = 'text', placeholder = '') => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        type={type}
        className={`form-control ${errors[name] ? 'error' : ''}`}
        placeholder={placeholder}
        value={form[name]}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
      />
      {errors[name] && <div className="form-error">{errors[name]}</div>}
    </div>
  );

  return (
    <div className="auth-split-wrapper">
      {/* Left EdTech Showcase */}
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
            Start Your Test Preparation Journey Today.
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '480px', marginBottom: '2.5rem' }}>
            Register as a student candidate to access full-length timed mock tests, receive automated evaluations, and review your performance breakdown.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '440px' }}>
            {[
              'Unlimited mock examinations across all active subjects',
              'Instant scorecard generation with pass/fail evaluation',
              'Detailed performance tracking across all past test attempts',
            ].map((text, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.92rem', color: '#E2E8F0' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--brand-green)', flexShrink: 0 }} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.88rem', color: '#FFFFFF', fontWeight: 600 }}>
            🎓 College Mini Project • Database Systems & Web Technologies
          </div>
        </div>
      </div>

      {/* Right Register Form */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          <div style={{ marginBottom: '1.85rem' }}>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
              Create Candidate Account
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Fill in your details to register for the examination portal.
            </p>
          </div>

          {apiError && (
            <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {field('name',     'Full Name',            'text',     'e.g. John Doe')}
            {field('email',    'Email Address',        'email',    'john@student.com')}
            {field('password', 'Password',             'password', 'Minimum 6 characters')}
            {field('confirm',  'Confirm Password',     'password', 'Re-enter password')}

            <button
              type="submit"
              className="btn btn-primary btn-pill"
              style={{ width: '100%', padding: '0.85rem 1rem', marginTop: '0.75rem' }}
              disabled={loading}
            >
              <span>{loading ? 'Registering...' : 'Complete Registration'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.92rem', color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" style={{ fontWeight: 700, color: 'var(--brand-green)' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
