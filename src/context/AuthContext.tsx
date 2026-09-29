import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<boolean>;
  signOutUser: () => Promise<void>;
  updateUserRole: (role: UserRole) => Promise<void>;
  updateUserFacility: (facility: string) => Promise<void>;
  isDemoUser: boolean;
  setDemoUser: (profile: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);
  const isSigningInRef = useRef<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsDemoUser(false);
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            // First time login - initialize profile in Firestore
            const initialProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || 'operator@goldenminutes.ems',
              displayName: currentUser.displayName || 'EMS Operator',
              photoURL: currentUser.photoURL || '',
              role: 'dispatcher',
              assignedFacility: 'Central CAD Node 01',
              badgeId: `CAD-${Math.floor(1000 + Math.random() * 9000)}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userRef, initialProfile);
            setUserProfile(initialProfile);
          }
        } catch (err) {
          // Graceful fallback to client-side profile if Firestore query is unavailable
          setUserProfile({
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Authorized User',
            photoURL: currentUser.photoURL || '',
            role: 'dispatcher',
            assignedFacility: 'Central CAD Node 01',
            badgeId: 'CAD-8841',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<boolean> => {
    // Prevent overlapping concurrent popup requests
    if (isSigningInRef.current) {
      return false;
    }

    isSigningInRef.current = true;
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedUser = result.user;
      const userRef = doc(db, 'users', loggedUser.uid);

      try {
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
          const newProfile: UserProfile = {
            uid: loggedUser.uid,
            email: loggedUser.email || '',
            displayName: loggedUser.displayName || 'EMS Responder',
            photoURL: loggedUser.photoURL || '',
            role: 'dispatcher',
            assignedFacility: 'Central CAD Node 01',
            badgeId: `CAD-${Math.floor(1000 + Math.random() * 9000)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await setDoc(userRef, newProfile);
          setUserProfile(newProfile);
        } else {
          setUserProfile(docSnap.data() as UserProfile);
        }
      } catch (firestoreError) {
        // Fallback user profile in memory if Firestore write is delayed
        setUserProfile({
          uid: loggedUser.uid,
          email: loggedUser.email || '',
          displayName: loggedUser.displayName || 'EMS Responder',
          photoURL: loggedUser.photoURL || '',
          role: 'dispatcher',
          assignedFacility: 'Central CAD Node 01',
          badgeId: 'CAD-8841',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      return true;
    } catch (error: any) {
      const code = error?.code || '';
      const message = error?.message || '';

      // Gracefully handle expected user cancellations and duplicate popup closures without noisy console errors
      if (
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/popup-closed-by-user' ||
        message.includes('cancelled-popup-request') ||
        message.includes('popup-closed-by-user')
      ) {
        return false;
      }

      // Log informative warning for other auth outcomes (e.g. popup blocked by browser settings)
      console.warn('Google Sign-In notice:', message);
      return false;
    } finally {
      isSigningInRef.current = false;
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setIsDemoUser(false);
    } catch (error) {
      console.warn('Sign-out notice:', error);
    }
  };

  const updateUserRole = async (newRole: UserRole) => {
    if (userProfile) {
      const updated = { ...userProfile, role: newRole, updatedAt: new Date().toISOString() };
      setUserProfile(updated);
      if (user && !isDemoUser) {
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, { role: newRole, updatedAt: new Date().toISOString() });
        } catch {
          // Keep local state updated
        }
      }
    }
  };

  const updateUserFacility = async (facility: string) => {
    if (userProfile) {
      const updated = { ...userProfile, assignedFacility: facility, updatedAt: new Date().toISOString() };
      setUserProfile(updated);
      if (user && !isDemoUser) {
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, { assignedFacility: facility, updatedAt: new Date().toISOString() });
        } catch {
          // Keep local state updated
        }
      }
    }
  };

  const setDemoUser = (profile: UserProfile | null) => {
    setUserProfile(profile);
    setIsDemoUser(!!profile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInWithGoogle,
        signOutUser,
        updateUserRole,
        updateUserFacility,
        isDemoUser,
        setDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
