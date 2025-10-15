'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment, Service } from '@/types';

export default function DashboardPage() {
  // Buscar agendamentos
  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: () => api.get('/scheduling/appointments/').then(res => res.data),
  });

  // Buscar serviços
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: () => api.get('/scheduling/services/').then(res => res.data),
  });

  // Garantir que appointments é um array
  const appointmentsList = Array.isArray(appointments) ? appointments : [];
  const servicesList = Array.isArray(services) ? services : [];

  // Calcular KPIs
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointmentsList.filter(apt => apt.start_time.split('T')[0] === today);
  const confirmedToday = todayAppointments.filter(apt => apt.status === 'confirmado').length;
  const completedToday = todayAppointments.filter(apt => apt.status === 'concluido').length;
  const cancelledToday = todayAppointments.filter(apt => apt.status === 'cancelado').length;

  // Calcular receita estimada do dia
  const todayRevenue = todayAppointments
    .filter(apt => apt.status === 'concluido')
    .reduce((sum, apt) => {
      const service = servicesList.find(s => s.id === apt.service);
      return sum + (service ? parseFloat(service.price) : 0);
    }, 0);

  // Próximos agendamentos
  const upcomingAppointments = appointmentsList
    .filter(apt => apt.status === 'confirmado' && apt.start_time >= new Date().toISOString())
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      case 'pending':
        return 'Pendente';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              {confirmedToday} confirmados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos Hoje</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedToday}</div>
            <p className="text-xs text-muted-foreground">
              {cancelledToday} cancelados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {todayRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {completedToday} serviços
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serviços Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{servicesList.length}</div>
            <p className="text-xs text-muted-foreground">
              Disponíveis para agendamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Próximos Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Agendamentos</CardTitle>
          <CardDescription>
            Visualização rápida dos agendamentos confirmados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum agendamento confirmado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => {
                const service = servicesList.find(s => s.id === appointment.service);
                return (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {service?.name || 'Serviço desconhecido'}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            {format(new Date(appointment.start_time), "dd/MM/yyyy 'às' HH:mm")}
                          </span>
                          {service && (
                            <>
                              <span>•</span>
                              <span>R$ {parseFloat(service.price).toFixed(2)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {getStatusLabel(appointment.status)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
