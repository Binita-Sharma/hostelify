import React, { useState, useEffect } from 'react';
import { realtimeDB } from '../../services/firebase';
import { ref, onValue, update, remove, set } from 'firebase/database';
import { Plus, CheckCircle, Trash2, ChevronDown, X } from 'lucide-react';
import './Fees.css';

const AdminFees = () => {
  const [feeRecords, setFeeRecords] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFee, setNewFee] = useState({
    student: '',
    description: '',
    semester: '',
    amount: '',
    due: ''
  });

  useEffect(() => {
    const feesRef = ref(realtimeDB, 'fees');
    const unsubscribe = onValue(feesRef, (snapshot) => {
      const fees = snapshot.val();
      const data = fees ? Object.entries(fees)
        .map(([id, fee]) => ({
          id,
          ...fee
        }))
        .sort((a, b) => new Date(b.due) - new Date(a.due)) : [];
      setFeeRecords(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const totalCollected = feeRecords
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const totalPending = feeRecords
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    await update(ref(realtimeDB, 'fees/' + id), { status: newStatus });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      await remove(ref(realtimeDB, 'fees/' + id));
    }
  };

  const handleCreateFee = async (e) => {
    e.preventDefault();
    try {
      const feeId = 'fee_' + Date.now();
      await set(ref(realtimeDB, 'fees/' + feeId), {
        ...newFee,
        amount: Number(newFee.amount),
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      setIsModalOpen(false);
      setNewFee({ student: '', description: '', semester: '', amount: '', due: '' });
    } catch (error) {
      console.error("Error adding fee record: ", error);
    }
  };

  const filteredRecords = feeRecords.filter(r => {
    if (filter === 'All') return true;
    return r.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="admin-fees-page">
      <header className="fees-header">
        <div className="header-title-section">
          <span className="label">FINANCE</span>
          <h1>Fee management</h1>
        </div>
        <button className="create-fee-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          <span>Create fee</span>
        </button>
      </header>

      <section className="fees-stats">
        <div className="stat-card">
          <span className="stat-label">TOTAL COLLECTED</span>
          <div className="stat-value">₹ {totalCollected.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">TOTAL PENDING</span>
          <div className="stat-value">₹ {totalPending.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">RECORDS</span>
          <div className="stat-value">{feeRecords.length}</div>
        </div>
      </section>

      <main className="fees-content-card">
        <div className="content-header">
          <h2>All fees</h2>
          <div className="filter-dropdown">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="All">All</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
            <ChevronDown size={14} color="#8c8c8c" />
          </div>
        </div>

        <div className="fees-table-container">
          <table className="fees-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Description</th>
                <th>Semester</th>
                <th>Amount</th>
                <th>Due</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id}>
                  <td className="student-cell">{record.student}</td>
                  <td>{record.description}</td>
                  <td className="semester-cell">{record.semester}</td>
                  <td className="amount-cell">₹{(Number(record.amount) || 0).toLocaleString()}</td>
                  <td className="due-cell">{record.due}</td>
                  <td>
                    <span className={`status-badge ${record.status}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="action-cell">
                    {record.status === 'pending' ? (
                      <button 
                        className="mark-paid-btn"
                        onClick={() => handleToggleStatus(record.id, record.status)}
                      >
                        <CheckCircle size={16} />
                        <span>Mark paid</span>
                      </button>
                    ) : (
                      <button 
                        className="undo-btn"
                        onClick={() => handleToggleStatus(record.id, record.status)}
                      >
                        Undo
                      </button>
                    )}
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(record.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredRecords.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#8c8c8c' }}>
              No fee records found.
            </div>
          )}
          {loading && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#8c8c8c' }}>
              Loading records...
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Fee</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <form className="modal-form" onSubmit={handleCreateFee}>
              <div className="form-group">
                <label>Student Name</label>
                <input 
                  type="text" 
                  required 
                  value={newFee.student} 
                  onChange={e => setNewFee({...newFee, student: e.target.value})} 
                  placeholder="e.g. Aarav Sharma"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input 
                  type="text" 
                  required 
                  value={newFee.description} 
                  onChange={e => setNewFee({...newFee, description: e.target.value})} 
                  placeholder="e.g. Hostel Fee Sem 6"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Semester</label>
                  <input 
                    type="text" 
                    required 
                    value={newFee.semester} 
                    onChange={e => setNewFee({...newFee, semester: e.target.value})} 
                    placeholder="e.g. Sem 6 (2026)"
                  />
                </div>
                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input 
                    type="number" 
                    required 
                    value={newFee.amount} 
                    onChange={e => setNewFee({...newFee, amount: e.target.value})} 
                    placeholder="e.g. 25000"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input 
                  type="date" 
                  required 
                  value={newFee.due} 
                  onChange={e => setNewFee({...newFee, due: e.target.value})} 
                />
              </div>
              <button type="submit" className="submit-btn">Create Fee Record</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFees;
