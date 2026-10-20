import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as fbSignOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, onSnapshot, serverTimestamp } from 'firebase/firestore';

// Web app's Firebase configuration provided by user
export const firebaseConfig = {
  apiKey: "AIzaSyAUl9YBZia-gM6-WwxLhyMJPUbgxdGGG1I",
  authDomain: "gulzarfamilyhospitalchowkazam.firebaseapp.com",
  projectId: "gulzarfamilyhospitalchowkazam",
  storageBucket: "gulzarfamilyhospitalchowkazam.firebasestorage.app",
  messagingSenderId: "194364532787",
  appId: "1:194364532787:web:e7aa837b2268a7d9b89b46"
};

// Initialize Firebase safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export { app };

/**
 * Helper to sync appointment booking to Firestore
 */
export async function syncAppointmentToFirestore(appointment: any): Promise<boolean> {
  try {
    if (!appointment || !appointment.id) return false;
    const ref = doc(db, 'appointments', appointment.id);
    await setDoc(ref, {
      ...appointment,
      firestoreSyncedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore appointment sync notice:', err);
    return false;
  }
}

/**
 * Helper to sync admin user profile to Firestore
 */
export async function syncAdminToFirestore(adminUser: any): Promise<boolean> {
  try {
    if (!adminUser || !adminUser.id) return false;
    const ref = doc(db, 'admins', adminUser.id);
    // Never write plain text password to firestore
    const { password, passwordHash, ...safeAdmin } = adminUser;
    await setDoc(ref, {
      ...safeAdmin,
      firestoreSyncedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore admin sync notice:', err);
    return false;
  }
}

/**
 * Helper to sync audit log entry to Firestore
 */
export async function syncAuditLogToFirestore(logEntry: any): Promise<boolean> {
  try {
    if (!logEntry || !logEntry.id) return false;
    const ref = doc(db, 'audit_logs', logEntry.id);
    await setDoc(ref, {
      ...logEntry,
      firestoreSyncedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Firestore audit log sync notice:', err);
    return false;
  }
}
