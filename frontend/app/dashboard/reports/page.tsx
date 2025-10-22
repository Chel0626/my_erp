/**
 * Página de Relatórios e Dashboards
 * /dashboard/reports
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart3,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

// Hooks
import {
  useRevenueChart,
  useExpenseChart,
  useStatusDistribution,
  useTopServices,
  useProfessionalPerformance,
  useCommissionPerformance,
  useBestSellingProducts,
  ReportFilters,
} from '@/hooks/useReports';

// Componentes de gráficos
import { RevenueChart } from '@/components/reports/RevenueChart';
import { StatusDistributionChart } from '@/components/reports/StatusDistributionChart';
import { TopServicesChart } from '@/components/reports/TopServicesChart';
import { ProfessionalPerformance } from '@/components/reports/ProfessionalPerformance';
import { CommissionPerformance } from '@/components/reports/CommissionPerformance';
import { BestSellingProductsChart } from '@/components/reports/BestSellingProductsChart';

// Export utilities
import { exportReportToPDF, exportReportToExcel } from '@/lib/export/reportExport';

export default function ReportsPage() {
  // Estado dos filtros
  const [filters, setFilters] = useState<ReportFilters>({
    start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    period: 'day',
    limit: 10,
  });

  const [showFilters, setShowFilters] = useState(false);

  // Queries
  const revenueChart = useRevenueChart(filters);
  const expenseChart = useExpenseChart(filters);
  const statusDistribution = useStatusDistribution(filters);
  const topServices = useTopServices(filters);
  const professionalPerformance = useProfessionalPerformance(filters);
  const commissionPerformance = useCommissionPerformance(filters);
  const bestSellingProducts = useBestSellingProducts(filters);

  // Handlers
  const handleFilterChange = (key: keyof ReportFilters, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleQuickFilter = (days: number) => {
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    setFilters((prev) => ({
      ...prev,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
    }));
  };

  const handleThisMonth = () => {
    const now = new Date();
    setFilters((prev) => ({
      ...prev,
      start_date: format(startOfMonth(now), 'yyyy-MM-dd'),
      end_date: format(endOfMonth(now), 'yyyy-MM-dd'),
    }));
  };

  const handleReset = () => {
    setFilters({
      start_date: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      end_date: format(new Date(), 'yyyy-MM-dd'),
      period: 'day',
      limit: 10,
    });
  };

  const handleExportPDF = () => {
    exportReportToPDF({
      tenantName: 'Minha Empresa - ERP',
      reportTitle: 'Relatório de Desempenho',
      period: {
        start: filters.start_date || format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        end: filters.end_date || format(new Date(), 'yyyy-MM-dd'),
      },
      revenue: revenueChart.data,
      status: statusDistribution.data,
      topServices: topServices.data as unknown as Array<Record<string, string | number>>,
      professionals: professionalPerformance.data as unknown as Array<Record<string, string | number>>,
    });
  };

  const handleExportExcel = () => {
    exportReportToExcel({
      tenantName: 'Minha Empresa - ERP',
      period: {
        start: filters.start_date || format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        end: filters.end_date || format(new Date(), 'yyyy-MM-dd'),
      },
      revenue: revenueChart.data,
      status: statusDistribution.data,
      topServices: topServices.data as unknown as Array<Record<string, string | number>>,
      professionals: professionalPerformance.data as unknown as Array<Record<string, string | number>>,
    });
  };

  const isLoading =
    revenueChart.isLoading ||
    expenseChart.isLoading ||
    statusDistribution.isLoading ||
    topServices.isLoading ||
    professionalPerformance.isLoading ||
    commissionPerformance.isLoading ||
    bestSellingProducts.isLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Relatórios e Análises
          </h1>
          <p className="text-muted-foreground">
            Visualize o desempenho do seu negócio
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
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Resetar
          </Button>
          <Button 
            variant="default" 
            onClick={handleExportPDF}
            disabled={isLoading}
          >
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button 
            variant="default" 
            onClick={handleExportExcel}
            disabled={isLoading}
          >
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
            <CardDescription>
              Configure o período e tipo de visualização dos dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {/* Data Inicial */}
              <div className="space-y-2">
                <Label htmlFor="start_date">Data Inicial</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={filters.start_date}
                  onChange={(e) =>
                    handleFilterChange('start_date', e.target.value)
                  }
                />
              </div>

              {/* Data Final */}
              <div className="space-y-2">
                <Label htmlFor="end_date">Data Final</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                />
              </div>

              {/* Período de Agrupamento */}
              <div className="space-y-2">
                <Label htmlFor="period">Agrupamento</Label>
                <Select
                  value={filters.period}
                  onValueChange={(value) => handleFilterChange('period', value)}
                >
                  <SelectTrigger id="period">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Diário</SelectItem>
                    <SelectItem value="week">Semanal</SelectItem>
                    <SelectItem value="month">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Limite Top Serviços */}
              <div className="space-y-2">
                <Label htmlFor="limit">Top Serviços</Label>
                <Select
                  value={filters.limit?.toString()}
                  onValueChange={(value) =>
                    handleFilterChange('limit', parseInt(value))
                  }
                >
                  <SelectTrigger id="limit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Top 5</SelectItem>
                    <SelectItem value="10">Top 10</SelectItem>
                    <SelectItem value="15">Top 15</SelectItem>
                    <SelectItem value="20">Top 20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtros Rápidos */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickFilter(7)}
              >
                Últimos 7 dias
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickFilter(15)}
              >
                Últimos 15 dias
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickFilter(30)}
              >
                Últimos 30 dias
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleThisMonth}
              >
                Este mês
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações do Período */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>
          Período: {format(new Date(filters.start_date!), 'dd/MM/yyyy')} até{' '}
          {format(new Date(filters.end_date!), 'dd/MM/yyyy')}
        </span>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      )}

      {/* Gráficos */}
      {!isLoading && (
        <div className="grid gap-6">
          {/* Linha 1: Receita e Status */}
          <div className="grid gap-6 md:grid-cols-2">
            {revenueChart.data && (
              <RevenueChart
                data={revenueChart.data.data}
                period={filters.period || 'day'}
                type="area"
              />
            )}
            {statusDistribution.data && (
              <StatusDistributionChart
                data={statusDistribution.data.data}
                total={statusDistribution.data.total}
              />
            )}
          </div>

          {/* Linha 2: Top Serviços (full width) */}
          {topServices.data && topServices.data.length > 0 && (
            <TopServicesChart data={topServices.data} />
          )}

          {/* Linha 3: Produtos Mais Vendidos (full width) */}
          <BestSellingProductsChart 
            data={bestSellingProducts.data} 
            isLoading={bestSellingProducts.isLoading}
          />

          {/* Linha 4: Desempenho Profissional (full width) */}
          {professionalPerformance.data &&
            professionalPerformance.data.length > 0 && (
              <ProfessionalPerformance data={professionalPerformance.data} />
            )}

          {/* Linha 5: Performance de Comissões (full width) */}
          <CommissionPerformance 
            data={commissionPerformance.data} 
            isLoading={commissionPerformance.isLoading}
          />

          {/* Mensagem se não houver dados */}
          {!topServices.data?.length &&
            !professionalPerformance.data?.length && 
            !bestSellingProducts.data?.length &&
            !commissionPerformance.data?.length && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Nenhum dado encontrado
                  </h3>
                  <p className="text-muted-foreground text-center">
                    Não há dados disponíveis para o período selecionado. Tente
                    ajustar os filtros ou adicionar mais agendamentos.
                  </p>
                </CardContent>
              </Card>
            )}
        </div>
      )}
    </div>
  );
}
