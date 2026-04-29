import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'
import { enableNetwork, disableNetwork } from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
}

// Initialize Firebase - handle duplicate app error
let app
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
  console.log('Firebase initialized with project:', firebaseConfig.projectId)
} else {
  app = getApp()
  console.log('Firebase app already exists, using existing app')
}

export const auth = getAuth(app)
export const db = getFirestore(app)
export const realtimeDB = getDatabase(app)
export const storage = getStorage(app)
// Only initialize analytics in browser environment
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null

// Enable network for Firestore to prevent offline issues
enableNetwork(db).catch((error) => {
  console.warn('Firebase network enable failed:', error)
})

// Test connection
console.log('Firebase initialized with project:', firebaseConfig.projectId)
console.log('Firebase app initialized successfully!')
