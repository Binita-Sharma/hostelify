import React, { useState, useEffect } from 'react';
import { realtimeDB } from '../../services/firebase';
import { ref, onValue, update } from 'firebase/database';
import {
  Search, Filter, CheckCircle2, Clock, AlertTriangle, User, Home,
  ChevronRight, BrainCircuit, MessageSquare, Wrench, Calendar, Inbox
} from 'lucide-react';
import './Complaints.css';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    const complaintsRef = ref(realtimeDB, 'complaints');
    const unsubscribe = onValue(complaintsRef, (snapshot) => {
      const complaints = snapshot.val();
      const data = complaints ? Object.entries(complaints)
        .map(([id, complaint]) => ({
          id,
          ...complaint
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
      setComplaints(data);

      // Auto-select first complaint if none selected
      if (data.length > 0 && !selectedComplaint) {
        setSelectedComplaint(data[0]);
      } else if (selectedComplaint) {
        // Update selected complaint if data changes
        const updatedSelected = data.find(c => c.id === selectedComplaint.id);
        if (updatedSelected) setSelectedComplaint(updatedSelected);
      }
    }, (error) => {
      console.error("Realtime Database error:", error);
      setComplaints([]);
    });
    return () => unsubscribe();
  }, [selectedComplaint]);

  const getStats = () => {
    const stats = { Pending: 0, 'In Progress': 0, Resolved: 0 };
    complaints.forEach(c => {
      if (stats[c.status] !== undefined) stats[c.status]++;
      else if (c.status === 'Accepted' || c.status === 'Under Review') stats['In Progress']++;
    });
    return stats;
  };

  const updateStatus = async (id, newStatus) => {
    setLoading(true);
    try {
      const updates = selectedComplaint?.updates || [];
      await update(ref(realtimeDB, 'complaints/' + id), {
        status: newStatus,
        updates: [...updates, {
          status: newStatus,
          message: `Status updated to ${newStatus} by Admin`,
          time: new Date().toISOString()
        }]
      });
      // The onValue listener will automatically update the UI
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.includes(searchTerm);
    const matchesFilter = filterStatus === 'All' || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = getStats();

  return (
    <div className="admin-complaints-v3 animate-fade-in">
      <header className="page-header">
        <div className="header-text">
          <span className="subtitle">OPERATIONS</span>
          <h1>Helpdesk</h1>
        </div>
        <div className="header-stats">
          <div className="stat-pill pending">
            <span className="dot"></span> {stats.Pending} Pending
          </div>
          <div className="stat-pill active">
            <span className="dot"></span> {stats['In Progress']} Active
          </div>
          <div className="stat-pill resolved">
            <span className="dot"></span> {stats.Resolved} Resolved
          </div>
        </div>
      </header>

      <div className="complaints-workspace">
        {/* LEFT PANE: List */}
        <div className="workspace-sidebar">
          <div className="sidebar-header-box">
            <div className="search-bar">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-scroll">
              {['All', 'Pending', 'In Progress', 'Resolved'].map(status => (
                <button
                  key={status}
                  className={`filter-chip ${filterStatus === status ? 'active' : ''}`}
                  onClick={() => setFilterStatus(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="ticket-list">
            {filteredComplaints.length === 0 ? (
              <div className="empty-state-mini">No tickets found.</div>
            ) : (
              filteredComplaints.map(item => (
                <div
                  key={item.id}
                  className={`ticket-card ${selectedComplaint?.id === item.id ? 'selected' : ''}`}
                  onClick={() => setSelectedComplaint(item)}
                >
                  <div className="ticket-card-header">
                    <span className="ticket-id">#{item.id.slice(0, 6)}</span>
                    <span className={`status-dot ${item.status.toLowerCase().replace(' ', '-')}`}></span>
                  </div>
                  <h4 className="ticket-title">{item.title}</h4>
                  <div className="ticket-meta">
                    <span className="student-name"><User size={12} /> {item.studentName.split(' ')[0]}</span>
                    <span className="ticket-time"><Clock size={12} /> {new Date(item.createdAt).toLocaleDateString('en-GB')}</span>
                  </div>
                  <div className="ticket-tags">
                    <span className={`tag-prio ${item.priority?.toLowerCase()}`}>{item.priority}</span>
                    <span className="tag-cat">{item.category}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT PANE: Details */}
        <div className="workspace-main">
          {selectedComplaint ? (
            <div className="ticket-detail-view animate-fade-in">
              <div className="detail-header-bar">
                <div className="detail-title-group">
                  <div className="title-row">
                    <h2>{selectedComplaint.title}</h2>
                    <span className={`badge-status ${selectedComplaint.status.toLowerCase().replace(' ', '-')}`}>
                      {selectedComplaint.status}
                    </span>
                  </div>
                  <div className="subtitle-row">
                    <span>Ticket #{selectedComplaint.id}</span>
                    <span className="separator">•</span>
                    <span>Created {new Date(selectedComplaint.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="action-group">
                  <select
                    className="status-dropdown"
                    value={selectedComplaint.status}
                    onChange={(e) => updateStatus(selectedComplaint.id, e.target.value)}
                    disabled={loading}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div className="detail-content-scroll">
                <div className="info-cards-grid">
                  <div className="info-card">
                    <div className="card-icon"><User size={18} /></div>
                    <div className="card-data">
                      <label>Reported By</label>
                      <p>{selectedComplaint.studentName}</p>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="card-icon"><Home size={18} /></div>
                    <div className="card-data">
                      <label>Room</label>
                      <p>{selectedComplaint.roomNumber || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="card-icon"><AlertTriangle size={18} /></div>
                    <div className="card-data">
                      <label>Priority</label>
                      <p className={`prio-text ${selectedComplaint.priority?.toLowerCase()}`}>
                        {selectedComplaint.priority}
                      </p>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="card-icon"><Wrench size={18} /></div>
                    <div className="card-data">
                      <label>Category</label>
                      <p>{selectedComplaint.category}</p>
                    </div>
                  </div>
                </div>

                <div className="description-section">
                  <h3>Description</h3>
                  <div className="desc-box">
                    {selectedComplaint.description}
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="empty-workspace">
              <div className="empty-icon-wrap">
                <Inbox size={48} />
              </div>
              <h3>No Ticket Selected</h3>
              <p>Select a complaint from the list to view its details and take action.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminComplaints;
