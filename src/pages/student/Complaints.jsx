import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { realtimeDB } from '../../services/firebase';
import { 
  ref, 
  set, 
  onValue
} from 'firebase/database';
import { 
  Plus, 
  MessageSquare, 
  Clock, 
  Filter,
  Image as ImageIcon,
  ChevronRight,
  X
} from 'lucide-react';
import './Complaints.css';

const Complaints = () => {
  const { userData } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    category: 'Water',
    description: '',
    priority: 'High'
  });

  const categoryPriorityMap = {
    // High Priority
    'Water': 'High',
    'Electricity': 'High',
    'Security': 'High',
    'Plumbing': 'High',
    'Ragging': 'High',
    // Medium Priority
    'Internet': 'Medium',
    'Fees': 'Medium',
    'Staff Behaviour': 'Medium',
    'Attendance': 'Medium',
    'AC': 'Medium',
    'Geyser': 'Medium',
    // Low Priority
    'Furniture': 'Low',
    'Maintenance': 'Low',
    'Cleaning': 'Low',
    'Roommates': 'Low',
    'Corridor Issues': 'Low'
  };

  const categories = Object.keys(categoryPriorityMap);

  const getPriorityForCategory = (category) => {
    return categoryPriorityMap[category] || 'Medium';
  };

  useEffect(() => {
    if (!userData) return;

    const complaintsRef = ref(realtimeDB, 'complaints');
    const unsubscribe = onValue(complaintsRef, (snapshot) => {
      const complaints = snapshot.val();
      const data = complaints ? Object.entries(complaints)
        .filter(([id, complaint]) => {
          // Filter by multiple possible user identifiers
          return complaint.studentId === userData.uid || 
                 complaint.studentId === userData.id ||
                 complaint.studentName === userData.name;
        })
        .map(([id, complaint]) => ({
          id,
          ...complaint
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
      setComplaints(data);
      console.log('Filtered complaints for user:', userData.name, 'Found:', data.length);
    }, (error) => {
      console.error("Realtime Database error:", error);
    });

    return () => unsubscribe();
  }, [userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const complaintId = 'complaint_' + Date.now();
      const studentId = userData.uid || userData.id || 'student_' + Date.now();
      
      await set(ref(realtimeDB, 'complaints/' + complaintId), {
        ...newComplaint,
        studentId: studentId,
        studentName: userData.name || 'Unknown Student',
        roomNumber: userData.roomNumber || 'N/A',
        status: 'Pending',
        createdAt: new Date().toISOString(),
        updates: [
          { status: 'Pending', message: 'Complaint submitted successfully', time: new Date().toISOString() }
        ]
      });
      
      console.log('Complaint created for student:', userData.name, 'with ID:', studentId);
      setShowModal(false);
      setNewComplaint({ title: '', category: 'Water', description: '', priority: 'High' });
    } catch (err) {
      console.error('Error adding complaint:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Accepted': return 'status-accepted';
      case 'In Progress': return 'status-progress';
      case 'Resolved': return 'status-resolved';
      default: return '';
    }
  };

  return (
    <div className="complaints-container">
      <header className="page-header">
        <div className="header-text">
          <h1>Complaint Tracking</h1>
          <p>Raise and monitor your hostel complaints in real-time.</p>
        </div>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          <span>Raise Complaint</span>
        </button>
      </header>

      <div className="complaints-content">
        <div className="filters-bar">
          <div className="filter-group">
            <Filter size={18} />
            <span>Filter by status:</span>
            <select>
              <option>All Complaints</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
          </div>
        </div>

        <div className="complaints-grid">
          {complaints.length === 0 ? (
            <div className="empty-state">
              <MessageSquare size={48} />
              <h3>No complaints yet</h3>
              <p>Everything looks good! If you have any issues, feel free to raise a complaint.</p>
            </div>
          ) : (
            complaints.map((item) => (
              <div key={item.id} className="complaint-card animate-fade-in">
                <div className="card-header">
                  <span className={`status-badge ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                  <span className="complaint-id">#{item.id.slice(0, 6).toUpperCase()}</span>
                </div>
                
                <div className="card-body">
                  <h3>{item.title}</h3>
                  <div className="meta-tags">
                    <span className="category-tag">{item.category}</span>
                    <span className="date-tag">
                      <Clock size={12} />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p>{item.description}</p>
                </div>

                <div className="card-footer">
                  <div className="timeline-preview">
                    <div className="step active"></div>
                    <div className={`step ${['Accepted', 'In Progress', 'Resolved'].includes(item.status) ? 'active' : ''}`}></div>
                    <div className={`step ${['In Progress', 'Resolved'].includes(item.status) ? 'active' : ''}`}></div>
                    <div className={`step ${item.status === 'Resolved' ? 'active' : ''}`}></div>
                  </div>
                  <button 
                    className="details-btn"
                    onClick={() => {
                      setSelectedComplaint(item);
                      setShowDetailModal(true);
                    }}
                  >
                    Details <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <div className="modal-header">
              <h2>Raise New Complaint</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="complaint-form">
              <div className="form-group">
                <label>Title</label>
                <input 
                  type="text" 
                  placeholder="Briefly describe the issue" 
                  value={newComplaint.title}
                  onChange={(e) => setNewComplaint({...newComplaint, title: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select 
                  value={newComplaint.category}
                  onChange={(e) => {
                    const selectedCategory = e.target.value;
                    setNewComplaint({
                      ...newComplaint, 
                      category: selectedCategory,
                      priority: getPriorityForCategory(selectedCategory)
                    });
                  }}
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  rows="4" 
                  placeholder="Provide more details about the problem..."
                  value={newComplaint.description}
                  onChange={(e) => setNewComplaint({...newComplaint, description: e.target.value})}
                  required
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Tracking Modal */}
      {showDetailModal && selectedComplaint && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content detail-modal animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Complaint Tracking</h2>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}><X size={24} /></button>
            </div>
            
            <div className="complaint-detail-body">
              <div className="cd-header">
                <h3>{selectedComplaint.title}</h3>
                <span className={`status-badge ${getStatusColor(selectedComplaint.status)}`}>
                  {selectedComplaint.status}
                </span>
              </div>
              <div className="cd-meta">
                <span className="cd-id">#{selectedComplaint.id.slice(0, 6).toUpperCase()}</span>
                <span className="dot">•</span>
                <span className="cd-date">{new Date(selectedComplaint.createdAt).toLocaleString()}</span>
                <span className="dot">•</span>
                <span className="cd-cat">{selectedComplaint.category}</span>
              </div>
              <div className="cd-desc-box">
                <h4>Description</h4>
                <p>{selectedComplaint.description}</p>
              </div>

              <div className="tracking-timeline">
                <h4>Tracking History</h4>
                <div className="timeline-container">
                  {(selectedComplaint.updates || [{
                    status: 'Pending',
                    message: 'Complaint submitted successfully',
                    time: selectedComplaint.createdAt
                  }]).map((update, idx, arr) => (
                    <div key={idx} className={`timeline-item ${idx === arr.length - 1 ? 'current' : ''}`}>
                      <div className="timeline-marker">
                        <div className={`marker-dot ${getStatusColor(update.status)}`}></div>
                        {idx !== arr.length - 1 && <div className="marker-line"></div>}
                      </div>
                      <div className="timeline-content">
                        <div className="tl-header">
                          <span className="tl-status">{update.status}</span>
                          <span className="tl-time">{new Date(update.time).toLocaleString()}</span>
                        </div>
                        <p className="tl-message">{update.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;
