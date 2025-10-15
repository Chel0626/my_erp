'use client';

import { Transaction } from '@/hooks/useTransactions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Calendar, CreditCard, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

export default function TransactionCard({ transaction, onEdit, onDelete }: TransactionCardProps) {
  const isRevenue = transaction.type === 'receita';
  const amount = parseFloat(transaction.amount);

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          {/* Tipo e Descrição */}
          <div className="flex items-center gap-2">
            <Badge 
              variant={isRevenue ? "default" : "destructive"}
              className={isRevenue ? "bg-green-500 hover:bg-green-600" : ""}
            >
              {isRevenue ? '💰 Receita' : '⚠️ Despesa'}
            </Badge>
            <h3 className="font-semibold text-lg">{transaction.description}</h3>
          </div>

          {/* Valor */}
          <div className={`text-2xl font-bold ${isRevenue ? 'text-green-600' : 'text-red-600'}`}>
            {isRevenue ? '+' : '-'} R$ {amount.toFixed(2)}
          </div>

          {/* Informações */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(transaction.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
            </div>
            <div className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              <span>{transaction.payment_method_details.name}</span>
            </div>
          </div>

          {/* Observações */}
          {transaction.notes && (
            <div className="flex items-start gap-1 text-sm text-muted-foreground bg-muted p-2 rounded">
              <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{transaction.notes}</span>
            </div>
          )}

          {/* Agendamento vinculado */}
          {transaction.appointment_details && (
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
              📅 Vinculado ao agendamento: {transaction.appointment_details.customer_name}
            </div>
          )}

          {/* Criado por */}
          <div className="text-xs text-muted-foreground">
            Criado por: {transaction.created_by_name} em {format(new Date(transaction.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2 ml-4">
          {onEdit && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(transaction)}
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(transaction.id)}
              title="Deletar"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
