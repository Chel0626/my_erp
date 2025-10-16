/**
 * Página de Detalhes do Cliente
 * Visualização completa com estatísticas e histórico
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useCustomer,
  useCustomerStats,
  useCustomerAppointments,
  useUpdateCustomer,
  useActivateCustomer,
  useDeactivateCustomer,
  useDeleteCustomer,
} from '@/hooks/useCustomers';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { CustomerStats } from '@/components/customers/CustomerStats';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Edit,
  UserX,
  UserCheck,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Gift,
  FileText,
  Star,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const tagConfig = {
  VIP: { label: 'VIP', emoji: '⭐', className: 'bg-yellow-500 text-white' },
  REGULAR: { label: 'Regular', emoji: '👤', className: 'bg-blue-500 text-white' },
  NOVO: { label: 'Novo', emoji: '✨', className: 'bg-green-500 text-white' },
  INATIVO: { label: 'Inativo', emoji: '💤', className: 'bg-gray-500 text-white' },
};

export default function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';

  const [showEditDialog, setShowEditDialog] = useState(isEditMode);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: customer, isLoading } = useCustomer(params.id);
  const { data: stats } = useCustomerStats(params.id);
  const { data: appointments } = useCustomerAppointments(params.id);
  const updateCustomer = useUpdateCustomer();
  const activateCustomer = useActivateCustomer();
  const deactivateCustomer = useDeactivateCustomer();
  const deleteCustomer = useDeleteCustomer();

  useEffect(() => {
    setShowEditDialog(isEditMode);
  }, [isEditMode]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-64 bg-gray-200 rounded" />
          <div className="h-96 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold mb-2">Cliente não encontrado</h3>
            <Button onClick={() => router.push('/dashboard/customers')}>
              Voltar para Clientes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tagInfo = tagConfig[customer.tag];
  const initials = customer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleUpdateSubmit = (data: any) => {
    updateCustomer.mutate(
      { id: params.id, ...data },
      {
        onSuccess: () => {
          setShowEditDialog(false);
          router.replace(`/dashboard/customers/${params.id}`);
        },
      }
    );
  };

  const handleToggleActive = () => {
    if (customer.is_active) {
      deactivateCustomer.mutate(params.id);
    } else {
      activateCustomer.mutate(params.id);
    }
  };

  const handleDelete = () => {
    deleteCustomer.mutate(params.id, {
      onSuccess: () => {
        router.push('/dashboard/customers');
      },
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/customers')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button
            variant={customer.is_active ? 'outline' : 'default'}
            onClick={handleToggleActive}
          >
            {customer.is_active ? (
              <>
                <UserX className="mr-2 h-4 w-4" />
                Desativar
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Ativar
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Customer Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <Avatar className="h-32 w-32">
              <AvatarImage src={customer.avatar_url} alt={customer.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{customer.name}</h1>
                  <Badge className={tagInfo.className}>
                    {tagInfo.emoji} {tagInfo.label}
                  </Badge>
                  {!customer.is_active && (
                    <Badge variant="outline">Inativo</Badge>
                  )}
                  {customer.is_birthday_month && (
                    <Badge variant="secondary" className="bg-pink-100">
                      <Gift className="h-3 w-3 mr-1" />
                      Aniversariante
                    </Badge>
                  )}
                </div>
                {customer.age && (
                  <p className="text-muted-foreground">
                    {customer.age} anos
                    {customer.birth_date &&
                      ` - ${format(new Date(customer.birth_date), "dd 'de' MMMM", { locale: ptBR })}`}
                  </p>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contato */}
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Contato
                  </h3>
                  <p className="text-sm">{customer.phone}</p>
                  {customer.phone_secondary && (
                    <p className="text-sm text-muted-foreground">
                      {customer.phone_secondary}
                    </p>
                  )}
                  {customer.email && (
                    <p className="text-sm flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {customer.email}
                    </p>
                  )}
                </div>

                {/* Endereço */}
                {customer.full_address && customer.full_address !== 'Endereço não cadastrado' && (
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Endereço
                    </h3>
                    <p className="text-sm">{customer.full_address}</p>
                  </div>
                )}

                {/* Última Visita */}
                {customer.last_visit && (
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Última Visita
                    </h3>
                    <p className="text-sm">
                      {format(new Date(customer.last_visit), "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                )}

                {/* Preferências */}
                {customer.preferences && (
                  <div className="space-y-2 md:col-span-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Preferências
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {customer.preferences}
                    </p>
                  </div>
                )}

                {/* Notas */}
                {customer.notes && (
                  <div className="space-y-2 md:col-span-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Observações
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {customer.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="stats" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          <TabsTrigger value="appointments">
            Histórico ({appointments?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          {stats ? (
            <CustomerStats stats={stats} />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Nenhuma estatística disponível
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="appointments">
          {appointments && appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment: any) => (
                <Card key={appointment.id}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{appointment.service_name}</span>
                      <Badge>{appointment.status}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Data:</span>
                        <p className="font-semibold">
                          {format(
                            new Date(appointment.start_time),
                            "dd/MM/yyyy 'às' HH:mm",
                            { locale: ptBR }
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Profissional:
                        </span>
                        <p className="font-semibold">
                          {appointment.professional_name}
                        </p>
                      </div>
                      {appointment.notes && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">
                            Observações:
                          </span>
                          <p>{appointment.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Nenhum agendamento encontrado
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <CardTitle>Histórico Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              {appointments && appointments.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">
                          R$ {appointments
                            .filter((a: any) => a.status === 'concluido' && a.final_price)
                            .reduce((sum: number, a: any) => sum + parseFloat(a.final_price || '0'), 0)
                            .toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">Total Gasto</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                          {appointments.filter((a: any) => a.status === 'concluido').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Serviços Concluídos</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-orange-600">
                          R$ {appointments
                            .filter((a: any) => a.status === 'concluido' && a.final_price)
                            .reduce((sum: number, a: any) => sum + parseFloat(a.final_price || '0'), 0) / 
                            Math.max(appointments.filter((a: any) => a.status === 'concluido').length, 1) || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Ticket Médio</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Transações</h3>
                    {appointments
                      .filter((a: any) => a.status === 'concluido' && a.final_price)
                      .map((appointment: any) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{appointment.service_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(appointment.start_time), "dd/MM/yyyy 'às' HH:mm", {
                                locale: ptBR,
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {appointment.is_paid && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Pago
                              </Badge>
                            )}
                            <span className="text-lg font-semibold text-green-600">
                              R$ {parseFloat(appointment.final_price || '0').toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  Nenhuma transação encontrada
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Atualize as informações do cliente
            </DialogDescription>
          </DialogHeader>
          <CustomerForm
            customer={customer}
            onSubmit={handleUpdateSubmit}
            onCancel={() => {
              setShowEditDialog(false);
              router.replace(`/dashboard/customers/${params.id}`);
            }}
            isLoading={updateCustomer.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente <strong>{customer.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
