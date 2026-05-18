import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_URL } from '@/constants/Config';
import { Platform } from 'react-native';
import { router } from 'expo-router';

type User = { id: string; name: string; role: string; email?: string; creditScore?: number; referralWallet?: number; walletBalance?: number };
type KycInput = {
  panNumber?: string;
  aadhaarNumber?: string;
  dateOfBirth?: string;
  occupation?: string;
  annualIncome?: string;
  nomineeName?: string;
  nomineeRelation?: string;
};
type AuthCtx = {
  user: User | null; token: string | null; loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone: string, address?: string, kyc?: KycInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx>({} as AuthCtx);
export const useAuth = () => useContext(AuthContext);

const storeToken = async (t: string) => {
  if (Platform.OS === 'web') { localStorage.setItem('token', t); }
  else { await SecureStore.setItemAsync('token', t); }
};
const getToken = async () => {
  if (Platform.OS === 'web') return localStorage.getItem('token');
  return SecureStore.getItemAsync('token');
};
const removeToken = async () => {
  if (Platform.OS === 'web') {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  }
  else {
    await SecureStore.deleteItemAsync('token');
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const t = token || await getToken();
    if (!t) return;
    try {
      const res = await axios.get(`${API_URL}/me`, { headers: { 'x-auth-token': t } });
      setUser(res.data);
    } catch (err) { console.error('refreshUser failed:', err); }
  };

  useEffect(() => {
    (async () => {
      const t = await getToken();
      if (t) {
        setToken(t);
        try {
          const res = await axios.get(`${API_URL}/me`, { headers: { 'x-auth-token': t } });
          setUser(res.data);
        } catch (err) { console.error('Token restore failed:', err); await removeToken(); }
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    await storeToken(res.data.token);
    setToken(res.data.token);
    const me = await axios.get(`${API_URL}/me`, { headers: { 'x-auth-token': res.data.token } });
    setUser(me.data);
  };

  const register = async (name: string, email: string, password: string, phone: string, address = '', kyc: KycInput = {}) => {
    const res = await axios.post(`${API_URL}/auth/register`, { name, email, password, phone, address, kyc });
    await storeToken(res.data.token);
    setToken(res.data.token);
    const me = await axios.get(`${API_URL}/me`, { headers: { 'x-auth-token': res.data.token } });
    setUser(me.data);
  };

  const logout = async () => {
    try {
      await removeToken();
      setToken(null);
      setUser(null);
      // Force immediate navigation with proper delay
      await new Promise(resolve => setTimeout(resolve, 50));
      router.replace('/(auth)/login');
    } catch (e) {
      console.error('Logout failed', e);
      await removeToken();
      setToken(null);
      setUser(null);
      router.replace('/(auth)/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
