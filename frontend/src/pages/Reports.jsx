// src/pages/Reports.jsx – Executive Academic Analytics & Reports
import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  BarChart3,
  CheckCircle2,
  Trophy,
  TrendingUp,
  BookOpen,
  ClipboardList,
  Sparkles
} from 'lucide-react';

const TABS = [
  { key: 'exam-summary',           label: 'Exam Performance Summary', icon: BarChart3 },
  { key: 'pass-fail',              label: 'Pass / Fail Distribution',  icon: CheckCircle2 },
  { key: 'top-scorers',            label: 'Top Performing Students',   icon: Trophy },
  { key: 'above-average',          label: 'Above Average Candidates',  icon: TrendingUp },
  { key: 'subject-question-count', label: 'Subject Question Bank Stats', icon: BookOpen },
  { key: 'student-results',        label: 'Master Submission Ledger',  icon: ClipboardList },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('exam-summary');
  const [data,      setData]      = useState({});
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    if (data[activeTab]) return; // cached
    setLoading(true);
    api.get(`/reports/${activeTab}`)
      .then(({ data: d }) => setData(prev => ({ ...prev, [activeTab]: d.data || [] })))
      .catch(() => toast.error('Failed to load analytical report.'))
      .finally(() => setLoading(false));
  }, [activeTab, data]);

  const rows = data[activeTab] || [];

  const renderTable = () => {
    if (loading) {
      return (
        <div className="loading-center">
          <div className="spinner" />
          <p>Compiling analytical metrics...</p>
        </div>
      );
    }

    if (rows.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-state-icon">
            <BarChart3 size={30} />
          </div>
          <h3>No records logged for this metric</h3>
          <p>Conduct mock tests with student submissions to populate this report.</p>
        </div>
      );
    }

    const keys = Object.keys(rows[0]);

    return (
      <div className="table-wrap" style={{ border: 'none' }}>
        <table>
          <thead>
            <tr>
              {keys.map(k => (
                <th key={k}>{k.replace(/_/g, ' ').toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {keys.map(k => {
                  const val = row[k];
                  const isStatus = k === 'result_status' || k === 'status' || k === 'exam_status';

                  return (
                    <td key={k}>
                      {isStatus ? (
                        <span
                          className={`badge ${
                            val === 'pass' || val === 'active'
                              ? 'badge-success'
                              : val === 'fail'
                              ? 'badge-danger'
                              : 'badge-info'
                          }`}
                        >
                          {val ? String(val).toUpperCase() : '—'}
                        </span>
                      ) : k.includes('percentage') || k === 'percentage' ? (
                        <span style={{ fontWeight: 800, color: 'var(--brand-green)' }}>
                          {val}%
                        </span>
                      ) : k.includes('date') || k.includes('_at') ? (
                        <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                          {val ? new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </span>
                      ) : (
                        <span style={{ fontWeight: k.includes('title') || k.includes('name') ? 700 : 500 }}>
                          {val !== null && val !== undefined ? val.toString() : '—'}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          Assessment Reports & Analytics 📈
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          High-level institutional insights, candidate distributions, and subject test views.
        </p>
      </div>

      {/* Modern Filter Tabs Bar */}
      <div className="card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
                style={{ borderRadius: 'var(--radius-full)', fontWeight: 700 }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {TABS.find(t => t.key === activeTab)?.label}
          </h3>
          <span className="badge badge-purple">
            Live Database View
          </span>
        </div>
        {renderTable()}
      </div>
    </div>
  );
}
