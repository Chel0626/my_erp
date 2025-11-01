/**
 * Cliente API para integração com Django Backend
 * Inclui interceptors para JWT e tratamento de erros
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Cria instância do axios
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de requisição - adiciona token JWT
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Verifica se está no cliente (browser)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta - trata refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Se erro 401 e não é retry, tenta refresh
    if (error.response?.status === 401 && !originalRequest._retry && typeof window !== 'undefined') {
      // Não tenta refresh se a URL já for de refresh (evita loop)
      if (originalRequest.url?.includes('/auth/refresh/')) {
        console.error('🔴 Refresh token inválido ou expirado');
        // Limpa tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        document.cookie = 'access_token=; path=/; max-age=0';
        document.cookie = 'refresh_token=; path=/; max-age=0';
        
        // Só redireciona se não estiver já na página de login/signup
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/signup')) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);
        
        // Atualiza cookie também
        document.cookie = `access_token=${access}; path=/; max-age=3600`;

        // Retry request original com novo token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        console.error('🔴 Erro ao renovar token:', refreshError);
        // Refresh falhou - limpa tokens e redireciona para login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        document.cookie = 'access_token=; path=/; max-age=0';
        document.cookie = 'refresh_token=; path=/; max-age=0';
        
        // Previne loops - só redireciona se não estiver já na página de login/signup
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/signup')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Funções de API - Autenticação

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login/', { email, password });
    return response.data;
  },

  signup: async (data: { email: string; password: string; name: string; company_name: string }) => {
    const response = await api.post('/core/auth/signup/', data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/core/users/me/');
    return response.data;
  },
};

// Funções de API - Tenants

export const tenantApi = {
  getMyTenant: async () => {
    const response = await api.get('/core/tenants/my_tenant/');
    return response.data;
  },
};

// Funções de API - Usuários

export const userApi = {
  list: async () => {
    const response = await api.get('/core/users/');
    return response.data;
  },

  invite: async (data: { email: string; name: string; role: string }) => {
    const response = await api.post('/core/users/invite/', data);
    return response.data;
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await api.post('/core/users/change_password/', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  },
};

// Funções de API - Serviços

export const serviceApi = {
  list: async () => {
    const response = await api.get('/scheduling/services/');
    return response.data;
  },

  active: async () => {
    const response = await api.get('/scheduling/services/active/');
    return response.data;
  },

  create: async (data: { name: string; description?: string; price: number; duration_minutes: number; is_active?: boolean }) => {
    const response = await api.post('/scheduling/services/', data);
    return response.data;
  },

  update: async (id: string, data: Partial<{ name: string; description?: string; price: number; duration_minutes: number; is_active?: boolean }>) => {
    const response = await api.patch(`/scheduling/services/${id}/`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/scheduling/services/${id}/`);
    return response.data;
  },
};

// Funções de API - Agendamentos

export const appointmentApi = {
  list: async (params?: { date?: string; start_date?: string; end_date?: string; status?: string; professional?: string }) => {
    const response = await api.get('/scheduling/appointments/', { params });
    return response.data;
  },

  today: async () => {
    const response = await api.get('/scheduling/appointments/today/');
    return response.data;
  },

  week: async () => {
    const response = await api.get('/scheduling/appointments/week/');
    return response.data;
  },

  create: async (data: {
    customer_name: string;
    customer_phone?: string;
    customer_email?: string;
    service_id: string;
    professional_id: string;
    start_time: string;
    notes?: string;
  }) => {
    const response = await api.post('/scheduling/appointments/', data);
    return response.data;
  },

  update: async (id: string, data: Partial<{
    customer_name: string;
    customer_phone?: string;
    customer_email?: string;
    service_id: string;
    professional_id: string;
    start_time: string;
    notes?: string;
  }>) => {
    const response = await api.patch(`/scheduling/appointments/${id}/`, data);
    return response.data;
  },

  confirm: async (id: string) => {
    const response = await api.post(`/scheduling/appointments/${id}/confirm/`);
    return response.data;
  },

  start: async (id: string) => {
    const response = await api.post(`/scheduling/appointments/${id}/start/`);
    return response.data;
  },

  complete: async (id: string) => {
    const response = await api.post(`/scheduling/appointments/${id}/complete/`);
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await api.post(`/scheduling/appointments/${id}/cancel/`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/scheduling/appointments/${id}/`);
    return response.data;
  },
};

export default api;
