'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Target, 
  TrendingUp, 
  User, 
  Users,
  DollarSign,
  ShoppingCart,
  Scissors,
  Package,
  UserPlus,
  Eye
} from 'lucide-react';
import type { Goal } from '@/types/goals';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GoalCardProps {
  goal: Goal;
}

const targetTypeIcons = {
  revenue: DollarSign,
  sales_count: ShoppingCart,
  services_count: Scissors,
  products_sold: Package,
  new_customers: UserPlus,
};

const statusColors = {
  active: 'bg-blue-500',
  completed: 'bg-green-500',
  failed: 'bg-red-500',
  cancelled: 'bg-gray-500',
};

const statusVariants = {
  active: 'default' as const,
  completed: 'default' as const,
  failed: 'destructive' as const,
  cancelled: 'secondary' as const,
};

export function GoalCard({ goal }: GoalCardProps) {
  const Icon = targetTypeIcons[goal.target_type];
  const isActive = goal.status === 'active';
  const percentage = Math.min(Math.round(goal.percentage), 100);

  // Determinar cor do progresso
  const getProgressColor = () => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  // Formatar valor baseado no tipo
  const formatValue = (value: string) => {
    if (goal.target_type === 'revenue') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(parseFloat(value));
    }
    return value;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${statusColors[goal.status]} bg-opacity-10`}>
              <Icon className={`h-5 w-5 ${statusColors[goal.status].replace('bg-', 'text-')}`} />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-1">{goal.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {goal.target_type_display}
              </p>
            </div>
          </div>
          <Badge variant={statusVariants[goal.status]}>
            {goal.status_display}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        {goal.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {goal.description}
          </p>
        )}

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-semibold">{percentage}%</span>
          </div>
          <Progress value={percentage} className={getProgressColor()} />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatValue(goal.current_value)}</span>
            <span>Meta: {formatValue(goal.target_value)}</span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          {/* Type */}
          <div className="flex items-center gap-2 text-sm">
            {goal.type === 'individual' ? (
              <User className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Users className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-muted-foreground">{goal.type_display}</span>
          </div>

          {/* Period */}
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{goal.period_display}</span>
          </div>

          {/* User */}
          {goal.user_details && (
            <div className="flex items-center gap-2 text-sm col-span-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground truncate">
                {goal.user_details.full_name}
              </span>
            </div>
          )}

          {/* Dates */}
          <div className="flex items-center gap-2 text-sm col-span-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {format(new Date(goal.start_date), 'dd/MM/yyyy', { locale: ptBR })}
              {' - '}
              {format(new Date(goal.end_date), 'dd/MM/yyyy', { locale: ptBR })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <Button asChild className="w-full" variant="outline">
          <Link href={`/dashboard/goals/${goal.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            Ver Detalhes
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
