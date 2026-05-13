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
import StudentLaundry from './pages/student/Laundry';
import StudentHousekeeping from './pages/student/Housekeeping';
import StudentLeave from './pages/student/Leave';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminComplaints from './pages/admin/Complaints';
import AdminRooms from './pages/admin/Rooms';
import AdminFees from './pages/admin/Fees';
import AdminMess from './pages/admin/Mess';
import AdminNotices from './pages/admin/Notices';
import AdminHousekeeping from './pages/admin/Housekeeping';
import AdminAttendance from './pages/admin/Attendance';
import AdminLeave from './pages/admin/Leave';

const ProtectedRoute = ({ children, role }) => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // Check if user is authenticated via token
  if (!currentUser) return <Navigate to="/login" />;

  // Check role-based access
  if (role && userData?.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  // If user is already logged in, redirect to appropriate dashboard
  if (currentUser) {
    if (userData?.role === 'admin') {
      return <Navigate to="/admin" />;
    } else if (userData?.role === 'student') {
      return <Navigate to="/student" />;
    }
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } />

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
                  <Route path="laundry" element={<StudentLaundry />} />
                  <Route path="housekeeping" element={<StudentHousekeeping />} />
                  <Route path="leave" element={<StudentLeave />} />
                  <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
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
                  <Route path="notices" element={<AdminNotices />} />
                  <Route path="housekeeping" element={<AdminHousekeeping />} />
                  <Route path="attendance" element={<AdminAttendance />} />
                  <Route path="leave" element={<AdminLeave />} />
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
