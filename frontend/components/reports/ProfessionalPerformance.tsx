/**
 * Componente de tabela/cards para desempenho de profissionais
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Award } from 'lucide-react';

interface ProfessionalPerformanceProps {
  data: Array<{
    professional_id: string;
    professional_name: string;
    professional_email: string;
    total_appointments: number;
    completed: number;
    cancelled: number;
    total_revenue: number;
    completion_rate: number;
  }>;
}

export function ProfessionalPerformance({ data }: ProfessionalPerformanceProps) {
  // Calcular totais
  const totalAppointments = data.reduce((sum, item) => sum + item.total_appointments, 0);
  const totalRevenue = data.reduce((sum, item) => sum + item.total_revenue, 0);
  const totalCompleted = data.reduce((sum, item) => sum + item.completed, 0);

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Determinar cor do badge baseado na taxa de conclusão
  const getCompletionBadgeVariant = (rate: number) => {
    if (rate >= 90) return 'default'; // Verde
    if (rate >= 70) return 'secondary'; // Amarelo
    return 'destructive'; // Vermelho
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Desempenho por Profissional
            </CardTitle>
            <CardDescription>
              Ranking de profissionais por receita gerada
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="text-sm text-muted-foreground">
              {totalAppointments} agendamentos
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop: Tabela */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Posição</TableHead>
                <TableHead>Profissional</TableHead>
                <TableHead className="text-center">Agendamentos</TableHead>
                <TableHead className="text-center">Concluídos</TableHead>
                <TableHead className="text-center">Cancelados</TableHead>
                <TableHead className="text-center">Taxa Conclusão</TableHead>
                <TableHead className="text-right">Receita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((professional, index) => (
                <TableRow key={professional.professional_id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {index < 3 && (
                        <Award
                          className={`h-5 w-5 ${
                            index === 0
                              ? 'text-yellow-500'
                              : index === 1
                              ? 'text-gray-400'
                              : 'text-orange-600'
                          }`}
                        />
                      )}
                      <span className="font-bold">#{index + 1}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{professional.professional_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {professional.professional_email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {professional.total_appointments}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {professional.completed}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      {professional.cancelled}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getCompletionBadgeVariant(professional.completion_rate)}>
                      {professional.completion_rate.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    {formatCurrency(professional.total_revenue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile: Cards */}
        <div className="grid gap-3 md:hidden">
          {data.map((professional, index) => (
            <Card key={professional.professional_id} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {index < 3 && (
                      <Award
                        className={`h-5 w-5 ${
                          index === 0
                            ? 'text-yellow-500'
                            : index === 1
                            ? 'text-gray-400'
                            : 'text-orange-600'
                        }`}
                      />
                    )}
                    <div>
                      <div className="font-bold">#{index + 1}</div>
                    </div>
                  </div>
                  <Badge variant={getCompletionBadgeVariant(professional.completion_rate)}>
                    {professional.completion_rate.toFixed(1)}% conclusão
                  </Badge>
                </div>
                <div>
                  <CardTitle className="text-base">{professional.professional_name}</CardTitle>
                  <CardDescription className="text-xs">
                    {professional.professional_email}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-xs">Agendamentos</div>
                    <div className="font-bold text-lg">
                      {professional.total_appointments}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-xs">Receita</div>
                    <div className="font-bold text-lg text-green-600">
                      {formatCurrency(professional.total_revenue)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-xs">Concluídos</div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 w-fit">
                      {professional.completed}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-xs">Cancelados</div>
                    <Badge variant="outline" className="bg-red-50 text-red-700 w-fit">
                      {professional.cancelled}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resumo Geral */}
        <div className="mt-4 grid grid-cols-3 gap-4 rounded-lg border bg-muted/50 p-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{data.length}</div>
            <div className="text-xs text-muted-foreground">Profissionais</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{totalCompleted}</div>
            <div className="text-xs text-muted-foreground">Concluídos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="text-xs text-muted-foreground">Receita Total</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
