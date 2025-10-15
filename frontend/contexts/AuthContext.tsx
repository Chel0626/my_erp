'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, tenantApi } from '@/lib/api';
import type { User, Tenant, AuthTokens } from '@/types';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, companyName: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Carrega dados do usuário ao montar
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      console.log('🔑 Token encontrado:', accessToken ? 'Sim' : 'Não');
      
      if (!accessToken) {
        setLoading(false);
        return;
      }

      // Busca dados do usuário
      console.log('📡 Buscando dados do usuário...');
      const userData = await authApi.getCurrentUser();
      console.log('👤 Dados do usuário:', userData);
      setUser(userData);

      // Busca dados do tenant
      console.log('📡 Buscando dados do tenant...');
      const tenantData = await tenantApi.getMyTenant();
      console.log('🏢 Dados do tenant:', tenantData);
      setTenant(tenantData);
    } catch (error) {
      console.error('❌ Erro ao carregar usuário:', error);
      // Limpa tokens se houver erro
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Iniciando login...', { email });
      const data = await authApi.login(email, password);
      console.log('✅ Login bem-sucedido, dados recebidos:', data);
      
      // Salva tokens
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      console.log('💾 Tokens salvos no localStorage');

      // Carrega dados do usuário
      console.log('👤 Carregando dados do usuário...');
      await loadUser();
      console.log('✅ Dados do usuário carregados');

      // Redireciona para dashboard
      console.log('🚀 Redirecionando para dashboard...');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      throw new Error(error.response?.data?.detail || 'Erro ao fazer login');
    }
  };

  const signup = async (name: string, email: string, password: string, companyName: string) => {
    try {
      const data = await authApi.signup({
        email,
        password,
        name,
        company_name: companyName,
      });

      // Salva tokens
      localStorage.setItem('access_token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);

      // Define usuário e tenant
      setUser(data.user);
      setTenant(data.tenant);

      // Redireciona para dashboard
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      throw new Error(error.response?.data?.detail || 'Erro ao criar conta');
    }
  };

  const logout = () => {
    // Limpa tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Limpa estado
    setUser(null);
    setTenant(null);

    // Redireciona para login
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    tenant,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
