import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { User, Mail, Phone, Hash, Shield, Save, Camera } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { userData, currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    phone: userData?.phone || '',
    emergencyContact: userData?.emergencyContact || '',
    bloodGroup: userData?.bloodGroup || ''
  });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, formData);
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
                <strong>{userData?.roomNumber || '204'}</strong>
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
                onClick={() => setIsEditing(!isEditing)}
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
                  <label>Emergency Contact</label>
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
        </div>
      </div>
    </div>
  );
};

export default Profile;
