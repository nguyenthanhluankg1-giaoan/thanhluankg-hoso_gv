import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
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

// Test connection gracefully
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'system', 'config'));
    console.log('Firestore connection verified');
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore operating in offline mode.');
    } else {
      console.warn('Firestore connection check notice:', error);
    }
  }
}

// Run test connection without blocking initial load
if (typeof window !== 'undefined') {
  setTimeout(testConnection, 1000);
}

