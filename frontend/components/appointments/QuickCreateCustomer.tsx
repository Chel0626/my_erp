/**
 * Quick Create Customer Dialog
 * Criação rápida de cliente durante agendamento
 */
'use client';

import { useState } from 'react';
import { useCreateCustomer } from '@/hooks/useCustomers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface QuickCreateCustomerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (customerId: string) => void;
}

export function QuickCreateCustomer({ open, onOpenChange, onSuccess }: QuickCreateCustomerProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    tag: 'NOVO' as 'VIP' | 'REGULAR' | 'NOVO' | 'INATIVO',
  });

  const createCustomer = useCreateCustomer();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      return;
    }

    createCustomer.mutate(formData, {
      onSuccess: (data) => {
        onSuccess?.(data.id);
        onOpenChange(false);
        setFormData({ name: '', phone: '', email: '', tag: 'NOVO' });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Cliente</DialogTitle>
          <DialogDescription>
            Preencha apenas os dados essenciais. Você pode completar depois.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="João da Silva"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(11) 98765-4321"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="joao@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tag">Categoria</Label>
            <Select
              value={formData.tag}
              onValueChange={(value: 'VIP' | 'REGULAR' | 'NOVO' | 'INATIVO') => setFormData({ ...formData, tag: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIP">⭐ VIP</SelectItem>
                <SelectItem value="REGULAR">👤 Regular</SelectItem>
                <SelectItem value="NOVO">✨ Novo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createCustomer.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createCustomer.isPending}>
              {createCustomer.isPending ? 'Criando...' : 'Criar Cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
