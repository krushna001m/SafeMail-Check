import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthState, AuthView } from '../types';
import {
  getAuthToken,
  loginUser,
  registerUser,
  getCurrentUserProfile,
  updateUserProfile,
  logoutUser,
  setSessionExpiredListener,
} from '../utils/api';

interface AuthContextType extends AuthState {
  authView: AuthView | null;
  resetToken: string | null;
  setAuthView: (view: AuthView | null) => void;
  setResetToken: (token: string | null) => void;
  login: (email: string, pass: string) => Promise<{ user: User; message: string }>;
  register: (name: string, email: string, pass: string, confirmPass?: string, org?: string) => Promise<{ user: User; message: string }>;
  logout: () => void;
  updateProfile: (name: string, org?: string) => Promise<User>;
  refreshUser: () => Promise<void>;
  dismissSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);
  const [authView, setAuthView] = useState<AuthView | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Check initial token and validate with backend
  const refreshUser = useCallback(async () => {
    const existingToken = getAuthToken();
    if (!existingToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const profile = await getCurrentUserProfile();
      setUser(profile);
      setToken(existingToken);
      setSessionExpired(false);
    } catch (err: any) {
      console.warn('Authentication token verification failed or expired:', err);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if URL has ?token= for reset password
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (tokenParam) {
      setResetToken(tokenParam);
      setAuthView('reset-password');
    }

    // Register session expired listener
    setSessionExpiredListener(() => {
      setUser(null);
      setToken(null);
      setSessionExpired(true);
    });

    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await loginUser(email, pass);
      setUser(data.user);
      setToken(data.token);
      setSessionExpired(false);
      setAuthView(null);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    pass: string,
    confirmPass?: string,
    org?: string
  ) => {
    setIsLoading(true);
    try {
      const data = await registerUser(name, email, pass, confirmPass, org);
      setUser(data.user);
      setToken(data.token);
      setSessionExpired(false);
      setAuthView(null);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    setToken(null);
    setAuthView(null);
  };

  const updateProfile = async (name: string, org?: string) => {
    const res = await updateUserProfile(name, org);
    setUser(res.user);
    return res.user;
  };

  const dismissSessionExpired = () => {
    setSessionExpired(false);
    setAuthView('login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        sessionExpired,
        authView,
        resetToken,
        setAuthView,
        setResetToken,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        dismissSessionExpired,
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
