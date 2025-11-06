'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment, Service } from '@/types';

export default function DashboardPage() {
  // Buscar agendamentos
  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: async () => {
      const res = await api.get('/scheduling/appointments/');
      return res.data.results || res.data || [];
    },
  });

  // Buscar serviços
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await api.get('/scheduling/services/');
      return res.data.results || res.data || [];
    },
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

  // Próximos agendamentos (próximos 7 dias)
  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const upcomingAppointments = appointmentsList
    .filter(apt => {
      const aptDate = new Date(apt.start_time);
      return (apt.status === 'marcado' || apt.status === 'confirmado') && 
             aptDate >= now && 
             aptDate <= sevenDaysLater;
    })
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'bg-blue-100 text-blue-800';
      case 'marcado':
        return 'bg-yellow-100 text-yellow-800';
      case 'em_atendimento':
        return 'bg-purple-100 text-purple-800';
      case 'concluido':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      case 'falta':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'Confirmado';
      case 'marcado':
        return 'Marcado';
      case 'em_atendimento':
        return 'Em Atendimento';
      case 'concluido':
        return 'Concluído';
      case 'cancelado':
        return 'Cancelado';
      case 'falta':
        return 'Falta';
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Compacto mobile */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      {/* KPI Cards - Grid responsivo */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Agendamentos Hoje
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{todayAppointments.length}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              {confirmedToday} confirmados
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Concluídos Hoje
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{completedToday}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              {cancelledToday} cancelados
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Receita Hoje
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              R$ {todayRevenue.toFixed(2)}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              {completedToday} serviços
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Serviços Ativos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{servicesList.length}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              Disponíveis para agendamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Próximos Agendamentos - Lista responsiva */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl">Próximos Agendamentos</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Visualização rápida dos agendamentos confirmados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-muted-foreground">
              <Calendar className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-50" />
              <p className="text-sm sm:text-base">Nenhum agendamento confirmado</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {upcomingAppointments.map((appointment) => {
                const service = servicesList.find(s => s.id === appointment.service);
                return (
                  <div
                    key={appointment.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 p-3 border rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 mt-0.5 sm:mt-0">
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">
                          {service?.name || 'Serviço desconhecido'}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-muted-foreground mt-0.5">
                          <span>
                            {format(new Date(appointment.start_time), "dd/MM/yyyy 'às' HH:mm")}
                          </span>
                          {service && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span>R$ {parseFloat(service.price).toFixed(2)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(appointment.status)} text-xs whitespace-nowrap self-start sm:self-center`}>
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
