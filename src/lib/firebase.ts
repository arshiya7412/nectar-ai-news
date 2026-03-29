import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB7M3Gjpj_zZldtzfRhDDwQIsjxq77sP-Y",
  authDomain: "nectar-news-ai.firebaseapp.com",
  projectId: "nectar-news-ai",
  storageBucket: "nectar-news-ai.firebasestorage.app",
  messagingSenderId: "882598569357",
  appId: "1:882598569357:web:b67827a8323901265c09c4",
  measurementId: "G-GKXX89KCCS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
setPersistence(auth, browserSessionPersistence);

// Initialize Firestore Database
export const db = getFirestore(app);

export default app;
