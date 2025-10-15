/**
 * Página de Gerenciamento de Agendamentos
 * Lista, cria, edita e gerencia agendamentos
 */
'use client';

import { useState } from 'react';
import { Plus, Calendar as CalendarIcon, Filter, AlertCircle } from 'lucide-react';
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
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
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
  
  // Filtros
  const [filters, setFilters] = useState<AppointmentFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Queries e Mutations
  const { data: appointments = [], isLoading, error, refetch } = useAppointments(filters);
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
  const handleCreate = () => {
    setEditingAppointment(null);
    setShowDialog(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
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
      console.error('Erro ao salvar agendamento:', error);
      
      let errorMessage = 'Erro ao salvar agendamento. Tente novamente.';
      
      if (error?.response?.data) {
        const errors = error.response.data;
        if (typeof errors === 'object') {
          errorMessage = Object.values(errors).flat().join(', ');
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
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button onClick={handleCreate}>
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
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Agendamento
            </Button>
          )}
        </div>
      )}

      {/* Lista de Agendamentos (Agrupados por Data) */}
      {!isLoading && appointmentsList.length > 0 && (
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
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowDialog(false);
              setEditingAppointment(null);
            }}
            isLoading={isSubmitting}
          />
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
