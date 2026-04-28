import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentComplaints from './pages/student/Complaints';
import StudentFees from './pages/student/Fees';
import StudentRoom from './pages/student/Room';
import StudentProfile from './pages/student/Profile';
import StudentMess from './pages/student/Mess';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminComplaints from './pages/admin/Complaints';
import AdminRooms from './pages/admin/Rooms';
import AdminFees from './pages/admin/Fees';
import AdminMess from './pages/admin/Mess';

const ProtectedRoute = ({ children, role }) => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!currentUser) return <Navigate to="/login" />;
  if (role && userData?.role !== role) return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Student Routes */}
          <Route path="/student/*" element={
            <ProtectedRoute role="student">
              <StudentLayout>
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="complaints" element={<StudentComplaints />} />
                  <Route path="fees" element={<StudentFees />} />
                  <Route path="room" element={<StudentRoom />} />
                  <Route path="profile" element={<StudentProfile />} />
                  <Route path="mess" element={<StudentMess />} />
                  <Route path="*" element={<Navigate to="dashboard" />} />
                </Routes>
              </StudentLayout>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="students" element={<AdminStudents />} />
                  <Route path="complaints" element={<AdminComplaints />} />
                  <Route path="rooms" element={<AdminRooms />} />
                  <Route path="fees" element={<AdminFees />} />
                  <Route path="mess" element={<AdminMess />} />
                  <Route path="*" element={<Navigate to="dashboard" />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />

          {/* Default Redirect */}
          <Route path="/" element={<HomeRedirect />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

const HomeRedirect = () => {
  const { currentUser, userData } = useAuth();
  if (!currentUser) return <Navigate to="/login" />;
  return userData?.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/student" />;
};

export default App;
