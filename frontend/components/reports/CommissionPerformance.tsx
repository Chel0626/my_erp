/**
 * Componente de Performance de Comissões por Profissional
 * Exibe tabela com estatísticas de comissões
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, AlertCircle } from 'lucide-react';
import { CommissionPerformance as CommissionPerformanceType } from '@/hooks/useReports';

interface CommissionPerformanceProps {
  data: CommissionPerformanceType[] | undefined;
  isLoading: boolean;
}

export function CommissionPerformance({ data, isLoading }: CommissionPerformanceProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Performance de Comissões
          </CardTitle>
          <CardDescription>Comissões por profissional no período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mb-2 opacity-50" />
            <p>Nenhuma comissão encontrada no período</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Performance de Comissões
        </CardTitle>
        <CardDescription>Comissões por profissional no período</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Cards de resumo (mobile) */}
        <div className="grid gap-4 md:hidden">
          {data.map((item) => (
            <Card key={item.professional_id} className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-lg">{item.professional_name}</p>
                    <p className="text-sm text-muted-foreground">{item.professional_email}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-semibold">{item.total_commissions}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pagas</p>
                      <p className="font-semibold text-green-600">{item.count_paid}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pendentes</p>
                      <p className="font-semibold text-yellow-600">{item.count_pending}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Taxa</p>
                      <Badge variant={item.completion_rate >= 70 ? 'default' : 'secondary'}>
                        {item.completion_rate.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Valor Pago:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(item.total_paid)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-muted-foreground">Valor Pendente:</span>
                      <span className="font-semibold text-yellow-600">
                        {formatCurrency(item.total_pending)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabela (desktop) */}
        <div className="hidden md:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profissional</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">Pagas</TableHead>
                <TableHead className="text-center">Pendentes</TableHead>
                <TableHead className="text-right">Valor Pago</TableHead>
                <TableHead className="text-right">Valor Pendente</TableHead>
                <TableHead className="text-center">Taxa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.professional_id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.professional_name}</p>
                      <p className="text-sm text-muted-foreground">{item.professional_email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    {item.total_commissions}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {item.count_paid}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      {item.count_pending}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-green-600">
                    {formatCurrency(item.total_paid)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-yellow-600">
                    {formatCurrency(item.total_pending)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={item.completion_rate >= 70 ? 'default' : 'secondary'}>
                      {item.completion_rate.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
