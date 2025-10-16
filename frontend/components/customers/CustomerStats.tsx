/**
 * Componente de Estatísticas do Cliente
 * Exibe métricas e insights sobre o cliente
 */
import { CustomerStats as Stats } from '@/hooks/useCustomers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Award,
  User,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CustomerStatsProps {
  stats: Stats;
  isLoading?: boolean;
}

export function CustomerStats({ stats, isLoading }: CustomerStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Gasto */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Gasto
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.total_spent.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Valor total acumulado
            </p>
          </CardContent>
        </Card>

        {/* Total de Agendamentos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Agendamentos
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_appointments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de atendimentos
            </p>
          </CardContent>
        </Card>

        {/* Ticket Médio */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ticket Médio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.average_ticket.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Por atendimento
            </p>
          </CardContent>
        </Card>

        {/* Último Agendamento */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Última Visita
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.last_appointment
                ? format(new Date(stats.last_appointment.date), 'dd/MM', {
                    locale: ptBR,
                  })
                : '-'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.last_appointment
                ? stats.last_appointment.service
                : 'Nenhum agendamento'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Preferências e Favoritos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Serviço Favorito */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-5 w-5 text-yellow-600" />
              Serviço Favorito
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.favorite_service ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">
                    {stats.favorite_service.name}
                  </span>
                  <Badge variant="secondary">
                    {stats.favorite_service.count}x
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Serviço mais solicitado
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum serviço registrado ainda
              </p>
            )}
          </CardContent>
        </Card>

        {/* Profissional Favorito */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5 text-blue-600" />
              Profissional Favorito
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.favorite_professional ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">
                    {stats.favorite_professional.name}
                  </span>
                  <Badge variant="secondary">
                    {stats.favorite_professional.count}x
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Profissional mais atendeu
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum profissional registrado ainda
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumo Detalhado */}
      {(stats.favorite_service || stats.favorite_professional) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumo do Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total de Visitas:</span>
                <p className="font-semibold">{stats.total_appointments}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Valor Médio:</span>
                <p className="font-semibold">
                  R$ {stats.average_ticket.toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Total Investido:</span>
                <p className="font-semibold">
                  R$ {stats.total_spent.toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Última Visita:</span>
                <p className="font-semibold">
                  {stats.last_appointment
                    ? format(
                        new Date(stats.last_appointment.date),
                        "dd 'de' MMMM",
                        { locale: ptBR }
                      )
                    : '-'}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Análise de Perfil</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                {stats.total_appointments >= 10 && (
                  <p>✅ Cliente frequente - mais de 10 visitas</p>
                )}
                {stats.average_ticket >= 100 && (
                  <p>✅ Alto valor de ticket médio</p>
                )}
                {stats.favorite_service &&
                  stats.favorite_service.count >= 5 && (
                    <p>
                      ✅ Preferência forte por {stats.favorite_service.name}
                    </p>
                  )}
                {stats.favorite_professional &&
                  stats.favorite_professional.count >= 5 && (
                    <p>
                      ✅ Fidelidade ao profissional{' '}
                      {stats.favorite_professional.name}
                    </p>
                  )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
