import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
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
  const [loading, setLoading] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    category: 'Maintenance',
    description: '',
    priority: 'Medium'
  });

  const categories = ['Electricity', 'Water', 'Internet', 'Cleaning', 'Maintenance', 'Security', 'Others'];

  useEffect(() => {
    if (!userData?.uid) return;

    const q = query(
      collection(db, 'complaints'),
      where('studentId', '==', userData.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComplaints(data);
    }, (error) => {
      console.error("Firestore error:", error);
    });

    return () => unsubscribe();
  }, [userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'complaints'), {
        ...newComplaint,
        studentId: userData.uid,
        studentName: userData.name,
        roomNumber: userData.roomNumber || 'N/A',
        status: 'Pending',
        createdAt: Timestamp.now(),
        updates: [
          { status: 'Pending', message: 'Complaint submitted successfully', time: Timestamp.now() }
        ]
      });
      setShowModal(false);
      setNewComplaint({ title: '', category: 'Maintenance', description: '', priority: 'Medium' });
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
                      {item.createdAt?.toDate().toLocaleDateString()}
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
                  <button className="details-btn">
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

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={newComplaint.category}
                    onChange={(e) => setNewComplaint({...newComplaint, category: e.target.value})}
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select 
                    value={newComplaint.priority}
                    onChange={(e) => setNewComplaint({...newComplaint, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
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
    </div>
  );
};

export default Complaints;
