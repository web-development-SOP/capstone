import React, { createContext, useContext, useState } from 'react';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (username: string, email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

const USERS_KEY = 'lib_users';
const SESSION_KEY = 'lib_session';

const loadUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const register = (
    username: string,
    email: string,
    password: string
  ): boolean => {
    const users = loadUsers();
    if (users.find((u) => u.email === email)) return false;

    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      email,
      password,
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    setUser(newUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return true;
  };

  const login = (email: string, password: string): boolean => {
    const found = loadUsers().find(
      (u) => u.email === email && u.password === password
    );
    if (!found) return false;
    setUser(found);
    localStorage.setItem(SESSION_KEY, JSON.stringify(found));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
