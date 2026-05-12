import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db, realtimeDB } from '../../services/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { 
  Home, 
  CreditCard, 
  MessageSquare, 
  Bell, 
  ArrowRight,
  Clock,
  ChevronRight,
  Mail,
  Phone,
  BookOpen,
  Shirt,
  Brush,
  HeartPulse,
  Sparkles
} from 'lucide-react';
import './Dashboard.css';

const authoritiesData = [
  {
    title: 'HEAD WARDEN',
    name: 'Dr. Ramesh Kumar',
    designation: 'Chief Warden',
    department: 'Hostel Administration',
    email: 'NA',
    phone: '9876543210',
    image: 'https://randomuser.me/api/portraits/men/45.jpg',
    queryText: 'In case of any query/issue related to "Hostel Rules",',
    hasClickHere: true
  },
  {
    title: 'SUB WARDEN',
    name: 'Mr. Arvind Sharma',
    designation: 'Assistant Warden',
    department: 'Hostel Administration',
    email: 'NA',
    phone: '9876543211',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    queryText: '',
    hasClickHere: false
  },
  {
    title: 'ASSISTANT WARDEN',
    name: 'Ms. Priya Singh',
    designation: 'Assistant Warden',
    department: 'Hostel Administration',
    email: 'NA',
    phone: '9876543212',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    queryText: '',
    hasClickHere: false
  },
  {
    title: 'MESS MANAGER',
    name: 'Mr. Vikram Verma',
    designation: 'Chief Catering Officer',
    department: 'Food & Beverage',
    email: 'NA',
    phone: '9876543213',
    image: 'https://randomuser.me/api/portraits/men/65.jpg',
    queryText: '',
    hasClickHere: false
  }
];

