import React, { useState, useEffect } from 'react';
import { realtimeDB } from '../../services/firebase';
import { ref, onValue, set, remove } from 'firebase/database';
import { Plus, Trash2, Megaphone, X, Calendar } from 'lucide-react';
import './Notices.css';

const AdminNotices = () => {
  const [notices, setNotices] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    category: 'general'
  });

  useEffect(() => {
    const noticesRef = ref(realtimeDB, 'notices');
    const unsubscribeNotices = onValue(noticesRef, (snapshot) => {
      const data = snapshot.val();
      const noticesList = data ? Object.entries(data).map(([id, notice]) => ({ id, ...notice })) : [];
      // Sort by date descending
      noticesList.sort((a, b) => b.createdAt - a.createdAt);
      setNotices(noticesList);
    }, (error) => {
      console.error("Realtime Database error:", error);
    });

    return () => { unsubscribeNotices(); };
  }, []);

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
    if(window.confirm("Are you sure you want to delete this notice?")) {
      await remove(ref(realtimeDB, 'notices/' + id));
    }
  };

  return (
    <div className="admin-notices animate-fade-in">
      <header className="page-header">
        <div className="header-text">
          <span className="subtitle">COMMUNICATION</span>
          <h1>Notices</h1>
        </div>
        <button className="add-btn" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          <span>Add Notice</span>
        </button>
      </header>

      <div className="notices-grid">
        {notices.length === 0 ? (
          <div className="empty-msg-full">No notices published yet. Click "Add Notice" to broadcast.</div>
        ) : (
          notices.map(notice => (
            <div key={notice.id} className={`notice-card ${notice.category}`}>
              <div className="notice-card-header">
                <div className="notice-title">
                  <Megaphone size={20} className="icon-main" />
                  <h3>{notice.title}</h3>
                </div>
                <button className="delete-btn" onClick={() => deleteNotice(notice.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="notice-meta">
                <Calendar size={14} />
                <span>{notice.dateStr}</span>
                <span className={`category-pill ${notice.category}`}>{notice.category}</span>
              </div>

              <div className="notice-content">
                <p>{notice.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Notice Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Notice</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleAddNotice} className="modal-form">
              <div className="form-group">
                <label>Title</label>
                <input 
                  type="text" 
                  value={newNotice.title} 
                  onChange={e => setNewNotice({...newNotice, title: e.target.value})}
                  placeholder="e.g. Mess Menu Change"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={newNotice.category} onChange={e => setNewNotice({...newNotice, category: e.target.value})}>
                  <option value="general">General</option>
                  <option value="urgent">Urgent</option>
                  <option value="event">Event</option>
                </select>
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea 
                  value={newNotice.content} 
                  onChange={e => setNewNotice({...newNotice, content: e.target.value})}
                  placeholder="Type notice details here..."
                  rows={4}
                  required
                ></textarea>
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Publishing...' : 'Publish Notice'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotices;
