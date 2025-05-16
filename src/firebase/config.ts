import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCfz2F511QIhgDUluiuXKdk-YCZOqzQY5A",
  authDomain: "arta-meditation.firebaseapp.com",
  projectId: "arta-meditation",
  storageBucket: "arta-meditation.firebasestorage.app",
  messagingSenderId: "468776739392",
  appId: "1:468776739392:web:220f23fb025b8b9f0c75a5"
};

// User IDs
export const USER_IDS = {
  HARSH: 'AnVBZFxhnsZGp3FNRLfUgOWxRvK2',
  ARTA: '2hpLSai3gnbjyhwGsfYtm1JHNaA3'
} as const;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;