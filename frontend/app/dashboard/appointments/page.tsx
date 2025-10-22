/**
 * Página de Gerenciamento de Agendamentos
 * Lista, cria, edita e gerencia agendamentos
 */
'use client';

import { useState } from 'react';
import { Plus, Calendar as CalendarIcon, Filter, AlertCircle, LayoutGrid, CalendarDays } from 'lucide-react';
import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointment,
  useDeleteAppointment,
  useConfirmAppointment,
  useCancelAppointment,
  useStartAppointment,
  useCompleteAppointment,
  Appointment,
  CreateAppointmentInput,
  AppointmentFilters,
} from '@/hooks/useAppointments';
import { useServices } from '@/hooks/useServices';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import AppointmentCalendar from '@/components/appointments/AppointmentCalendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

export default function AppointmentsPage() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar'); // Nova: view mode
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Nova: data selecionada
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null); // Nova: visualizar detalhes
  const [showDetailsDialog, setShowDetailsDialog] = useState(false); // Nova: dialog de detalhes
  
  // Filtros
  const [filters, setFilters] = useState<AppointmentFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Queries e Mutations
  const { data: appointments = [], isLoading, error, refetch } = useAppointments(filters);
  const { data: services = [] } = useServices(true); // Serviços para o calendário
  const createMutation = useCreateAppointment();
  const updateMutation = useUpdateAppointment();
  const deleteMutation = useDeleteAppointment();
  const confirmMutation = useConfirmAppointment();
  const cancelMutation = useCancelAppointment();
  const startMutation = useStartAppointment();
  const completeMutation = useCompleteAppointment();

  // Garante que appointments é array
  const appointmentsList = Array.isArray(appointments) ? appointments : [];

  // Handlers
  const handleCreate = (date?: Date) => {
    setEditingAppointment(null);
    setSelectedDate(date || null);
    setShowDialog(true);
  };
  
  const handleCreateClick = () => handleCreate();

  const handleView = (appointment: Appointment) => {
    setViewingAppointment(appointment);
    setShowDetailsDialog(true);
  };

  const handleEditFromDetails = () => {
    if (viewingAppointment) {
      setShowDetailsDialog(false);
      setEditingAppointment(viewingAppointment);
      setViewingAppointment(null);
      setSelectedDate(null);
      setShowDialog(true);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setSelectedDate(null);
    setShowDialog(true);
  };

  const handleDelete = (appointment: Appointment) => {
    setDeletingAppointment(appointment);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingAppointment) return;

    try {
      await deleteMutation.mutateAsync(deletingAppointment.id);
      setShowDeleteConfirm(false);
      setDeletingAppointment(null);
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error);
      alert('Erro ao deletar agendamento.');
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      confirmMutation.confirm(id);
    } catch (error) {
      console.error('Erro ao confirmar:', error);
    }
  };

  const handleCancel = async (id: string) => {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
      try {
        cancelMutation.cancel(id);
      } catch (error) {
        console.error('Erro ao cancelar:', error);
      }
    }
  };

  const handleStart = async (id: string) => {
    try {
      startMutation.start(id);
    } catch (error) {
      console.error('Erro ao iniciar:', error);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      completeMutation.complete(id);
    } catch (error) {
      console.error('Erro ao concluir:', error);
    }
  };

  const handleSubmit = async (data: CreateAppointmentInput) => {
    try {
      console.log('📤 Enviando dados do agendamento:', data);
      
      if (editingAppointment) {
        await updateMutation.mutateAsync({
          id: editingAppointment.id,
          ...data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      setShowDialog(false);
      setEditingAppointment(null);
    } catch (error: any) {
      console.error('❌ Erro ao salvar agendamento:', error);
      console.error('📋 Detalhes do erro:', error?.response?.data);
      
      let errorMessage = 'Erro ao salvar agendamento. Tente novamente.';
      
      if (error?.response?.data) {
        const errors = error.response.data;
        console.error('🔍 Estrutura do erro:', errors);
        
        if (typeof errors === 'object') {
          errorMessage = Object.entries(errors)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
        } else if (typeof errors === 'string') {
          errorMessage = errors;
        }
      }
      
      alert(`❌ ${errorMessage}`);
    }
  };

  const handleFilterChange = (field: keyof AppointmentFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Agrupa agendamentos por data
  const groupedAppointments = appointmentsList.reduce((acc, appointment) => {
    const date = new Date(appointment.start_time).toLocaleDateString('pt-BR');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(appointment);
    return acc;
  }, {} as Record<string, Appointment[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agendamentos</h1>
          <p className="text-muted-foreground">
            Gerencie os agendamentos da sua empresa
          </p>
        </div>
        <div className="flex gap-2">
          {/* Toggle de visualização */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="rounded-r-none"
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Calendário
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Lista
            </Button>
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button onClick={handleCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filter-date">Data Específica</Label>
              <Input
                id="filter-date"
                type="date"
                value={filters.date || ''}
                onChange={(e) => handleFilterChange('date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-status">Status</Label>
              <select
                id="filter-status"
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Todos os status</option>
                <option value="marcado">Marcado</option>
                <option value="confirmado">Confirmado</option>
                <option value="em_atendimento">Em Atendimento</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
                <option value="falta">Falta</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex-1"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar agendamentos. Tente novamente.
            <Button variant="link" onClick={() => refetch()} className="ml-2">
              Recarregar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      )}

      {/* Lista Vazia */}
      {!isLoading && appointmentsList.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CalendarIcon className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Nenhum agendamento encontrado
          </h3>
          <p className="text-muted-foreground mb-4">
            {Object.keys(filters).length > 0
              ? 'Tente ajustar os filtros'
              : 'Comece criando seu primeiro agendamento'}
          </p>
          {Object.keys(filters).length === 0 && (
            <Button onClick={handleCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Agendamento
            </Button>
          )}
        </div>
      )}

      {/* Visualização de Calendário */}
      {!isLoading && appointmentsList.length > 0 && viewMode === 'calendar' && (
        <div className="calendar-wrapper">
          <AppointmentCalendar
            appointments={appointmentsList}
            services={Array.isArray(services) ? services : []}
            onEventClick={handleView}
            onDateClick={handleCreate}
            onEventDrop={async (appointmentId: string, newStart: Date) => {
              try {
                // Encontra o appointment completo pelo ID
                const appointment = appointmentsList.find(a => a.id === appointmentId);
                if (!appointment) return;

                await updateMutation.mutateAsync({
                  id: appointment.id,
                  customer_name: appointment.customer_name,
                  customer_phone: appointment.customer_phone,
                  customer_email: appointment.customer_email,
                  service_id: appointment.service_details?.id || appointment.service,
                  professional_id: appointment.professional_details?.id || appointment.professional,
                  start_time: newStart.toISOString(),
                  notes: appointment.notes,
                });
              } catch (error) {
                console.error('Erro ao reagendar:', error);
                alert('Erro ao reagendar agendamento.');
              }
            }}
          />
        </div>
      )}

      {/* Lista de Agendamentos (Agrupados por Data) */}
      {!isLoading && appointmentsList.length > 0 && viewMode === 'list' && (
        <div className="space-y-6">
          {Object.entries(groupedAppointments).map(([date, dayAppointments]) => (
            <div key={date} className="space-y-3">
              <h2 className="text-lg font-semibold text-muted-foreground flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {date}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dayAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                    onStart={handleStart}
                    onComplete={handleComplete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog Criar/Editar */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
            </DialogTitle>
            <DialogDescription>
              {editingAppointment
                ? 'Atualize as informações do agendamento'
                : 'Preencha os dados do novo agendamento'}
            </DialogDescription>
          </DialogHeader>
          
          <AppointmentForm
            appointment={editingAppointment || undefined}
            initialDate={selectedDate}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowDialog(false);
              setEditingAppointment(null);
              setSelectedDate(null);
            }}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog Visualizar Detalhes */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
            <DialogDescription>
              Informações completas do agendamento
            </DialogDescription>
          </DialogHeader>
          
          {viewingAppointment && (
            <div className="space-y-4">
              {/* Cliente */}
              <div>
                <Label className="text-sm font-semibold text-muted-foreground">Cliente</Label>
                <p className="text-base mt-1">{viewingAppointment.customer_name}</p>
              </div>

              {/* Contatos */}
              <div className="grid grid-cols-2 gap-4">
                {viewingAppointment.customer_phone && (
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground">Telefone</Label>
                    <p className="text-sm mt-1">{viewingAppointment.customer_phone}</p>
                  </div>
                )}
                {viewingAppointment.customer_email && (
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground">E-mail</Label>
                    <p className="text-sm mt-1">{viewingAppointment.customer_email}</p>
                  </div>
                )}
              </div>

              {/* Serviço */}
              <div>
                <Label className="text-sm font-semibold text-muted-foreground">Serviço</Label>
                <p className="text-base mt-1">
                  {viewingAppointment.service_details?.name || viewingAppointment.service}
                </p>
                {viewingAppointment.service_details?.price && (
                  <p className="text-sm text-muted-foreground">
                    R$ {viewingAppointment.service_details.price} • {viewingAppointment.service_details.duration_minutes} min
                  </p>
                )}
              </div>

              {/* Profissional */}
              <div>
                <Label className="text-sm font-semibold text-muted-foreground">Profissional</Label>
                <p className="text-base mt-1">
                  {viewingAppointment.professional_details?.name || viewingAppointment.professional}
                </p>
              </div>

              {/* Data e Hora */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">Início</Label>
                  <p className="text-sm mt-1">
                    {new Date(viewingAppointment.start_time).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">Término</Label>
                  <p className="text-sm mt-1">
                    {new Date(viewingAppointment.end_time).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div>
                <Label className="text-sm font-semibold text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    viewingAppointment.status === 'marcado' ? 'bg-blue-100 text-blue-800' :
                    viewingAppointment.status === 'confirmado' ? 'bg-green-100 text-green-800' :
                    viewingAppointment.status === 'em_atendimento' ? 'bg-yellow-100 text-yellow-800' :
                    viewingAppointment.status === 'concluido' ? 'bg-gray-100 text-gray-800' :
                    viewingAppointment.status === 'cancelado' ? 'bg-red-100 text-red-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {viewingAppointment.status === 'marcado' ? 'Marcado' :
                     viewingAppointment.status === 'confirmado' ? 'Confirmado' :
                     viewingAppointment.status === 'em_atendimento' ? 'Em Atendimento' :
                     viewingAppointment.status === 'concluido' ? 'Concluído' :
                     viewingAppointment.status === 'cancelado' ? 'Cancelado' :
                     'Falta'}
                  </span>
                </div>
              </div>

              {/* Observações */}
              {viewingAppointment.notes && (
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">Observações</Label>
                  <p className="text-sm mt-1 text-muted-foreground">{viewingAppointment.notes}</p>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailsDialog(false);
                    setViewingAppointment(null);
                  }}
                  className="flex-1"
                >
                  Fechar
                </Button>
                <Button
                  onClick={handleEditFromDetails}
                  className="flex-1"
                >
                  Editar Agendamento
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar Delete */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar o agendamento de{' '}
              <strong>{deletingAppointment?.customer_name}</strong>?
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeletingAppointment(null);
              }}
              className="flex-1"
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="flex-1"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deletando...' : 'Deletar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
