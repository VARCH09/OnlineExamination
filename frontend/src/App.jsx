// src/App.jsx – Root router
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Layout        from './components/Layout';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Dashboard     from './pages/Dashboard';
import Students      from './pages/Students';
import Subjects      from './pages/Subjects';
import Questions     from './pages/Questions';
import Exams         from './pages/Exams';
import ExamDetail    from './pages/ExamDetail';
import AvailableExams from './pages/AvailableExams';
import TakeExam      from './pages/TakeExam';
import MyResults     from './pages/MyResults';
import ResultDetail  from './pages/ResultDetail';
import Reports       from './pages/Reports';
import Attempts      from './pages/Attempts';

// Guard: redirect if not logged in
function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"    element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      {/* Protected routes inside the main layout */}
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Admin-only */}
        <Route path="students"  element={<PrivateRoute role="admin"><Students /></PrivateRoute>} />
        <Route path="subjects"  element={<PrivateRoute role="admin"><Subjects /></PrivateRoute>} />
        <Route path="questions" element={<PrivateRoute role="admin"><Questions /></PrivateRoute>} />
        <Route path="exams"     element={<PrivateRoute role="admin"><Exams /></PrivateRoute>} />
        <Route path="exams/:id" element={<PrivateRoute role="admin"><ExamDetail /></PrivateRoute>} />
        <Route path="attempts"  element={<PrivateRoute role="admin"><Attempts /></PrivateRoute>} />
        <Route path="reports"   element={<PrivateRoute role="admin"><Reports /></PrivateRoute>} />

        {/* Student-only */}
        <Route path="available-exams" element={<PrivateRoute role="student"><AvailableExams /></PrivateRoute>} />
        <Route path="take-exam/:id"   element={<PrivateRoute role="student"><TakeExam /></PrivateRoute>} />
        <Route path="my-results"      element={<PrivateRoute role="student"><MyResults /></PrivateRoute>} />
        <Route path="result/:id"      element={<PrivateRoute role="student"><ResultDetail /></PrivateRoute>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
