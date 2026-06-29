import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface AuthUser extends FirebaseUser {
  city?: string;
  isPremium?: boolean;
  phoneNumber?: string | null;
  displayName: string | null;
  rating?: number;
  totalRatings?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          let firestoreData: any = {};
          if (userDocSnap.exists()) {
            firestoreData = userDocSnap.data();
          } else {
            const newUserData = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || '',
              phoneNumber: firebaseUser.phoneNumber || '',
              city: "N'Djamena",
              isVerified: false,
              isPremium: false,
              rating: 0,
              totalRatings: 0,
              createdAt: serverTimestamp(),
              lastSeen: serverTimestamp()
            };
            await setDoc(userDocRef, newUserData);
            firestoreData = newUserData;
          }

          setUser({
            ...firebaseUser,
            city: firestoreData.city,
            isPremium: firestoreData.isPremium,
            rating: firestoreData.rating,
            totalRatings: firestoreData.totalRatings,
          } as AuthUser);
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          setUser(firebaseUser as AuthUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
