import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import type { UserProfile } from '../types';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signOut: () => {},
  sendPasswordReset: async () => {},
});

const DEFAULT_USER_PROFILE: UserProfile = {
  id: '1',
  email: 'student@example.com',
  displayName: 'Study Buddy',
  avatarUrl: null,
  avatarColor: '#7c5cfc',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser({
      ...DEFAULT_USER_PROFILE,
      id: email,
      email,
      displayName: email.split('@')[0],
    });
    setIsLoading(false);
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser({
      id: email,
      email,
      displayName: `${firstName} ${lastName}`,
      avatarUrl: null,
      avatarColor: '#7c5cfc',
    });
    setIsLoading(false);
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 450));
    setUser({
      id: 'google-demo-user',
      email: 'studybuddy.google@example.com',
      displayName: 'Google Student',
      avatarUrl: null,
      avatarColor: '#7c5cfc',
    });
    setIsLoading(false);
  };

  const signOut = () => {
    setUser(null);
  };

  const sendPasswordReset = async (email: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLoading(false);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      sendPasswordReset,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
