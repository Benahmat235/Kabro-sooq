import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { toast } from 'react-hot-toast';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);
export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  console.error('Firestore Error: ', JSON.stringify(errInfo));

  // Only throw if the error is specifically due to missing or insufficient permissions
  const isPermissionError = 
    (error && typeof error === 'object' && 'code' in error && error.code === 'permission-denied') ||
    String(errInfo.error).toLowerCase().includes('permission') ||
    String(errInfo.error).toLowerCase().includes('insufficient');

  if (isPermissionError) {
    throw new Error(JSON.stringify(errInfo));
  }
}

// Validate Connection to Firestore on startup
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. Client is offline.");
    }
  }
}

// Google Sign-In helper with popup (recommended in skill)
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    toast.success("Connexion réussie !");
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error: ", error);
    toast.error("Erreur de connexion. Veuillez réessayer.");
    throw error;
  }
}

// Sign Out helper
export async function logout() {
  try {
    await signOut(auth);
    toast.success("Déconnexion réussie.");
  } catch (error) {
    console.error("Sign-Out Error: ", error);
    toast.error("Erreur de déconnexion.");
    throw error;
  }
}

// Upload images helper for listings
export async function uploadListingImage(file: File, userId: string): Promise<string> {
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 11)}.${fileExtension}`;
  const storageRef = ref(storage, `listings/${userId}/${fileName}`);
  
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

