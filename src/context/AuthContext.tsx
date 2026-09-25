import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthState } from '../types';
import { authService } from '../services/auth.service';

interface AuthContextType extends AuthState {
  login: (email: string, roleSelection: 'Admin' | 'User', rememberMe: boolean, password?: string) => Promise<{ success: boolean; requiresOtp?: boolean; error?: string }>;
  register: (email: string, name: string, role: 'Admin' | 'User', password?: string) => Promise<{ success: boolean; requiresOtp: boolean }>;
  verifyOtp: (email: string, code: string) => Promise<{ success: boolean; user: User; token: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean }>;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean }>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Load user session on mount
  useEffect(() => {
    const loadSession = () => {
      try {
        const savedToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        const savedUserStr = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');

        if (savedToken && savedUserStr) {
          const user = JSON.parse(savedUserStr) as User;
          setAuthState({
            user,
            token: savedToken,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      } catch (err) {
        console.error('Failed to load auth session:', err);
      }
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    };

    loadSession();
  }, []);


  const login = async (
    email: string,
    roleSelection: 'Admin' | 'User',
    _rememberMe: boolean,
    password?: string
  ): Promise<{ success: boolean; requiresOtp?: boolean; error?: string }> => {
    try {
      const response = await authService.login(email, roleSelection, password);
      if (response.data.otpSent) {
        return { success: true, requiresOtp: true };
      }
      return { success: false, error: 'Failed to verify account' };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Login failed';
      return { success: false, error: errorMsg };
    }
  };

  const verifyOtp = async (email: string, code: string): Promise<{ success: boolean; user: User; token: string }> => {
    try {
      const response = await authService.verifyOtp(email, code);
      const { token, user } = response.data;
      if (user && user.role) {
        user.role = user.role.toUpperCase() === 'ADMIN' ? 'Admin' : 'User';
      }

      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));

      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true, user, token };
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Invalid OTP code.');
    }
  };

  const register = async (email: string, name: string, role: 'Admin' | 'User', password?: string): Promise<{ success: boolean; requiresOtp: boolean }> => {
    try {
      await authService.register(email, name, role, password);
      return { success: true, requiresOtp: true };
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Registration failed.');
    }
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean }> => {
    try {
      await authService.forgotPassword(email);
      return { success: true };
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Forgot password failed.');
    }
  };

  const resetPassword = async (email: string, newPassword: string): Promise<{ success: boolean }> => {
    try {
      await authService.resetPassword(email, newPassword);
      return { success: true };
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Reset password failed.');
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const updateUser = (updatedUser: Partial<User>) => {
    setAuthState((prev) => {
      if (!prev.user) return prev;
      const newUser = { ...prev.user, ...updatedUser };
      localStorage.setItem('auth_user', JSON.stringify(newUser));
      return {
        ...prev,
        user: newUser
      };
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, register, verifyOtp, forgotPassword, resetPassword, logout, updateUser }}>
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
