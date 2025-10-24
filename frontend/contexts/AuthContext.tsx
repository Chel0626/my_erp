'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, tenantApi } from '@/lib/api';
import type { User, Tenant } from '@/types';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, companyName: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const router = useRouter();

  // Carrega dados do usuário ao montar
  useEffect(() => {
    const initAuth = async () => {
      if (isLoadingUser) return; // Evita múltiplas chamadas simultâneas
      await loadUser();
    };
    initAuth();
  }, []); // Array vazio - executa apenas uma vez

  const loadUser = async () => {
    if (isLoadingUser) return; // Previne chamadas simultâneas
    
    try {
      setIsLoadingUser(true);
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        setLoading(false);
        setIsLoadingUser(false);
        return;
      }

      // Busca dados do usuário
      const userData = await authApi.getCurrentUser();
      setUser(userData);

      // Busca dados do tenant (apenas se não for superadmin)
      if (userData.role !== 'superadmin') {
        try {
          const tenantData = await tenantApi.getMyTenant();
          setTenant(tenantData);
        } catch (error) {
          console.warn('⚠️ Erro ao buscar tenant:', error);
          // Superadmin não tem tenant, isso é normal
          setTenant(null);
        }
      } else {
        // Superadmin não tem tenant
        setTenant(null);
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar usuário:', error);
      
      // Se o erro for 401, significa que os tokens estão inválidos/expirados
      if (error.response?.status === 401) {
        console.warn('🔑 Tokens expirados ou inválidos - limpando autenticação');
      }
      
      // Limpa tokens se houver erro
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      document.cookie = 'access_token=; path=/; max-age=0';
      document.cookie = 'refresh_token=; path=/; max-age=0';
      setUser(null);
      setTenant(null);
    } finally {
      setLoading(false);
      setIsLoadingUser(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await authApi.login(email, password);
      
      // Salva tokens no localStorage
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      
      // Salva também nos cookies para o middleware funcionar
      document.cookie = `access_token=${data.access}; path=/; max-age=3600`; // 1 hora
      document.cookie = `refresh_token=${data.refresh}; path=/; max-age=86400`; // 24 horas

      // Carrega dados do usuário
      await loadUser();

      // Busca dados do usuário para redirecionar corretamente
      const userData = await authApi.getCurrentUser();

      // Redireciona baseado no role
      if (userData.role === 'superadmin') {
        router.push('/superadmin');
      } else {
        router.push('/dashboard');
      }
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

      // Salva tokens no localStorage
      localStorage.setItem('access_token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      
      // Salva também nos cookies para o middleware funcionar
      document.cookie = `access_token=${data.tokens.access}; path=/; max-age=3600`;
      document.cookie = `refresh_token=${data.tokens.refresh}; path=/; max-age=86400`;

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
    // Limpa tokens do localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Limpa cookies
    document.cookie = 'access_token=; path=/; max-age=0';
    document.cookie = 'refresh_token=; path=/; max-age=0';
    
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
    isSuperAdmin: user?.role === 'superadmin',
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
