import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import type { UserProfile } from '../types';
import { login, sendForgotPassword, signup } from '../api/auth';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
  sendPasswordReset: (email: string) => Promise<string>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signOut: () => {},
  sendPasswordReset: async () => '',
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await login(email, password);
      setToken(response.token);
      setUser({
        id: String(response.id),
        email: response.email,
        displayName: response.displayName,
        avatarUrl: response.avatarUrl || null,
        avatarColor: response.avatarColor || '#5b8dee',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true);
    try {
      const response = await signup(email, password, firstName, lastName);
      if (response.error) {
        throw new Error(response.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    throw new Error('Google sign-in is not wired on mobile yet.');
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
  };

  const sendPasswordReset = async (email: string) => {
    setIsLoading(true);
    try {
      const response = await sendForgotPassword(email);
      return response.message;
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      sendPasswordReset,
    }),
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
