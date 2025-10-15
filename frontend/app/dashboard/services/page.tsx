/**
 * Página de Gerenciamento de Serviços
 * Lista, cria, edita e deleta serviços
 */
'use client';

import { useState } from 'react';
import { Plus, Search, AlertCircle, Package } from 'lucide-react';
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
  usePatchService,
  Service,
  CreateServiceInput,
} from '@/hooks/useServices';
import { ServiceCard } from '@/components/services/ServiceCard';
import { ServiceForm } from '@/components/services/ServiceForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingService, setDeletingService] = useState<Service | null>(null);

  // Queries e Mutations
  const { data: services = [], isLoading, error, refetch } = useServices();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();
  const patchMutation = usePatchService();

  // Debug: verificar o que está vindo
  console.log('📊 Services data:', services);
  console.log('📊 Is Array?', Array.isArray(services));

  // Filtro de busca - garantir que services é array
  const filteredServices = Array.isArray(services) 
    ? services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Handlers
  const handleCreate = () => {
    setEditingService(null);
    setShowDialog(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setShowDialog(true);
  };

  const handleDelete = (service: Service) => {
    setDeletingService(service);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingService) return;

    try {
      await deleteMutation.mutateAsync(deletingService.id);
      setShowDeleteConfirm(false);
      setDeletingService(null);
    } catch (error) {
      console.error('Erro ao deletar serviço:', error);
      alert('Erro ao deletar serviço. Pode haver agendamentos vinculados.');
    }
  };

  const handleToggleStatus = async (service: Service) => {
    try {
      await patchMutation.mutateAsync({
        id: service.id,
        data: { is_active: !service.is_active },
      });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const handleSubmit = async (data: CreateServiceInput) => {
    try {
      if (editingService) {
        // Atualizar
        await updateMutation.mutateAsync({
          id: editingService.id,
          ...data,
        });
      } else {
        // Criar
        await createMutation.mutateAsync(data);
      }
      setShowDialog(false);
      setEditingService(null);
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      alert('Erro ao salvar serviço. Tente novamente.');
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie o catálogo de serviços da sua empresa
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar serviços por nome ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar serviços. Tente novamente.
            <Button variant="link" onClick={() => refetch()} className="ml-2">
              Recarregar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      )}

      {/* Lista Vazia */}
      {!isLoading && filteredServices.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm ? 'Nenhum serviço encontrado' : 'Nenhum serviço cadastrado'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? 'Tente buscar por outro termo'
              : 'Comece criando seu primeiro serviço'}
          </p>
          {!searchTerm && (
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Serviço
            </Button>
          )}
        </div>
      )}

      {/* Grid de Serviços */}
      {!isLoading && filteredServices.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* Dialog Criar/Editar */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </DialogTitle>
            <DialogDescription>
              {editingService
                ? 'Atualize as informações do serviço'
                : 'Preencha os dados do novo serviço'}
            </DialogDescription>
          </DialogHeader>
          
          <ServiceForm
            service={editingService || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowDialog(false);
              setEditingService(null);
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
              Tem certeza que deseja deletar o serviço{' '}
              <strong>{deletingService?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeletingService(null);
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

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Se houver agendamentos vinculados a este serviço, a exclusão falhará.
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    </div>
  );
}
