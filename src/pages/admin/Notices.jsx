import React, { useState, useEffect } from 'react';
import { realtimeDB } from '../../services/firebase';
import { ref, onValue, set, remove } from 'firebase/database';
import { 
  Plus, 
  Trash2, 
  Megaphone, 
  X, 
  Calendar, 
  Search, 
  Filter, 
  AlertCircle, 
  Info, 
  PartyPopper,
  Clock,
  MoreVertical
} from 'lucide-react';
import './Notices.css';

const AdminNotices = () => {
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    category: 'general'
  });

  useEffect(() => {
    const noticesRef = ref(realtimeDB, 'notices');
    const unsubscribeNotices = onValue(noticesRef, (snapshot) => {
      const data = snapshot.val();
      const noticesList = data ? Object.entries(data)
        .map(([id, notice]) => ({ id, ...notice }))
        .filter(notice => !notice.isAttendanceNotice) // Hide automated attendance notices from Admin Board
        : [];
      
      noticesList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setNotices(noticesList);
      setFilteredNotices(noticesList);
    }, (error) => {
      console.error("Realtime Database error:", error);
    });

    return () => { unsubscribeNotices(); };
  }, []);

  useEffect(() => {
    let results = notices;
    if (filterCategory !== 'all') {
      results = results.filter(n => n.category === filterCategory);
    }
    if (searchTerm) {
      results = results.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        n.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredNotices(results);
  }, [searchTerm, filterCategory, notices]);

  const handleAddNotice = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const noticeId = 'notice_' + Date.now();
      await set(ref(realtimeDB, 'notices/' + noticeId), {
        ...newNotice,
        createdAt: Date.now(),
        dateStr: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
      });
      setShowAddModal(false);
      setNewNotice({ title: '', content: '', category: 'general' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotice = async (id) => {
    if(window.confirm("Are you sure you want to delete this notice? This action cannot be undone.")) {
      await remove(ref(realtimeDB, 'notices/' + id));
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'urgent': return <AlertCircle size={20} />;
      case 'event': return <PartyPopper size={20} />;
      default: return <Info size={20} />;
    }
  };

  const stats = {
    total: notices.length,
    urgent: notices.filter(n => n.category === 'urgent').length,
    events: notices.filter(n => n.category === 'event').length
  };

  return (
    <div className="admin-notices-container animate-fade-in">
      <header className="notices-header">
        <div className="header-left">
          <div className="title-section">
            <Megaphone className="header-icon" />
            <div>
              <h1>Notices Board</h1>
              <p>Create and manage official announcements for students</p>
            </div>
          </div>
        </div>
        <button className="create-notice-btn" onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          <span>New Notice</span>
        </button>
      </header>

      <div className="notices-stats-bar">
        <div className="stat-item">
          <span className="stat-label">Total Notices</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-item urgent">
          <span className="stat-label">Urgent</span>
          <span className="stat-value">{stats.urgent}</span>
        </div>
        <div className="stat-item event">
          <span className="stat-label">Active Events</span>
          <span className="stat-value">{stats.events}</span>
        </div>
      </div>

      <div className="notices-toolbar">
        <div className="search-wrapper">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search notices by title or content..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-wrapper">
          <Filter size={18} />
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="urgent">Urgent</option>
            <option value="event">Events</option>
          </select>
        </div>
      </div>

      <div className="notices-display-grid">
        {filteredNotices.length === 0 ? (
          <div className="no-notices-state">
            <div className="empty-icon-wrapper">
              <Megaphone size={40} />
            </div>
            <h3>No Notices Found</h3>
            <p>{searchTerm || filterCategory !== 'all' ? "No matches found for your current filters." : "Start by creating your first official announcement."}</p>
            {(searchTerm || filterCategory !== 'all') && (
              <button className="reset-filter-btn" onClick={() => {setSearchTerm(''); setFilterCategory('all');}}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          filteredNotices.map(notice => (
            <div key={notice.id} className={`premium-notice-card ${notice.category}`}>
              <div className="card-top-accent"></div>
              <div className="card-main-content">
                <div className="card-header-row">
                  <div className={`category-tag ${notice.category}`}>
                    {getCategoryIcon(notice.category)}
                    <span>{notice.category}</span>
                  </div>
                  <div className="card-actions">
                    <button className="icon-action-btn delete" onClick={() => deleteNotice(notice.id)} title="Delete Notice">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="notice-title">{notice.title}</h3>
                
                <div className="notice-timestamp">
                  <Clock size={14} />
                  <span>{notice.dateStr}</span>
                </div>

                <div className="notice-body">
                  <p>{notice.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modern Notice Modal */}
      {showAddModal && (
        <div className="premium-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="premium-modal-box animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <div className="modal-title">
                <div className="modal-icon">
                  <Megaphone size={20} />
                </div>
                <div>
                  <h2>Create Announcement</h2>
                  <p>Broadcast information to all students</p>
                </div>
              </div>
              <button className="modal-close-x" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddNotice} className="modern-form">
              <div className="input-group">
                <label>Notice Title</label>
                <input 
                  type="text" 
                  value={newNotice.title} 
                  onChange={e => setNewNotice({...newNotice, title: e.target.value})}
                  placeholder="Enter a descriptive title"
                  required
                />
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label>Category</label>
                  <select value={newNotice.category} onChange={e => setNewNotice({...newNotice, category: e.target.value})}>
                    <option value="general">General Information</option>
                    <option value="urgent">Urgent / Important</option>
                    <option value="event">Campus Event</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Content Description</label>
                <textarea 
                  value={newNotice.content} 
                  onChange={e => setNewNotice({...newNotice, content: e.target.value})}
                  placeholder="Details of the notice..."
                  rows={5}
                  required
                ></textarea>
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-modal-btn" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="publish-notice-btn" disabled={loading}>
                  {loading ? 'Publishing...' : 'Broadcast Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotices;
