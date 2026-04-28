import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Search, Filter, UserPlus, Mail, Phone, Home, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import './Students.css';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'student'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(data);
    });
    return () => unsubscribe();
  }, []);

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-students-container">
      <header className="page-header">
        <div className="header-text">
          <h1>Student Management</h1>
          <p>View and manage all registered students.</p>
        </div>
        <button className="add-student-btn">
          <UserPlus size={18} />
          <span>Add New Student</span>
        </button>
      </header>

      <div className="students-content">
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by name or roll number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filters">
            <button className="filter-btn"><Filter size={18} /> Filter</button>
          </div>
        </div>

        <div className="students-grid">
          {filteredStudents.map(student => (
            <div key={student.id} className="student-card animate-fade-in">
              <div className="card-top">
                <div className="student-avatar">
                  {student.name?.charAt(0)}
                </div>
                <div className="card-actions">
                  <button className="icon-btn"><MoreVertical size={16} /></button>
                </div>
              </div>
              
              <div className="card-info">
                <h3>{student.name}</h3>
                <span className="roll-number">{student.rollNumber || 'No Roll No'}</span>
                
                <div className="info-row">
                  <Mail size={14} />
                  <span>{student.email}</span>
                </div>
                <div className="info-row">
                  <Home size={14} />
                  <span>Room: {student.roomNumber || 'Not Assigned'}</span>
                </div>
              </div>

              <div className="card-footer">
                <button className="action-link"><Edit2 size={14} /> Edit</button>
                <button className="action-link delete"><Trash2 size={14} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminStudents;
