import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (contato: string, senha: string) => Promise<void>;
  register: (nome: string, contato: string, senha: string, estilo: 'direto' | 'detalhado') => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const me = await api.getMe();
      setUser(me);
    } catch {
      setUser(null);
      api.setToken(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const token = api.getToken();
      if (token) {
        await refreshUser();
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (contato: string, senha: string) => {
    const res = await api.login(contato, senha);
    setUser(res.usuario);
  };

  const register = async (nome: string, contato: string, senha: string, estilo: 'direto' | 'detalhado') => {
    const res = await api.register(nome, contato, senha, estilo);
    setUser(res.usuario);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
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
