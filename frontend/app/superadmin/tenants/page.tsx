'use client';

import { useTenants, useSuspendTenant, useActivateTenant } from '@/hooks/useSuperAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  CheckCircle2,
  XCircle,
  Ban,
  PlayCircle
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function TenantsPage() {
  const { data: tenants, isLoading } = useTenants();
  const suspendTenant = useSuspendTenant();
  const activateTenant = useActivateTenant();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleSuspend = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja suspender o tenant "${name}"?`)) {
      return;
    }

    setActionLoading(id);
    try {
      await suspendTenant.mutateAsync(id);
      toast.success(`Tenant "${name}" suspenso com sucesso!`);
    } catch (error) {
      toast.error('Erro ao suspender tenant');
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (id: string, name: string) => {
    setActionLoading(id);
    try {
      await activateTenant.mutateAsync(id);
      toast.success(`Tenant "${name}" ativado com sucesso!`);
    } catch (error) {
      toast.error('Erro ao ativar tenant');
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-600">Ativa</Badge>;
      case 'trial':
        return <Badge className="bg-blue-600">Trial</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspensa</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expirada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Gerenciamento de Tenants
          </h1>
          <p className="text-muted-foreground mt-1">
            Total de {tenants?.length || 0} empresa(s) cadastrada(s)
          </p>
        </div>
      </div>

      {/* Tenants Grid */}
      {tenants && tenants.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant) => (
            <Card key={tenant.id} className={!tenant.is_active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {tenant.name}
                      {tenant.is_active ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      ID: {tenant.id}
                    </p>
                  </div>
                  {getStatusBadge(tenant.subscription_status || 'N/A')}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{tenant.user_count}</p>
                      <p className="text-xs text-muted-foreground">Usuários</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">{tenant.plan}</p>
                    <p className="text-xs text-muted-foreground">Plano</p>
                  </div>
                </div>

                {/* Info */}
                <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
                  <p>Criado em: {new Date(tenant.created_at).toLocaleDateString('pt-BR')}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {tenant.is_active ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleSuspend(tenant.id, tenant.name)}
                      disabled={actionLoading === tenant.id}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      {actionLoading === tenant.id ? 'Suspendendo...' : 'Suspender'}
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleActivate(tenant.id, tenant.name)}
                      disabled={actionLoading === tenant.id}
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      {actionLoading === tenant.id ? 'Ativando...' : 'Ativar'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhum tenant cadastrado</p>
            <p className="text-sm text-muted-foreground mt-1">
              Os tenants aparecerão aqui quando forem criados
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
