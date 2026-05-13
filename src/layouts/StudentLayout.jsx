import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { realtimeDB } from '../services/firebase';
import { ref, onValue } from 'firebase/database';
import { 
  LayoutDashboard, 
  MessageSquare, 
  CreditCard, 
  Home, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  ChevronDown,
  UtensilsCrossed,
  Shirt,
  Sparkles,
  Plane
} from 'lucide-react';
import './Layout.css';

const StudentLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notices, setNotices] = useState([]);
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

  useEffect(() => {
    const loadNotices = () => {
      const noticesRef = ref(realtimeDB, 'notices');
      return onValue(noticesRef, (snapshot) => {
        const noticesData = snapshot.val();
        const noticesArray = noticesData ? Object.entries(noticesData).map(([id, notice]) => ({ id, ...notice })) : [];

        const filtered = noticesArray
          .filter((notice) => !notice.targetStudentId || notice.targetStudentId === userData?.uid)
          .sort((a, b) => (new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));

        setNotices(filtered);
      });
    };

    const unsubscribe = loadNotices();

    const handleOpenNotifications = () => setShowNotifications(true);
    window.addEventListener('student-open-notifications', handleOpenNotifications);

    return () => {
      unsubscribe();
      window.removeEventListener('student-open-notifications', handleOpenNotifications);
    };
  }, [userData?.uid]);

  const formatNoticeDate = (createdAt) => {
    const noticeDate = new Date(createdAt || Date.now());
    return noticeDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const menuItems = [
    { path: '/student/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/student/room', icon: <Home size={20} />, label: 'Room' },
    { path: '/student/fees', icon: <CreditCard size={20} />, label: 'Fees' },
    { path: '/student/complaints', icon: <MessageSquare size={20} />, label: 'Complaints' },
    { path: '/student/mess', icon: <UtensilsCrossed size={20} />, label: 'Mess' },
    { path: '/student/laundry', icon: <Shirt size={20} />, label: 'Laundry' },
    { path: '/student/housekeeping', icon: <Sparkles size={20} />, label: 'Housekeeping' },
    { path: '/student/leave', icon: <Plane size={20} />, label: 'Hostel Leave' },
    { path: '/student/profile', icon: <User size={20} />, label: 'Profile' },
  ];

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">H</div>
            <span>Hostelify</span>
          </div>
          <button className="mobile-close" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
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
            <button className="icon-btn" onClick={() => setShowNotifications(true)}>
              <Bell size={20} />
              {notices.length > 0 && <span className="badge"></span>}
            </button>
            
            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">{userData?.name || 'Student'}</span>
                <span className="user-role">Student</span>
              </div>
              <div className="avatar">
                {userData?.name?.charAt(0) || 'S'}
              </div>
              <ChevronDown size={16} />
            </div>
          </div>
        </header>

        <section className="content-area">
          {children}
        </section>

        {showNotifications && (
          <div className="notification-overlay" onClick={() => setShowNotifications(false)}>
            <div className="notification-panel" onClick={(e) => e.stopPropagation()}>
              <div className="notification-panel-header">
                <div>
                  <h3>Notices & Events</h3>
                  <p>{notices.length} updates available</p>
                </div>
                <button className="close-btn" onClick={() => setShowNotifications(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="notification-list">
                {notices.length === 0 ? (
                  <div className="empty-notifications">No notices or events right now.</div>
                ) : (
                  notices.map((notice) => (
                    <div key={notice.id} className={`notification-item ${notice.category || 'general'}`}>
                      <div className="notification-date">
                        <span>{formatNoticeDate(notice.createdAt)}</span>
                      </div>
                      <div className="notification-content">
                        <h4>{notice.title}</h4>
                        <p>{notice.content}</p>
                      </div>
                      <span className="notification-tag">{notice.category || 'General'}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {showLogoutConfirm && (
          <div className="logout-modal-overlay" onClick={cancelLogout}>
            <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to logout? You'll need to log in again to access your account.</p>
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

export default StudentLayout;
