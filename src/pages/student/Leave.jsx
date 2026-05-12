import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { realtimeDB } from '../../services/firebase';
import { ref, push, set, onValue, remove } from 'firebase/database';
import { Plane, History } from 'lucide-react';
import './Leave.css';

const StudentLeave = () => {
  const { userData } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  const initialFormState = {
    leaveType: 'Day Leave',
    visitPlace: '',
    stayAddress: '',
    relativeMobile: '',
    studentMobile: userData?.phone || '',
    startDateTime: '',
    endDateTime: '',
    reason: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (!userData?.uid) return;

    const leavesRef = ref(realtimeDB, 'hostel_leaves');
    const unsubscribe = onValue(leavesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userLeaves = Object.entries(data)
          .map(([id, leave]) => ({ id, ...leave }))
          .filter(leave => leave.studentId === userData.uid);
        
        userLeaves.sort((a, b) => b.createdAt - a.createdAt);
        setLeaves(userLeaves);
      } else {
        setLeaves([]);
      }
    });

    return () => unsubscribe();
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const leavesRef = ref(realtimeDB, 'hostel_leaves');
      const newLeaveRef = push(leavesRef);
      
      await set(newLeaveRef, {
        ...formData,
        studentId: userData.uid,
        studentName: userData.name,
        roomNumber: userData.roomNumber || 'N/A',
        status: 'Pending',
        createdAt: Date.now(),
        applyDateStr: new Date().toLocaleDateString('en-US')
      });

      alert('Leave application submitted successfully!');
      setFormData(initialFormState);
    } catch (error) {
      console.error('Error submitting leave:', error);
      alert('Failed to submit leave application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
  };

  const handleCancelLeave = async (leaveId) => {
    if (window.confirm('Are you sure you want to cancel this leave application?')) {
      try {
        const leaveRef = ref(realtimeDB, `hostel_leaves/${leaveId}`);
        await remove(leaveRef);
      } catch (error) {
        console.error('Error canceling leave:', error);
        alert('Failed to cancel leave.');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="leave-container">
      <div className="leave-form-card">
        <div className="leave-form-header">
          <Plane size={24} />
          <h2>Apply for Hostel Leave</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="leave-form">
          <div className="form-group">
            <label>Leave Type *</label>
            <select 
              name="leaveType" 
              value={formData.leaveType} 
              onChange={handleInputChange}
              required
            >
              <option value="Day Leave">Day Leave</option>
              <option value="Night Leave">Night Leave</option>
              <option value="Home Leave">Home Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
            </select>
          </div>

          <div className="form-group">
            <label>Visit Place *</label>
            <input 
              type="text" 
              name="visitPlace" 
              value={formData.visitPlace} 
              onChange={handleInputChange}
              placeholder="Where are you going?"
              required
            />
          </div>

          <div className="form-group full-width">
            <label>Stay Address *</label>
            <textarea 
              name="stayAddress" 
              value={formData.stayAddress} 
              onChange={handleInputChange}
              placeholder="Enter full address where you will be staying"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label>Start Date & Time *</label>
            <input 
              type="datetime-local" 
              name="startDateTime" 
              value={formData.startDateTime} 
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Leave Ending Date & Time *</label>
            <input 
              type="datetime-local" 
              name="endDateTime" 
              value={formData.endDateTime} 
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Your Mobile No *</label>
            <input 
              type="tel" 
              name="studentMobile" 
              value={formData.studentMobile} 
              onChange={handleInputChange}
              placeholder="Your contact number"
              required
            />
          </div>

          <div className="form-group">
            <label>Mobile No of Relative *</label>
            <input 
              type="tel" 
              name="relativeMobile" 
              value={formData.relativeMobile} 
              onChange={handleInputChange}
              placeholder="Parent/Guardian contact number"
              required
            />
          </div>

          <div className="form-group full-width">
            <label>Reason for Leaving *</label>
            <textarea 
              name="reason" 
              value={formData.reason} 
              onChange={handleInputChange}
              placeholder="Please provide a specific reason"
              required
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
            <button type="button" className="reset-btn" onClick={handleReset} disabled={loading}>
              Reset
            </button>
          </div>
        </form>
      </div>

      <div className="leave-history-section">
        <div className="leave-history-header">
          <History size={24} />
          <h3>Leave History</h3>
        </div>

        <div className="leave-table-container">
          <table className="leave-table">
            <thead>
              <tr>
                <th>Apply Date</th>
                <th>Leave Type</th>
                <th>Departure</th>
                <th>Return</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-history">No leave records found.</td>
                </tr>
              ) : (
                leaves.map(leave => (
                  <tr key={leave.id}>
                    <td>{leave.applyDateStr}</td>
                    <td>{leave.leaveType}</td>
                    <td>{formatDate(leave.startDateTime)}</td>
                    <td>{formatDate(leave.endDateTime)}</td>
                    <td>
                      <span className={`status-badge ${leave.status.toLowerCase()}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td>
                      {leave.status === 'Pending' ? (
                        <button 
                          className="cancel-leave-btn"
                          onClick={() => handleCancelLeave(leave.id)}
                        >
                          Cancel Leave
                        </button>
                      ) : (
                        <span style={{color: 'var(--text-muted)', fontSize: '12px'}}>N/A</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentLeave;
