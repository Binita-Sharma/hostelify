import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, realtimeDB } from '../services/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { ref, get, set, update } from 'firebase/database';
import { generateToken, verifyToken, setAuthCookie, getAuthCookie, removeAuthCookie, getUserFromToken } from '../utils/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Password utility functions
const encryptPassword = (password) => {
  // Simple encryption for demo purposes - in production, use proper hashing
  return btoa(password);
};

const comparePasswords = (inputPassword, storedPassword) => {
  return btoa(inputPassword) === storedPassword;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    // Custom authentication using separate students and admins tables
    try {
      // Check admins table first
      const adminsRef = ref(realtimeDB, 'admins');
      const adminsSnapshot = await get(adminsRef);
      
      if (adminsSnapshot.exists()) {
        const admins = adminsSnapshot.val();
        const admin = Object.values(admins).find(a => a.email === email && comparePasswords(password, a.password));
        
        if (admin) {
          setCurrentUser(admin);
          setUserData({ ...admin, role: 'admin' });
          // Store token in cookie
          const token = generateToken({ ...admin, role: 'admin' });
          setAuthCookie(token);
          return admin;
        }
      }
      
      // Check students table if not found in admins
      const studentsRef = ref(realtimeDB, 'students');
      const studentsSnapshot = await get(studentsRef);
      
      if (studentsSnapshot.exists()) {
        const students = studentsSnapshot.val();
        const student = Object.values(students).find(s => s.email === email && comparePasswords(password, s.password));
        
        if (student) {
          setCurrentUser(student);
          setUserData({ ...student, role: 'student' });
          // Store token in cookie
          const token = generateToken({ ...student, role: 'student' });
          setAuthCookie(token);
          return student;
        }
      }
      
      throw new Error('Invalid email or password');
    } catch (error) {
      throw new Error('Authentication failed: ' + error.message);
    }
  };

  const signup = async (email, password, role, additionalData) => {
    // Custom signup using separate students and admins tables
    try {
      const userId = role === 'admin' ? 'admin_' + Date.now() : 'student_' + Date.now();
      const encryptedPassword = encryptPassword(password);
      
      const profile = {
        uid: userId,
        email,
        password: encryptedPassword,
        phone: additionalData.phone || '',
        ...additionalData,
        createdAt: new Date().toISOString()
      };

      // Save to appropriate table based on role
      const tablePath = role === 'admin' ? 'admins/' + userId : 'students/' + userId;
      await set(ref(realtimeDB, tablePath), profile);
      
      setUserData({ ...profile, role });
      return profile;
    } catch (error) {
      throw new Error('Signup failed: ' + error.message);
    }
  };

  const updateUserProfile = async (newData) => {
    try {
      if (!currentUser || !userData) return;
      
      const tablePath = userData.role === 'admin' ? 'admins/' + currentUser.uid : 'students/' + currentUser.uid;
      const userRef = ref(realtimeDB, tablePath);
      
      await update(userRef, newData);
      
      const updatedUser = { ...userData, ...newData };
      setUserData(updatedUser);
      setCurrentUser(updatedUser);
      
      const token = generateToken(updatedUser);
      setAuthCookie(token);
      
      return updatedUser;
    } catch (error) {
      throw new Error('Profile update failed: ' + error.message);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setUserData(null);
    // Remove auth cookie
    removeAuthCookie();
    return Promise.resolve();
  };

  const resetPassword = (email) => {
    return Promise.reject(new Error('Password reset not available with custom authentication'));
  };

  useEffect(() => {
    // Check for existing token in cookie on app load
    const initializeAuth = () => {
      const token = getAuthCookie();
      if (token) {
        const decodedToken = verifyToken(token);
        if (decodedToken) {
          // User is authenticated, set user data from token
          setCurrentUser(decodedToken);
          setUserData(decodedToken);
        } else {
          // Invalid token, remove cookie
          removeAuthCookie();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const value = {
    currentUser,
    userData,
    login,
    signup,
    logout,
    resetPassword,
    updateUserProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
