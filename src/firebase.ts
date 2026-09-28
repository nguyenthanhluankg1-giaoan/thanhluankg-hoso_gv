import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

export const app = initializeApp(firebaseConfig);

// Initialize Firestore directly with the database ID from config
export const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? firebaseConfig.firestoreDatabaseId
    : undefined
);

export const auth = getAuth(app);

// Test connection gracefully without blocking UI or throwing unhandled network errors
async function testConnection() {
  try {
    await getDoc(doc(db, 'system', 'config'));
    console.log('Firestore connection initialized');
  } catch (error: any) {
    if (error?.code === 'unavailable' || (error instanceof Error && error.message.includes('offline'))) {
      console.warn('Firestore operating in offline/cached mode.');
    } else {
      console.warn('Firestore connection check notice:', error?.message || error);
    }
  }
}

// Run test connection without blocking initial load
if (typeof window !== 'undefined') {
  setTimeout(testConnection, 1000);
}

