import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { 
  Home, 
  CreditCard, 
  MessageSquare, 
  Bell, 
  ArrowRight,
  Clock,
  ChevronRight
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { userData } = useAuth();
  const [stats, setStats] = useState({
    room: 'Not Assigned',
    roomDetail: 'Contact Admin',
    feesPending: 0,
    activeComplaints: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState([]);

  useEffect(() => {
    if (!userData?.name) return;

    // 1. Room Assignment
    const unsubscribeRoom = onSnapshot(
      query(collection(db, 'rooms'), where('students', 'array-contains', userData.name)),
      (snap) => {
        if (!snap.empty) {
          const room = snap.docs[0].data();
          setStats(prev => ({ 
            ...prev, 
            room: `Room ${room.number}`,
            roomDetail: `${room.type} • Block ${room.block}`
          }));
        }
      }
    );

    // 2. Fees Pending
    const unsubscribeFees = onSnapshot(
      query(collection(db, 'fees'), where('student', '==', userData.name), where('status', '==', 'pending')),
      (snap) => {
        const total = snap.docs.reduce((sum, d) => sum + (Number(d.data().amount) || 0), 0);
        setStats(prev => ({ ...prev, feesPending: total }));
      }
    );

    // 3. Active Complaints
    const unsubscribeComplaints = onSnapshot(
      query(collection(db, 'complaints'), where('studentName', '==', userData.name), orderBy('createdAt', 'desc')),
      (snap) => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const active = data.filter(c => c.status !== 'Resolved').length;
        setStats(prev => ({ ...prev, activeComplaints: active }));
        setRecentComplaints(data.slice(0, 3));
      }
    );

    return () => {
      unsubscribeRoom();
      unsubscribeFees();
      unsubscribeComplaints();
    };
  }, [userData]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header animate-fade-in">
        <div className="welcome-text">
          <h1>{getTimeGreeting()}, {userData?.name?.split(' ')[0] || 'Student'}</h1>
          <p>Welcome back to your hostel portal. Here's what's happening today.</p>
        </div>
        <div className="header-date">
          <Clock size={18} />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon"><Home size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">My Room</span>
            <h3 className="stat-value">{stats.room}</h3>
            <span className="stat-detail">{stats.roomDetail}</span>
          </div>
          <div className="stat-trend"><ChevronRight size={20} /></div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon"><CreditCard size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Fees Pending</span>
            <h3 className="stat-value">₹{stats.feesPending.toLocaleString()}</h3>
            <span className="stat-detail">{stats.feesPending > 0 ? 'Action required' : 'All clear'}</span>
          </div>
          <div className="stat-trend"><ChevronRight size={20} /></div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon"><MessageSquare size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Active Complaints</span>
            <h3 className="stat-value">{stats.activeComplaints}</h3>
            <span className="stat-detail">{stats.activeComplaints > 0 ? 'Being processed' : 'No issues'}</span>
          </div>
          <div className="stat-trend"><ChevronRight size={20} /></div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon"><Bell size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Announcements</span>
            <h3 className="stat-value">0</h3>
            <span className="stat-detail">No new notices</span>
          </div>
          <div className="stat-trend"><ChevronRight size={20} /></div>
        </div>
      </div>

      <div className="dashboard-main-grid">
        <section className="dashboard-section complaints-preview">
          <div className="section-header">
            <h2>Recent Complaints</h2>
            <button className="view-all">View All <ArrowRight size={16} /></button>
          </div>
          <div className="preview-list">
            {recentComplaints.length === 0 ? (
              <p className="empty-msg">No recent complaints.</p>
            ) : (
              recentComplaints.map(complaint => (
                <div key={complaint.id} className="preview-item">
                  <div className={`item-status ${complaint.status?.toLowerCase().replace(' ', '-')}`}></div>
                  <div className="item-content">
                    <h4>{complaint.title}</h4>
                    <p>{complaint.category} • {complaint.status}</p>
                  </div>
                  <span className="badge-pill">{complaint.status}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="dashboard-section notices-preview">
          <div className="section-header">
            <h2>Upcoming Events</h2>
            <button className="view-all">View All <ArrowRight size={16} /></button>
          </div>
          <div className="notices-list">
            <div className="notice-card">
              <div className="notice-date">
                <span className="day">01</span>
                <span className="month">MAY</span>
              </div>
              <div className="notice-content">
                <h4>Mess Menu Update</h4>
                <p>New menu will be effective from tomorrow...</p>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-section ai-assistant-cta">
          <div className="ai-cta-content">
            <div className="ai-icon">AI</div>
            <h3>Need Help?</h3>
            <p>Our intelligent assistant is here to help you with complaints, fees, and more.</p>
            <button className="ai-btn">Chat with Assistant</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
