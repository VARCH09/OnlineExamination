// src/components/Layout.jsx – Unacademy-Inspired Layout
import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  HelpCircle,
  FileText,
  ClipboardList,
  BarChart3,
  GraduationCap,
  LogOut,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/dashboard',  label: 'Overview',      icon: LayoutDashboard, section: 'Core' },
    { to: '/students',   label: 'Students',      icon: Users,           section: 'Management' },
    { to: '/subjects',   label: 'Subjects',      icon: BookOpen,        section: 'Management' },
    { to: '/questions',  label: 'Question Bank', icon: HelpCircle,      section: 'Management' },
    { to: '/exams',      label: 'Exams & Tests', icon: FileText,        section: 'Testing' },
    { to: '/attempts',   label: 'Live Attempts', icon: ClipboardList,   section: 'Testing' },
    { to: '/reports',    label: 'Analytics',     icon: BarChart3,       section: 'Analytics' },
  ];

  const studentLinks = [
    { to: '/dashboard',       label: 'My Study Room', icon: LayoutDashboard, section: 'Learning' },
    { to: '/available-exams', label: 'Mock Tests',    icon: FileText,        section: 'Practice' },
    { to: '/my-results',      label: 'Scorecard',     icon: GraduationCap,   section: 'Performance' },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  // Group links by section
  const sections = Array.from(new Set(links.map(l => l.section)));

  // Generate User Initials
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const getPageTitle = () => {
    const active = links.find(l => l.to === location.pathname);
    if (active) return active.label;
    if (location.pathname.startsWith('/take-exam')) return 'Mock Test in Progress';
    if (location.pathname.startsWith('/result')) return 'Test Analysis & Result';
    if (location.pathname.startsWith('/exams/')) return 'Assign Questions';
    return 'Online Examination Portal';
  };

  return (
    <div className="layout">
      {/* Sidebar Overlay for Mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(12, 20, 33, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 90
          }}
        />
      )}

      {/* Modern EdTech Sidebar */}
      <aside className="sidebar" style={{ display: mobileOpen ? 'flex' : undefined, position: mobileOpen ? 'fixed' : undefined, top: 0, bottom: 0, left: 0 }}>
        {/* Brand Header */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="sidebar-logo-text">SkillQuest</div>
            <div className="sidebar-logo-sub">Online Examination</div>
          </div>
        </div>

        {/* Navigation grouped by section */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
          {sections.map(section => (
            <div key={section}>
              <div className="sidebar-nav-section">{section}</div>
              <ul className="sidebar-nav">
                {links.filter(l => l.section === section).map(l => {
                  const Icon = l.icon;
                  return (
                    <li key={l.to}>
                      <NavLink
                        to={l.to}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) => isActive ? 'active' : ''}
                      >
                        <Icon size={18} />
                        <span style={{ flex: 1 }}>{l.label}</span>
                        <ChevronRight size={14} style={{ opacity: 0.4 }} />
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* User Profile & Logout */}
        <div className="sidebar-footer">
          <div className="user-profile-badge">
            <div className={`user-avatar-circle ${isAdmin ? 'user-avatar-admin' : ''}`}>
              {initials}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.74rem', color: 'var(--brand-green-light)', fontWeight: 600 }}>
                {isAdmin ? <ShieldCheck size={12} /> : <GraduationCap size={12} />}
                {isAdmin ? 'Administrator' : 'Student Learner'}
              </div>
            </div>
          </div>
          <button
            className="btn btn-outline btn-sm"
            style={{ width: '100%', borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#FFFFFF' }}
            onClick={handleLogout}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', padding: '0.4rem', border: 'none', background: 'transparent' }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="topbar-title">{getPageTitle()}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div className="topbar-live-badge">
              <span className="topbar-live-dot" />
              <span>CBT Platform Active</span>
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </header>

        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
