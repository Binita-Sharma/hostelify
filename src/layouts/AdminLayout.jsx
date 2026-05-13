import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  CreditCard, 
  DoorOpen, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  ChevronDown,
  UtensilsCrossed,
  Megaphone,
  Sparkles,
  UserCheck,
  Plane
} from 'lucide-react';
import './Layout.css';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { userData, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to log out', err);
    }
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/students', icon: <Users size={20} />, label: 'Students' },
    { path: '/admin/rooms', icon: <DoorOpen size={20} />, label: 'Rooms' },
    { path: '/admin/fees', icon: <CreditCard size={20} />, label: 'Fees' },
    { path: '/admin/complaints', icon: <MessageSquare size={20} />, label: 'Complaints' },
    { path: '/admin/mess', icon: <UtensilsCrossed size={20} />, label: 'Mess' },
    { path: '/admin/notices', icon: <Megaphone size={20} />, label: 'Notices' },
    { type: 'section', label: 'Facilities' },
    { path: '/admin/housekeeping', icon: <Sparkles size={20} />, label: 'Housekeeping' },
    { path: '/admin/attendance', icon: <UserCheck size={20} />, label: 'Attendance' },
    { path: '/admin/leave', icon: <Plane size={20} />, label: 'Hostel Leave' },
  ];

  return (
    <div className="layout-container admin-theme">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon admin-icon">H</div>
            <span>Hostelify</span>
          </div>
          <button className="mobile-close" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            item.type === 'section' ? (
              <div key={`section-${index}`} className="sidebar-section-header">
                {item.label}
              </div>
            ) : (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            )
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-wrapper">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu size={24} />
            </button>
          </div>

          <div className="topbar-right">
            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">{userData?.name?.replace('Demo ', '') || 'Admin'}</span>
                <span className="user-role">Administrator</span>
              </div>
              <div className="avatar admin-avatar">
                {userData?.name?.charAt(0) || 'A'}
              </div>
              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        <section className="content-area">
          {children}
        </section>

        {showLogoutConfirm && (
          <div className="logout-modal-overlay" onClick={cancelLogout}>
            <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to logout? You'll need to log in again to access the admin dashboard.</p>
              <div className="logout-modal-actions">
                <button className="cancel-logout-btn" onClick={cancelLogout}>Cancel</button>
                <button className="confirm-logout-btn" onClick={confirmLogout}>Logout</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminLayout;
