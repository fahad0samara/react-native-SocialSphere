import React, { createContext, useContext, useState, useEffect } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

interface User extends FirebaseAuthTypes.User {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

interface UserData {
  id: string;
  displayName: string;
  email: string;
  photoURL: string;
  bio: string;
  followers: string[];
  following: string[];
  posts: number;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      setUser(user as User);
      if (user) {
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          setUserData(userDoc.data() as UserData);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      await user.updateProfile({ displayName });

      const userData: UserData = {
        id: user.uid,
        displayName,
        email: user.email || '',
        photoURL: '',
        bio: '',
        followers: [],
        following: [],
        posts: 0,
      };

      await firestore().collection('users').doc(user.uid).set(userData);
      setUserData(userData);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await auth().signOut();
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (data: Partial<UserData>) => {
    if (!user) return;

    try {
      await firestore().collection('users').doc(user.uid).update(data);
      setUserData(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