const Dashboard = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    room: 'Not Assigned',
    roomDetail: 'Contact Admin',
    feesPending: 0,
    activeComplaints: 0,
    activeNotices: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [recentNotices, setRecentNotices] = useState([]);

  useEffect(() => {
    if (!userData?.name) return;

    // 1. Room Assignment
    const roomsRef = ref(realtimeDB, 'rooms');
    const unsubscribeRoom = onValue(roomsRef, (snapshot) => {
      let foundRoom = null;
      if (snapshot.exists()) {
        const rooms = snapshot.val();
        for (const key in rooms) {
          const room = rooms[key];
          if (room.students && room.students.includes(userData.name)) {
            foundRoom = room;
            break;
          }
        }
      }
      
      if (foundRoom) {
        setStats(prev => ({ 
          ...prev, 
          room: `Room ${foundRoom.number}`,
          roomDetail: `${foundRoom.type} • Block ${foundRoom.block}`
        }));
      } else {
        setStats(prev => ({ 
          ...prev, 
          room: 'Not Assigned',
          roomDetail: 'Contact Admin'
        }));
      }
    });

    // 2. Fees Pending
    const feesRef = ref(realtimeDB, 'fees');
    const unsubscribeFees = onValue(feesRef, (snapshot) => {
      let total = 0;
      if (snapshot.exists()) {
        const fees = snapshot.val();
        for (const key in fees) {
          const fee = fees[key];
          if (fee.student === userData.name && fee.status === 'pending') {
            total += Number(fee.amount) || 0;
          }
        }
      }
      setStats(prev => ({ ...prev, feesPending: total }));
    });

    // 3. Active Complaints
    const complaintsRef = ref(realtimeDB, 'complaints');
    const unsubscribeComplaints = onValue(complaintsRef, (snapshot) => {
      let active = 0;
      let data = [];
      if (snapshot.exists()) {
        const complaints = snapshot.val();
        for (const key in complaints) {
          const c = { id: key, ...complaints[key] };
          if (c.studentName === userData.name) {
            data.push(c);
            if (c.status !== 'Resolved') {
              active++;
            }
          }
        }
      }
      data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setStats(prev => ({ ...prev, activeComplaints: active }));
      setRecentComplaints(data.slice(0, 3));
    });

    // 4. Notices
    const noticesRef = ref(realtimeDB, 'notices');
    const unsubscribeNotices = onValue(noticesRef, (snapshot) => {
      let data = [];
      if (snapshot.exists()) {
        const notices = snapshot.val();
        for (const key in notices) {
          const n = notices[key];
          // Filter: Show global notices OR notices targeted at this specific student
          if (!n.targetStudentId || n.targetStudentId === userData.uid) {
            data.push({ id: key, ...n });
          }
        }
      }
      data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setStats(prev => ({ ...prev, activeNotices: data.length }));
      setRecentNotices(data.slice(0, 3));
    });

    return () => {
      unsubscribeRoom();
      unsubscribeFees();
      unsubscribeComplaints();
      unsubscribeNotices();
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
            <h3 className="stat-value">{stats.activeNotices}</h3>
            <span className="stat-detail">{stats.activeNotices > 0 ? 'New updates' : 'No new notices'}</span>
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
            <h2>Notices & Events</h2>
            <button className="view-all">View All <ArrowRight size={16} /></button>
          </div>
          <div className="notices-list">
            {recentNotices.length === 0 ? (
              <p className="empty-msg">No announcements at the moment.</p>
            ) : (
              recentNotices.map(notice => {
                const noticeDate = new Date(notice.createdAt || Date.now());
                const day = noticeDate.getDate().toString().padStart(2, '0');
                const month = noticeDate.toLocaleString('default', { month: 'short' }).toUpperCase();
                
                return (
                  <div key={notice.id} className={`notice-card ${notice.category}`}>
                    <div className="notice-date">
                      <span className="day">{day}</span>
                      <span className="month">{month}</span>
                    </div>
                    <div className="notice-content">
                      <h4>{notice.title}</h4>
                      <p>{notice.content.length > 50 ? notice.content.substring(0, 50) + '...' : notice.content}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="dashboard-section hostel-facilities">
          <div className="section-header">
            <h2>Hostel Facilities</h2>
            <Sparkles size={18} className="icon-sparkle" />
          </div>
          <div className="facilities-grid">
            <div className="facility-card laundry" onClick={() => navigate('/student/laundry')}>
              <div className="facility-icon"><Shirt size={20} /></div>
              <div className="facility-info">
                <h4>Laundary</h4>
                <p>Clean clothes, daily</p>
              </div>
              <ChevronRight size={16} />
            </div>
            
            <div className="facility-card housekeeping">
              <div className="facility-icon"><Brush size={20} /></div>
              <div className="facility-info">
                <h4>Housekeeping</h4>
                <p>Request room cleaning</p>
              </div>
              <ChevronRight size={16} />
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

      <section className="authorities-section">
        <h2 className="section-title">Authorities & Contacts</h2>
        <div className="authorities-grid">
          {authoritiesData.map((auth, index) => (
            <div className="authority-card" key={index}>
              <div className="auth-avatar-container">
                <img src={auth.image} alt={auth.name} className="auth-avatar" />
              </div>
              
              <div className="auth-title-bar">
                <BookOpen size={14} className="auth-title-icon" />
                <span>{auth.title}</span>
              </div>
              
              <div className="auth-details">
                <h4 className="auth-name">{auth.name}</h4>
                <p className="auth-designation">{auth.designation}</p>
                <p className="auth-department">{auth.department}</p>
                
                <div className="auth-contact-info">
                  <div className="contact-item">
                    <Mail size={12} />
                    <span>{auth.email}</span>
                  </div>
                  <div className="contact-item">
                    <Phone size={12} />
                    <span>{auth.phone}</span>
                  </div>
                </div>
                
                <button className="book-appointment-btn">Book Appointment</button>
                
                {auth.hasClickHere && (
                  <div className="auth-query-box">
                    <p>{auth.queryText}</p>
                    <button className="click-here-btn">Click Here</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
