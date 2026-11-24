import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Wallet } from '../types';
import { authApi } from '../services/auth.service';
import { walletApi } from '../services/wallet.service';

interface AuthContextType {
  user: User | null;
  wallet: Wallet | null;
  token: string | null;
  isLoading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; fullName: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  refreshWallet: () => Promise<void>;
  submitKyc: (data: { panNumber: string; aadhaarNumber: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('shifty50_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('shifty50_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshWallet = async () => {
    if (!token || user?.kycStatus !== 'ACTIVE') return;
    try {
      const res = await walletApi.getWallet();
      if (res.success && res.data) {
        setWallet(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch wallet info', err);
    }
  };

  const refreshProfile = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await authApi.getMe();
      if (res.success && res.data) {
        setUser(res.data.user);
        localStorage.setItem('shifty50_user', JSON.stringify(res.data.user));
        if (res.data.user.kycStatus === 'ACTIVE') {
          await refreshWallet();
        }
      }
    } catch (err) {
      console.error('Failed to fetch user session', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, [token]);

  const login = async (data: { email: string; password: string }) => {
    const res = await authApi.login(data);
    if (res.success && res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('shifty50_token', res.data.token);
      localStorage.setItem('shifty50_user', JSON.stringify(res.data.user));
      if (res.data.user.kycStatus === 'ACTIVE') {
        const walletRes = await walletApi.getWallet();
        if (walletRes.success) setWallet(walletRes.data);
      }
    }
  };

  const register = async (data: { email: string; password: string; fullName: string }) => {
    const res = await authApi.register(data);
    if (res.success && res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('shifty50_token', res.data.token);
      localStorage.setItem('shifty50_user', JSON.stringify(res.data.user));
    }
  };

  const submitKyc = async (data: { panNumber: string; aadhaarNumber: string }) => {
    const res = await authApi.submitKyc(data);
    if (res.success && res.data) {
      setUser(res.data.user);
      localStorage.setItem('shifty50_user', JSON.stringify(res.data.user));
      if (res.data.wallet) {
        setWallet(res.data.wallet);
      } else {
        await refreshWallet();
      }
    }
  };

  const logout = () => {
    setUser(null);
    setWallet(null);
    setToken(null);
    localStorage.removeItem('shifty50_token');
    localStorage.removeItem('shifty50_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        wallet,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        refreshWallet,
        submitKyc,
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
