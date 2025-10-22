// Types baseados na API Django

export interface Tenant {
  id: string;
  name: string;
  plan: 'basico' | 'premium';
  is_active: boolean;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  tenant: string;
  tenant_name?: string;
  role: 'admin' | 'barbeiro' | 'caixa' | 'atendente' | 'superadmin';
  is_active: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: string;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

export interface ServiceDetails extends Service {}

export interface Appointment {
  id: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  service: string;
  service_details?: ServiceDetails;
  professional: string;
  professional_details?: User;
  start_time: string;
  end_time?: string;
  status: 'marcado' | 'confirmado' | 'em_atendimento' | 'concluido' | 'cancelado' | 'falta';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  company_name: string;
}

export interface SignUpResponse {
  user: User;
  tenant: Tenant;
  tokens: AuthTokens;
}

export interface CreateAppointmentRequest {
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  service_id: string;
  professional_id: string;
  start_time: string;
  notes?: string;
}

export interface InviteUserRequest {
  email: string;
  name: string;
  role: 'barbeiro' | 'caixa' | 'atendente';
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  is_active?: boolean;
}

export interface ApiError {
  detail?: string;
  [key: string]: any;
}
