import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

function toUser(fb: FirebaseUser): User {
  return {
    id: fb.uid,
    username: fb.displayName ?? fb.email?.split('@')[0] ?? 'User',
    email: fb.email ?? '',
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // true while Firebase resolves the persisted session on first load
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser(toUser(fbUser));
        // getIdToken returns the real Firebase JWT (Bearer token)
        const t = await fbUser.getIdToken();
        setToken(t);
      } else {
        setUser(null);
        setToken(null);
      }
      setIsLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    const { user: fbUser } = await signInWithEmailAndPassword(auth, email, password);
    const t = await fbUser.getIdToken();
    setToken(t);
  };

  const register = async (username: string, email: string, password: string) => {
    const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(fbUser, { displayName: username });
    const t = await fbUser.getIdToken();
    setToken(t);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
