import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Search,
  ChevronDown,
  UtensilsCrossed,
  Shirt,
  Sparkles,
  Plane
} from 'lucide-react';
import AIChatbot from '../components/student/AIChatbot';
import './Layout.css';

const StudentLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { userData, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to log out', err);
    }
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
            <div className="search-bar">
              <Search size={18} />
              <input type="text" placeholder="Search anything..." />
            </div>
          </div>

          <div className="topbar-right">
            <button className="icon-btn">
              <Bell size={20} />
              <span className="badge"></span>
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
        <AIChatbot />
      </main>
    </div>
  );
};

export default StudentLayout;
