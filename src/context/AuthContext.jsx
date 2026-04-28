import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    // Demo Bypass Logic (Optional: Keep for user convenience but prioritize real auth)
    if (email === 'admin@hostelify.com' && password === 'admin123') {
      const mockAdmin = { 
        uid: 'demo-admin', 
        email: 'admin@hostelify.com', 
        role: 'admin', 
        name: 'Demo Admin' 
      };
      setCurrentUser(mockAdmin);
      setUserData(mockAdmin);
      return mockAdmin;
    }
    
    if (email === 'student@hostelify.com' && password === 'student123') {
      const mockStudent = { 
        uid: 'demo-student', 
        email: 'student@hostelify.com', 
        role: 'student', 
        name: 'Demo Student',
        roomNumber: '204',
        rollNumber: '2024CS101'
      };
      setCurrentUser(mockStudent);
      setUserData(mockStudent);
      return mockStudent;
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      setUserData(userDoc.data());
    }
    return user;
  };

  const signup = async (email, password, role, additionalData) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const profile = {
      uid: user.uid,
      email,
      role,
      ...additionalData,
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', user.uid), profile);
    setUserData(profile);
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    setUserData(null);
    return signOut(auth);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } else {
        // Only clear if not in a demo session
        if (!currentUser?.uid?.startsWith('demo-')) {
          setCurrentUser(null);
          setUserData(null);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  const value = {
    currentUser,
    userData,
    login,
    signup,
    logout,
    resetPassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
