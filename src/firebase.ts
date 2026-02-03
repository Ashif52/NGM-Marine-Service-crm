import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
let rawApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
// Automatically prepend https:// if protocol is missing and it's not localhost
if (rawApiUrl && !rawApiUrl.startsWith('http') && !rawApiUrl.includes('localhost')) {
  rawApiUrl = `https://${rawApiUrl}`;
}
export const API_BASE_URL = rawApiUrl;
console.log('🌐 API Base URL:', API_BASE_URL);
if (API_BASE_URL.includes('localhost') && window.location.hostname !== 'localhost') {
  console.warn('⚠️ Frontend is running on a remote host but trying to connect to localhost API!');
}
