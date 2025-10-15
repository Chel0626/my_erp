'use client';

import { useState, useEffect } from 'react';
import { CreateTransactionInput, Transaction } from '@/hooks/useTransactions';
import { useActivePaymentMethods } from '@/hooks/usePaymentMethods';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TransactionFormProps {
  transaction?: Transaction;
  onSubmit: (data: CreateTransactionInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function TransactionForm({ transaction, onSubmit, onCancel, isLoading }: TransactionFormProps) {
  const { data: paymentMethods, isLoading: loadingPaymentMethods } = useActivePaymentMethods();

  const [formData, setFormData] = useState<CreateTransactionInput>({
    type: 'receita',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
    payment_method_id: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preenche form se estiver editando
  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date,
        payment_method_id: transaction.payment_method,
        notes: transaction.notes || '',
      });
    }
  }, [transaction]);

  const handleChange = (field: keyof CreateTransactionInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpa erro do campo ao digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    const amount = parseFloat(formData.amount.toString());
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    }

    if (!formData.payment_method_id) {
      newErrors.payment_method_id = 'Selecione um método de pagamento';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (loadingPaymentMethods) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando métodos de pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tipo de Transação */}
      <div className="space-y-2">
        <Label htmlFor="type">
          Tipo <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="type"
              value="receita"
              checked={formData.type === 'receita'}
              onChange={(e) => handleChange('type', e.target.value as 'receita' | 'despesa')}
              className="w-4 h-4"
            />
            <span className="text-green-600 font-semibold">💰 Receita</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="type"
              value="despesa"
              checked={formData.type === 'despesa'}
              onChange={(e) => handleChange('type', e.target.value as 'receita' | 'despesa')}
              className="w-4 h-4"
            />
            <span className="text-red-600 font-semibold">⚠️ Despesa</span>
          </label>
        </div>
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Descrição <span className="text-red-500">*</span>
        </Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Ex: Corte de cabelo - João Silva"
          className={errors.description ? 'border-red-500' : ''}
          maxLength={255}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      {/* Valor e Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Valor */}
        <div className="space-y-2">
          <Label htmlFor="amount">
            Valor (R$) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            placeholder="0.00"
            className={errors.amount ? 'border-red-500' : ''}
          />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount}</p>
          )}
        </div>

        {/* Data */}
        <div className="space-y-2">
          <Label htmlFor="date">
            Data <span className="text-red-500">*</span>
          </Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className={errors.date ? 'border-red-500' : ''}
          />
          {errors.date && (
            <p className="text-sm text-red-500">{errors.date}</p>
          )}
        </div>
      </div>

      {/* Método de Pagamento */}
      <div className="space-y-2">
        <Label htmlFor="payment_method_id">
          Método de Pagamento <span className="text-red-500">*</span>
        </Label>
        <select
          id="payment_method_id"
          value={formData.payment_method_id}
          onChange={(e) => handleChange('payment_method_id', e.target.value)}
          className={`flex h-10 w-full rounded-md border ${errors.payment_method_id ? 'border-red-500' : 'border-input'} bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
        >
          <option value="">Selecione um método</option>
          {paymentMethods?.map((method) => (
            <option key={method.id} value={method.id}>
              {method.name}
            </option>
          ))}
        </select>
        {errors.payment_method_id && (
          <p className="text-sm text-red-500">{errors.payment_method_id}</p>
        )}
      </div>

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Informações adicionais (opcional)"
          rows={3}
        />
      </div>

      {/* Botões */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : transaction ? 'Atualizar' : 'Criar Transação'}
        </Button>
      </div>
    </form>
  );
}
