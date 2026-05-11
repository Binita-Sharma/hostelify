import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Hash, Shield, Save, Camera } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { userData, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    phone: userData?.phone || '',
    emergencyContact: userData?.emergencyContact || '',
    bloodGroup: userData?.bloodGroup || '',
    address: userData?.address || ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        phone: userData.phone || '',
        emergencyContact: userData.emergencyContact || '',
        bloodGroup: userData.bloodGroup || '',
        address: userData.address || ''
      });
    }
  }, [userData]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserProfile(formData);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <header className="page-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and security settings.</p>
      </header>

      <div className="profile-grid">
        <div className="profile-sidebar">
          <div className="profile-card user-main">
            <div className="avatar-wrapper">
              <div className="profile-avatar large">
                {userData?.name?.charAt(0) || 'U'}
              </div>
              <button className="change-avatar"><Camera size={16} /></button>
            </div>
            <h2>{userData?.name}</h2>
            <span className="role-badge student">Student</span>
            <div className="quick-stats">
              <div className="q-stat">
                <span>Room</span>
                <strong>{userData?.roomNumber || 'Not Assigned'}</strong>
              </div>
              <div className="q-stat">
                <span>Roll No</span>
                <strong>{userData?.rollNumber || 'N/A'}</strong>
              </div>
            </div>
          </div>

          <div className="profile-card security-card">
            <h3><Shield size={18} /> Security</h3>
            <p>Your account is protected by Firebase Authentication.</p>
            <button className="text-link">Change Password</button>
            <button className="text-link">Enable Two-Factor Auth</button>
          </div>
        </div>

        <div className="profile-main">
          <div className="profile-card edit-section">
            <div className="card-header">
              <h2>Personal Information</h2>
              <button 
                className={`edit-btn ${isEditing ? 'cancel' : ''}`}
                onClick={() => {
                  setIsEditing(!isEditing);
                  if (isEditing && userData) {
                    // Reset form data on cancel
                    setFormData({
                      name: userData.name || '',
                      phone: userData.phone || '',
                      emergencyContact: userData.emergencyContact || '',
                      bloodGroup: userData.bloodGroup || '',
                      address: userData.address || ''
                    });
                  }
                }}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <form onSubmit={handleUpdate} className="profile-form">
              <div className="form-grid">
                <div className="form-group">
                  <label><User size={14} /> Full Name</label>
                  <input 
                    type="text" 
                    value={isEditing ? formData.name : userData?.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    readOnly={!isEditing} 
                  />
                </div>
                <div className="form-group">
                  <label><Mail size={14} /> Email Address</label>
                  <input type="email" value={userData?.email} readOnly />
                </div>
                <div className="form-group">
                  <label><Phone size={14} /> Phone Number</label>
                  <input 
                    type="text" 
                    value={isEditing ? formData.phone : (userData?.phone || 'Not provided')} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    readOnly={!isEditing} 
                  />
                </div>
                <div className="form-group">
                  <label><Hash size={14} /> Roll Number</label>
                  <input type="text" value={userData?.rollNumber} readOnly />
                </div>
                <div className="form-group">
                  <label>Guardian Name / Emergency Contact</label>
                  <input 
                    type="text" 
                    value={isEditing ? formData.emergencyContact : (userData?.emergencyContact || 'Not provided')} 
                    onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                    readOnly={!isEditing} 
                  />
                </div>
                <div className="form-group">
                  <label>Blood Group</label>
                  <input 
                    type="text" 
                    value={isEditing ? formData.bloodGroup : (userData?.bloodGroup || 'Not provided')} 
                    onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                    readOnly={!isEditing} 
                  />
                </div>
                <div className="form-group full-width">
                  <label>Address</label>
                  <input 
                    type="text" 
                    value={isEditing ? formData.address : (userData?.address || 'Not provided')} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    readOnly={!isEditing} 
                  />
                </div>
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button type="submit" className="save-btn" disabled={loading}>
                    <Save size={18} />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="profile-card id-card-section">
            <div className="card-header">
              <h2>Virtual ID Card</h2>
              <button className="download-btn">Download ID</button>
            </div>
            
            <div className="id-card-wrapper">
              <div className="virtual-id-card">
                <div className="id-card-header">
                  <div className="id-logo">
                    <div className="logo-icon">H</div>
                    <span>HOSTELIFY</span>
                  </div>
                  <div className="id-university">
                    UNIVERSITY OF TECHNOLOGY
                  </div>
                </div>

                <div className="id-card-body">
                  <div className="id-photo-section">
                    <div className="id-photo">
                      {userData?.name?.charAt(0) || 'U'}
                    </div>
                  </div>
                  
                  <div className="id-info-section">
                    <h1 className="id-title">STUDENT ID CARD</h1>
                    <div className="id-details">
                      <div className="id-row">
                        <span className="label">Name</span>
                        <span className="value">: {userData?.name}</span>
                      </div>
                      <div className="id-row">
                        <span className="label">Student ID</span>
                        <span className="value">: {userData?.rollNumber}</span>
                      </div>
                      <div className="id-row">
                        <span className="label">Phone No</span>
                        <span className="value">: {userData?.phone || 'N/A'}</span>
                      </div>
                      <div className="id-row">
                        <span className="label">Blood Group</span>
                        <span className="value">: {userData?.bloodGroup || 'N/A'}</span>
                      </div>
                      <div className="id-row">
                        <span className="label">Guardian</span>
                        <span className="value">: {userData?.emergencyContact || 'N/A'}</span>
                      </div>
                      <div className="id-row">
                        <span className="label">Address</span>
                        <span className="value">: {userData?.address || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="id-barcode">
                      <div className="barcode-lines"></div>
                      <span className="barcode-text">{userData?.rollNumber}</span>
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
  );
};

export default Profile;
