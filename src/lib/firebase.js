// ============================================
// FIREBASE CONFIGURATION
// ============================================
// 
// WORKSHOP SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project (or use existing one)
// 3. Go to Project Settings > General > Your apps
// 4. Click "Add app" and select Web (</>)
// 5. Register the app and copy the config below
// 6. Enable Authentication > Sign-in method > Anonymous
// 7. Create Firestore Database in test mode
//
// ============================================

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your Firebase config
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

/*
Replace with your Firebase config object here
*/

// Initialize service
export const auth = getAuth(app);
export const db = getFirestore(app);

// Anonymous sign-in function
export const signInAnon = async () => {
  try {
    const result = await signInAnonymously(auth);
    console.log('✅ Signed in anonymously:', result.user.uid);
    return result.user;
  } catch (error) {
    console.error('❌ Anonymous sign-in failed:', error);
    throw error;
  }
};
