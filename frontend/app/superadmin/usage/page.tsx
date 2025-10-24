'use client';

import { useUsageStats } from '@/hooks/useSuperAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3,
  Users,
  Calendar,
  TrendingUp,
  DollarSign,
  Database,
  Building2
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function UsageStatsPage() {
  const { data: stats, isLoading } = useUsageStats();

  // Garante que stats é um array
  const statsArray = Array.isArray(stats) ? stats : [];

  // Group stats by tenant
  const statsByTenant = statsArray.reduce((acc, stat) => {
    if (!acc[stat.tenant_name]) {
      acc[stat.tenant_name] = [];
    }
    acc[stat.tenant_name].push(stat);
    return acc;
  }, {} as Record<string, typeof statsArray>);

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
            <BarChart3 className="h-8 w-8" />
            Estatísticas de Uso
          </h1>
          <p className="text-muted-foreground mt-1">
            Métricas de uso por tenant
          </p>
        </div>
      </div>

      {/* Stats by Tenant */}
      {statsByTenant && Object.keys(statsByTenant).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(statsByTenant).map(([tenantName, tenantStats]) => {
            // Calculate totals for this tenant
            const totals = tenantStats.reduce(
              (acc, stat) => {
                acc.totalUsers += stat.total_users;
                acc.activeUsers += stat.active_users;
                acc.totalAppointments += stat.total_appointments;
                acc.completedAppointments += stat.completed_appointments;
                acc.totalRevenue += parseFloat(stat.total_revenue);
                acc.totalCustomers += stat.total_customers;
                acc.newCustomers += stat.new_customers;
                acc.apiCalls += stat.api_calls;
                acc.storageUsed += stat.storage_used_mb;
                return acc;
              },
              {
                totalUsers: 0,
                activeUsers: 0,
                totalAppointments: 0,
                completedAppointments: 0,
                totalRevenue: 0,
                totalCustomers: 0,
                newCustomers: 0,
                apiCalls: 0,
                storageUsed: 0,
              }
            );

            // Get latest stat for current data
            const latestStat = tenantStats[0];

            return (
              <Card key={tenantName}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {tenantName}
                    </CardTitle>
                    <Badge variant="outline">
                      {tenantStats.length} {tenantStats.length === 1 ? 'mês' : 'meses'} de dados
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current Month Stats */}
                  <div>
                    <p className="text-sm font-medium mb-3">Mês Atual ({latestStat.month_display}):</p>
                    <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Users className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="text-2xl font-bold">{latestStat.total_users}</p>
                          <p className="text-xs text-muted-foreground">
                            {latestStat.active_users} ativos
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Calendar className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="text-2xl font-bold">{latestStat.total_appointments}</p>
                          <p className="text-xs text-muted-foreground">
                            {latestStat.completed_appointments} concluídos
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <DollarSign className="h-8 w-8 text-purple-600" />
                        <div>
                          <p className="text-lg font-bold">
                            {formatCurrency(parseFloat(latestStat.total_revenue))}
                          </p>
                          <p className="text-xs text-muted-foreground">Receita</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Users className="h-8 w-8 text-orange-600" />
                        <div>
                          <p className="text-2xl font-bold">{latestStat.total_customers}</p>
                          <p className="text-xs text-muted-foreground">
                            +{latestStat.new_customers} novos
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Technical Stats */}
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium mb-3">Uso de Recursos:</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                        <div>
                          <p className="text-lg font-bold">
                            {latestStat.api_calls.toLocaleString('pt-BR')}
                          </p>
                          <p className="text-xs text-muted-foreground">Chamadas API</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Database className="h-6 w-6 text-purple-600" />
                        <div>
                          <p className="text-lg font-bold">{latestStat.storage_used_mb} MB</p>
                          <p className="text-xs text-muted-foreground">Armazenamento</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Historical Data */}
                  {tenantStats.length > 1 && (
                    <div className="border-t pt-3">
                      <p className="text-sm font-medium mb-3">Histórico:</p>
                      <div className="space-y-2">
                        {tenantStats.slice(1, 4).map((stat) => (
                          <div
                            key={stat.id}
                            className="flex items-center justify-between text-sm p-2 hover:bg-accent rounded"
                          >
                            <span className="text-muted-foreground">{stat.month_display}</span>
                            <div className="flex items-center gap-4">
                              <span>{stat.total_appointments} agendamentos</span>
                              <span>{formatCurrency(parseFloat(stat.total_revenue))}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhuma estatística disponível</p>
            <p className="text-sm text-muted-foreground mt-1">
              As estatísticas serão geradas automaticamente
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
