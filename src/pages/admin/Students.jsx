import React, { useState, useEffect } from 'react';
import { realtimeDB } from '../../services/firebase';
import { ref, onValue, update, remove } from 'firebase/database';
import { Search, Filter, UserPlus, Mail, Phone, Home, MoreVertical, Edit2, Trash2, X, Save, User, Hash } from 'lucide-react';
import './Students.css';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    emergencyContact: '',
    bloodGroup: '',
    address: '',
    rollNumber: '',
    email: '',
    roomNumber: '',
    laundryAssigned: false
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const studentsRef = ref(realtimeDB, 'students');
    const unsubscribe = onValue(studentsRef, (snapshot) => {
      const students = snapshot.val();
      const data = students ? Object.entries(students)
        .map(([id, student]) => ({
          id,
          ...student
        })) : [];
      setStudents(data);
    });
    return () => unsubscribe();
  }, []);

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name || '',
      phone: student.phone || '',
      emergencyContact: student.emergencyContact || '',
      bloodGroup: student.bloodGroup || '',
      address: student.address || '',
      rollNumber: student.rollNumber || '',
      email: student.email || '',
      roomNumber: student.roomNumber || '',
      laundryAssigned: student.laundryAssigned || false
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await remove(ref(realtimeDB, `students/${id}`));
      } catch (err) {
        console.error('Error deleting student:', err);
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const studentRef = ref(realtimeDB, `students/${editingStudent.id}`);
      await update(studentRef, formData);
      setEditingStudent(null);
      // Success toast or notification could go here
    } catch (err) {
      console.error('Error updating student:', err);
    } finally {
      setSaving(false);
    }
  };

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
            <div key={student.id} className="student-card animate-fade-in" onClick={() => handleEditClick(student)}>
              <div className="card-top">
                <div className="student-avatar">
                  {student.name?.charAt(0)}
                </div>
                <div className="card-actions">
                  <button className="icon-btn" onClick={(e) => { e.stopPropagation(); }}><MoreVertical size={16} /></button>
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
                <button 
                  className="action-link"
                  onClick={(e) => { e.stopPropagation(); handleEditClick(student); }}
                >
                  <Edit2 size={14} style={{ pointerEvents: 'none' }} /> Edit
                </button>
                <button 
                  className="action-link delete" 
                  onClick={(e) => { e.stopPropagation(); handleDelete(student.id); }}
                >
                  <Trash2 size={14} style={{ pointerEvents: 'none' }} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingStudent && (
        <div className="edit-modal-overlay">
          <div className="edit-modal-content animate-slide-up">
            <header className="modal-header">
              <div className="header-info">
                <h2>Edit Student Profile</h2>
                <p>Modify personal information and view ID card.</p>
              </div>
              <button className="close-btn" onClick={() => setEditingStudent(null)}>
                <X size={24} />
              </button>
            </header>

            <div className="modal-body">
              <div className="edit-form-section">
                <form onSubmit={handleUpdate} className="admin-edit-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label><User size={14} /> Full Name</label>
                      <input 
                        type="text" 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label><Mail size={14} /> Email Address</label>
                      <input type="email" value={formData.email} readOnly />
                    </div>
                    <div className="form-group">
                      <label><Phone size={14} /> Phone Number</label>
                      <input 
                        type="text" 
                        value={formData.phone} 
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label><Hash size={14} /> Roll Number</label>
                      <input 
                        type="text" 
                        value={formData.rollNumber} 
                        onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Guardian / Emergency Contact</label>
                      <input 
                        type="text" 
                        value={formData.emergencyContact} 
                        onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Blood Group</label>
                      <input 
                        type="text" 
                        value={formData.bloodGroup} 
                        onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Address</label>
                      <input 
                        type="text" 
                        value={formData.address} 
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                    
                    <div className="form-group full-width laundry-assignment">
                      <div className="laundry-toggle">
                        <div className="toggle-info">
                          <label>Assign Laundry Service</label>
                          <p>Allow student to access laundry facilities and tracking.</p>
                        </div>
                        <label className="switch">
                          <input 
                            type="checkbox" 
                            checked={formData.laundryAssigned} 
                            onChange={(e) => setFormData({...formData, laundryAssigned: e.target.checked})}
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={() => setEditingStudent(null)}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={saving}>
                      <Save size={18} />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="id-card-preview-section">
                <h3 className="preview-label">Live ID Card Preview</h3>
                <div className="id-card-wrapper mini">
                  <div className="virtual-id-card">
                    <div className="id-card-header">
                      <div className="id-logo">
                        <div className="logo-icon">H</div>
                        <span>HOSTELIFY</span>
                      </div>
                      <div className="id-university">UNIVERSITY OF TECHNOLOGY</div>
                    </div>

                    <div className="id-card-body">
                      <div className="id-photo-section">
                        <div className="id-photo">
                          {formData.name?.charAt(0) || 'U'}
                        </div>
                      </div>
                      
                      <div className="id-info-section">
                        <h1 className="id-title">STUDENT ID CARD</h1>
                        <div className="id-details">
                          <div className="id-row">
                            <span className="label">Name</span>
                            <span className="value">: {formData.name}</span>
                          </div>
                          <div className="id-row">
                            <span className="label">Student ID</span>
                            <span className="value">: {formData.rollNumber}</span>
                          </div>
                          <div className="id-row">
                            <span className="label">Phone No</span>
                            <span className="value">: {formData.phone || 'N/A'}</span>
                          </div>
                          <div className="id-row">
                            <span className="label">Blood Group</span>
                            <span className="value">: {formData.bloodGroup || 'N/A'}</span>
                          </div>
                          <div className="id-row">
                            <span className="label">Guardian</span>
                            <span className="value">: {formData.emergencyContact || 'N/A'}</span>
                          </div>
                          <div className="id-row">
                            <span className="label">Address</span>
                            <span className="value">: {formData.address || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="id-barcode">
                          <div className="barcode-lines"></div>
                          <span className="barcode-text">{formData.rollNumber}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="id-card-footer">
                      <div className="footer-wave"></div>
                    </div>
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

export default AdminStudents;
