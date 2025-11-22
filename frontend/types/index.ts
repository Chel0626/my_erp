// Types baseados na API Django

export interface Tenant {
  id: string;
  name: string;
  plan: 'basico' | 'profissional' | 'premium';
  plan_id?: string;
  subscription_status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
  trial_ends_at?: string | null;
  mp_subscription_id?: string | null;
  current_clients_count: number;
  current_services_count: number;
  is_trial_active: boolean;
  is_trial_expired: boolean;
  can_access_system: boolean;
  has_reached_client_limit: boolean;
  has_reached_service_limit: boolean;
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
