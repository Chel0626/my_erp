'use client';

import { useTransactionSummary } from '@/hooks/useTransactions';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Receipt } from 'lucide-react';

interface FinancialSummaryProps {
  startDate?: string;
  endDate?: string;
}

export default function FinancialSummary({ startDate, endDate }: FinancialSummaryProps) {
  const { data: summary, isLoading, error } = useTransactionSummary({ start_date: startDate, end_date: endDate });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-50 border-red-200">
        <p className="text-red-600">Erro ao carregar resumo financeiro</p>
      </Card>
    );
  }

  if (!summary) return null;

  const totalRevenue = parseFloat(summary.total_revenue);
  const totalExpenses = parseFloat(summary.total_expenses);
  const balance = parseFloat(summary.balance);
  const isPositive = balance >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Receitas */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-600">Receitas</p>
            <p className="text-2xl font-bold text-green-700 mt-1">
              R$ {totalRevenue.toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-green-200 rounded-full">
            <TrendingUp className="h-6 w-6 text-green-700" />
          </div>
        </div>
      </Card>

      {/* Despesas */}
      <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-600">Despesas</p>
            <p className="text-2xl font-bold text-red-700 mt-1">
              R$ {totalExpenses.toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-red-200 rounded-full">
            <TrendingDown className="h-6 w-6 text-red-700" />
          </div>
        </div>
      </Card>

      {/* Saldo */}
      <Card className={`p-6 bg-gradient-to-br ${isPositive ? 'from-blue-50 to-blue-100 border-blue-200' : 'from-orange-50 to-orange-100 border-orange-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${isPositive ? 'text-blue-600' : 'text-orange-600'}`}>
              Saldo
            </p>
            <p className={`text-2xl font-bold mt-1 ${isPositive ? 'text-blue-700' : 'text-orange-700'}`}>
              {isPositive ? '+' : ''} R$ {balance.toFixed(2)}
            </p>
          </div>
          <div className={`p-3 rounded-full ${isPositive ? 'bg-blue-200' : 'bg-orange-200'}`}>
            <DollarSign className={`h-6 w-6 ${isPositive ? 'text-blue-700' : 'text-orange-700'}`} />
          </div>
        </div>
      </Card>

      {/* Total de Transações */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-600">Transações</p>
            <p className="text-2xl font-bold text-purple-700 mt-1">
              {summary.transaction_count}
            </p>
          </div>
          <div className="p-3 bg-purple-200 rounded-full">
            <Receipt className="h-6 w-6 text-purple-700" />
          </div>
        </div>
      </Card>
    </div>
  );
}
