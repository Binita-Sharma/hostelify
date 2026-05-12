import React, { useState, useEffect } from 'react';
import { realtimeDB } from '../../services/firebase';
import { ref, onValue, update } from 'firebase/database';
import { Plane, Search, Check, X, Calendar, MapPin } from 'lucide-react';
import './Leave.css';

const AdminLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Pending'); // Pending, Approved, Declined, All

  useEffect(() => {
    const leavesRef = ref(realtimeDB, 'hostel_leaves');
    const unsubscribe = onValue(leavesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const leavesList = Object.entries(data).map(([id, leave]) => ({ id, ...leave }));
        // Sort by created date, newest first
        leavesList.sort((a, b) => b.createdAt - a.createdAt);
        setLeaves(leavesList);
      } else {
        setLeaves([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = leaves;

    if (activeTab !== 'All') {
      result = result.filter(leave => leave.status === activeTab);
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(leave => 
        (leave.studentName && leave.studentName.toLowerCase().includes(lowerSearch)) ||
        (leave.roomNumber && leave.roomNumber.toLowerCase().includes(lowerSearch)) ||
        (leave.leaveType && leave.leaveType.toLowerCase().includes(lowerSearch))
      );
    }

    setFilteredLeaves(result);
  }, [leaves, activeTab, searchTerm]);

  const handleAction = async (leaveId, newStatus) => {
    if (window.confirm(`Are you sure you want to mark this leave as ${newStatus}?`)) {
      try {
        const leaveRef = ref(realtimeDB, `hostel_leaves/${leaveId}`);
        await update(leaveRef, {
          status: newStatus,
          actionedAt: Date.now(),
          actionedBy: 'Admin'
        });
      } catch (error) {
        console.error('Error updating leave status:', error);
        alert('Failed to update leave status.');
      }
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return { date: '', time: '' };
    const d = new Date(dateString);
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="admin-leave-container animate-fade-in">
      <header className="page-header">
        <div className="header-text">
          <div className="badge-premium">
            <Plane size={12} />
            <span>Facilities</span>
          </div>
          <h1>Hostel Leave Management</h1>
          <p>Review and manage student leave requests.</p>
        </div>
      </header>

      <div className="leave-filter-bar">
        <div className="leave-search">
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search by student name or room..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="leave-filter-tabs">
          {['Pending', 'Approved', 'Declined', 'All'].map(tab => (
            <button 
              key={tab}
              className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-leave-table-container">
        {loading ? (
          <div className="empty-state">Loading records...</div>
        ) : filteredLeaves.length === 0 ? (
          <div className="empty-state">
            <Plane size={48} />
            <h3>No Records Found</h3>
            <p>No leave requests match your current filters.</p>
          </div>
        ) : (
          <table className="admin-leave-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Leave Details</th>
                <th>Departure</th>
                <th>Return</th>
                <th>Contact</th>
                <th>Status / Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map(leave => {
                const dep = formatDateTime(leave.startDateTime);
                const ret = formatDateTime(leave.endDateTime);
                
                return (
                  <tr key={leave.id}>
                    <td>
                      <div className="student-info-cell">
                        <div className="student-avatar">{leave.studentName?.charAt(0) || 'S'}</div>
                        <div className="student-details">
                          <h4>{leave.studentName}</h4>
                          <span>Room: {leave.roomNumber}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="leave-details-cell">
                        <span className="leave-type">{leave.leaveType}</span>
                        <span className="leave-reason" title={leave.reason}>{leave.reason}</span>
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <span className="date"><Calendar size={12} style={{display:'inline', marginRight:'4px'}}/>{dep.date}</span>
                        <span className="time">{dep.time}</span>
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <span className="date"><Calendar size={12} style={{display:'inline', marginRight:'4px'}}/>{ret.date}</span>
                        <span className="time">{ret.time}</span>
                      </div>
                    </td>
                    <td>
                      <div className="student-details" style={{fontSize: '13px'}}>
                        <div>S: {leave.studentMobile}</div>
                        <div>P: {leave.relativeMobile}</div>
                      </div>
                    </td>
                    <td>
                      {leave.status === 'Pending' ? (
                        <div className="action-buttons">
                          <button 
                            className="approve-btn"
                            onClick={() => handleAction(leave.id, 'Approved')}
                            title="Approve"
                          >
                            Approve
                          </button>
                          <button 
                            className="decline-btn"
                            onClick={() => handleAction(leave.id, 'Declined')}
                            title="Decline"
                          >
                            Decline
                          </button>
                        </div>
                      ) : (
                        <span className={`status-badge ${leave.status.toLowerCase()}`}>
                          {leave.status}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminLeave;
