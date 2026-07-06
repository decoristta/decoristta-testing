import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

try {
  if (!getApps().length) {
    // Safely handle private key formatting issues (like accidental quotes from Vercel)
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
    
    // Remove wrapping quotes if they exist
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    // Fix escaped newlines
    privateKey = privateKey.replace(/\\n/g, '\n');

    if (process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
      initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
    } else {
      console.warn("Firebase Admin SDK skipped: Missing Credentials");
    }
  }
} catch (error) {
  console.error("Firebase Admin SDK Initialization Error:", error);
}

export const adminAuth = getApps().length ? getAuth() : null as any;
