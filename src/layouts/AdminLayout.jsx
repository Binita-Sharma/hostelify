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
  Search,
  ChevronDown,
  UtensilsCrossed,
  Megaphone
} from 'lucide-react';
import './Layout.css';

const AdminLayout = ({ children }) => {
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
    { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/students', icon: <Users size={20} />, label: 'Students' },
    { path: '/admin/rooms', icon: <DoorOpen size={20} />, label: 'Rooms' },
    { path: '/admin/fees', icon: <CreditCard size={20} />, label: 'Fees' },
    { path: '/admin/complaints', icon: <MessageSquare size={20} />, label: 'Complaints' },
    { path: '/admin/mess', icon: <UtensilsCrossed size={20} />, label: 'Mess' },
    { path: '/admin/notices', icon: <Megaphone size={20} />, label: 'Notices' },
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
              <input type="text" placeholder="Admin Search..." />
            </div>
          </div>

          <div className="topbar-right">
            <button className="icon-btn">
              <Bell size={20} />
              <span className="badge"></span>
            </button>
            
            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">{userData?.name || 'Admin'}</span>
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
      </main>
    </div>
  );
};

export default AdminLayout;
