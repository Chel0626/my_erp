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
import { exportReportToPDF, exportReportToExcel, exportReportToCSV } from '@/lib/export/reportExport';

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

  const handleExportCSV = () => {
    exportReportToCSV({
      tenantName: 'Minha Empresa - ERP',
      period: {
        start: filters.start_date || format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        end: filters.end_date || format(new Date(), 'yyyy-MM-dd'),
      },
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
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
            <span>Relatórios</span>
          </h1>
          <p className="text-sm text-muted-foreground hidden sm:block">
            Visualize o desempenho do seu negócio
          </p>
        </div>
        <div className="grid grid-cols-3 sm:flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs"
          >
            <Filter className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Filtros</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} className="text-xs">
            <RefreshCw className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Resetar</span>
          </Button>
          <Button 
            variant="default"
            size="sm"
            onClick={handleExportPDF}
            disabled={isLoading}
            className="text-xs"
          >
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
          <Button 
            variant="default"
            size="sm"
            onClick={handleExportExcel}
            disabled={isLoading}
            className="text-xs"
          >
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Excel</span>
          </Button>
          <Button 
            variant="default"
            size="sm"
            onClick={handleExportCSV}
            disabled={isLoading}
            className="text-xs"
          >
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">CSV</span>
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Filtros</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Configure o período e tipo de visualização dos dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {/* Data Inicial */}
              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-xs sm:text-sm">Data Inicial</Label>
                <Input
                  id="start_date"
                  type="date"
                  className="h-9 sm:h-10 text-sm"
                  value={filters.start_date}
                  onChange={(e) =>
                    handleFilterChange('start_date', e.target.value)
                  }
                />
              </div>

              {/* Data Final */}
              <div className="space-y-2">
                <Label htmlFor="end_date" className="text-xs sm:text-sm">Data Final</Label>
                <Input
                  id="end_date"
                  type="date"
                  className="h-9 sm:h-10 text-sm"
                  value={filters.end_date}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                />
              </div>

              {/* Período de Agrupamento */}
              <div className="space-y-2">
                <Label htmlFor="period" className="text-xs sm:text-sm">Agrupamento</Label>
                <Select
                  value={filters.period}
                  onValueChange={(value) => handleFilterChange('period', value)}
                >
                  <SelectTrigger id="period" className="h-9 sm:h-10">
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
                <Label htmlFor="limit" className="text-xs sm:text-sm">Top Serviços</Label>
                <Select
                  value={filters.limit?.toString()}
                  onValueChange={(value) =>
                    handleFilterChange('limit', parseInt(value))
                  }
                >
                  <SelectTrigger id="limit" className="h-9 sm:h-10">
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
            <div className="mt-3 sm:mt-4 grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickFilter(7)}
                className="text-xs"
              >
                <span className="hidden sm:inline">Últimos </span>7d
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickFilter(15)}
                className="text-xs"
              >
                <span className="hidden sm:inline">Últimos </span>15d
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickFilter(30)}
                className="text-xs"
              >
                <span className="hidden sm:inline">Últimos </span>30d
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleThisMonth}
                className="text-xs"
              >
                Este mês
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações do Período */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
        <span className="truncate">
          Período: {format(new Date(filters.start_date!), 'dd/MM/yyyy')} até{' '}
          {format(new Date(filters.end_date!), 'dd/MM/yyyy')}
        </span>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-3 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          <Skeleton className="h-[300px] sm:h-[400px]" />
          <Skeleton className="h-[300px] sm:h-[400px]" />
          <Skeleton className="h-[300px] sm:h-[400px]" />
          <Skeleton className="h-[300px] sm:h-[400px]" />
        </div>
      )}

      {/* Gráficos */}
      {!isLoading && (
        <div className="grid gap-4 sm:gap-6">
          {/* Linha 1: Receita e Status */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
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
