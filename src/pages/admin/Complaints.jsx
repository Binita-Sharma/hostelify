import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  doc, 
  updateDoc, 
  Timestamp,
  arrayUnion 
} from 'firebase/firestore';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User, 
  Home, 
  ChevronRight,
  BrainCircuit,
  MessageSquare,
  Wrench,
  X
} from 'lucide-react';
import './Complaints.css';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComplaints(data);
    }, (error) => {
      console.warn("Firestore error:", error);
      // Mock data for demo if Firestore fails
      setComplaints([
        { 
          id: '1777315951', 
          title: 'water leakage', 
          status: 'Pending', 
          priority: 'high', 
          category: 'Water', 
          resource: 'Plumbing',
          studentName: 'Aarav Sharma',
          createdAt: { toDate: () => new Date('2026-04-28') },
          description: 'The bathroom tap is leaking continuously.'
        }
      ]);
    });
    return () => unsubscribe();
  }, []);

  const getStats = () => {
    const stats = { Pending: 0, Accepted: 0, 'In Progress': 0, 'Under Review': 0, Resolved: 0 };
    complaints.forEach(c => { if(stats[c.status] !== undefined) stats[c.status]++; });
    return stats;
  };

  const updateStatus = async (id, newStatus) => {
    setLoading(true);
    try {
      const complaintRef = doc(db, 'complaints', id);
      await updateDoc(complaintRef, {
        status: newStatus,
        updates: arrayUnion({
          status: newStatus,
          message: `Status updated to ${newStatus} by Admin`,
          time: Timestamp.now()
        })
      });
      if (selectedComplaint?.id === id) {
        setSelectedComplaint(prev => ({...prev, status: newStatus}));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = getStats();

  return (
    <div className="admin-complaints-v2 animate-fade-in">
      <header className="page-header">
        <div className="header-text">
          <span className="subtitle">OPERATIONS</span>
          <h1>Complaints</h1>
        </div>
      </header>

      <div className="status-summary-row">
        {Object.entries(stats).map(([label, count]) => (
          <div key={label} className="summary-card">
            <span className="summary-label">{label}</span>
            <h3>{count}</h3>
          </div>
        ))}
      </div>

      <div className="main-complaints-box">
        <div className="box-header">
          <div className="header-left">
            <MessageSquare size={18} className="icon-orange" />
            <span>All complaints ({complaints.length})</span>
          </div>
          <div className="header-right">
            <select className="filter-select">
              <option>All status</option>
              <option>Pending</option>
              <option>Accepted</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
            <select className="filter-select">
              <option>All priority</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <select className="filter-select">
              <option>All category</option>
              <option>Water</option>
              <option>Electricity</option>
              <option>Maintenance</option>
            </select>
          </div>
        </div>

        <div className="complaints-list-v2">
          {complaints.map(item => (
            <div key={item.id} className="complaint-item-v2" onClick={() => { setSelectedComplaint(item); setShowDetail(true); }}>
              <div className="item-main">
                <div className="item-title-row">
                  <h4>{item.title}</h4>
                  <span className={`badge-prio ${item.priority?.toLowerCase()}`}>{item.priority}</span>
                  <span className={`badge-status ${item.status?.toLowerCase().replace(' ', '-')}`}>{item.status}</span>
                  <span className="tag-category">{item.category}</span>
                  {item.resource && (
                    <span className="tag-resource">
                      <Wrench size={12} />
                      {item.resource}
                    </span>
                  )}
                </div>
                <div className="item-meta-row">
                  <span>HSL-{item.id.slice(0,10)}</span>
                  <span className="dot">•</span>
                  <span>{item.studentName}</span>
                  <span className="dot">•</span>
                  <span>{item.createdAt?.toDate().toLocaleDateString('en-GB')}</span>
                </div>
              </div>
              <ChevronRight size={20} className="chevron" />
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedComplaint && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal-content-lg animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Complaint Details</h2>
              <button className="close-btn" onClick={() => setShowDetail(false)}><X size={24} /></button>
            </div>
            <div className="modal-body">
              <div className="detail-top">
                <div className="detail-title-section">
                  <h1>{selectedComplaint.title}</h1>
                  <p className="id-text">Ticket ID: HSL-{selectedComplaint.id}</p>
                </div>
                <div className="status-updater">
                  <label>Current Status:</label>
                  <select 
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

              <div className="detail-grid">
                <div className="detail-main-info">
                  <div className="info-box">
                    <label>Description</label>
                    <p>{selectedComplaint.description}</p>
                  </div>
                  <div className="info-box">
                    <label>Student Information</label>
                    <div className="student-info-strip">
                      <User size={16} />
                      <span>{selectedComplaint.studentName}</span>
                      <span className="dot">•</span>
                      <span>Room {selectedComplaint.roomNumber || '204'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="detail-ai-sidebar">
                  <div className="ai-box">
                    <div className="ai-title">
                      <BrainCircuit size={18} />
                      <span>AI Insights</span>
                    </div>
                    <p>Based on the category <strong>{selectedComplaint.category}</strong>, we suggest assigning a <strong>{selectedComplaint.resource || 'Maintenance Staff'}</strong>.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
