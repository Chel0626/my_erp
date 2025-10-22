/**
 * Customer Selector Component
 * Autocomplete para selecionar cliente existente ou criar novo
 */
'use client';

import { useState } from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomerSelectorProps {
  value?: string;
  onChange: (customerId?: string, customerData?: {
    name: string;
    phone: string;
    email?: string;
  }) => void;
  onCreateNew?: () => void;
}

const tagConfig = {
  VIP: { emoji: '⭐', color: 'bg-yellow-500 text-white' },
  REGULAR: { emoji: '👤', color: 'bg-blue-500 text-white' },
  NOVO: { emoji: '✨', color: 'bg-green-500 text-white' },
  INATIVO: { emoji: '💤', color: 'bg-gray-500 text-white' },
};

export function CustomerSelector({ value, onChange, onCreateNew }: CustomerSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const { data: customers, isLoading } = useCustomers({
    search: search || undefined,
    is_active: true,
  });

  const selectedCustomer = customers?.find((c) => c.id === value);

  const handleSelect = (customerId: string) => {
    const customer = customers?.find((c) => c.id === customerId);
    
    if (customer) {
      onChange(customerId, {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
      });
    } else {
      console.warn('⚠️ Cliente não encontrado na lista');
    }
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedCustomer ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Badge className={cn('shrink-0', tagConfig[selectedCustomer.tag].color)}>
                  {tagConfig[selectedCustomer.tag].emoji}
                </Badge>
                <span className="truncate">{selectedCustomer.name}</span>
                <span className="text-muted-foreground text-sm truncate">
                  {selectedCustomer.phone}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">Selecionar cliente...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Buscar cliente por nome, telefone..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandEmpty>
              <div className="py-6 text-center text-sm">
                <p className="text-muted-foreground mb-3">Nenhum cliente encontrado</p>
                {onCreateNew && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onCreateNew();
                      setOpen(false);
                    }}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Criar Novo Cliente
                  </Button>
                )}
              </div>
            </CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {isLoading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Carregando...
                </div>
              ) : (
                customers?.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={customer.id}
                    onSelect={() => {
                      handleSelect(customer.id); // Passa o ID direto ao invés de usar currentValue
                    }}
                    className="flex items-center gap-2 py-2"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === customer.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <Badge className={cn('shrink-0', tagConfig[customer.tag].color)}>
                      {tagConfig[customer.tag].emoji}
                    </Badge>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium truncate">{customer.name}</span>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span>{customer.phone}</span>
                        {customer.email && <span className="truncate">{customer.email}</span>}
                      </div>
                    </div>
                  </CommandItem>
                ))
              )}
            </CommandGroup>
            {onCreateNew && customers && customers.length > 0 && (
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    onCreateNew();
                    setOpen(false);
                  }}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Criar Novo Cliente
                </Button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {selectedCustomer && (
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <span>📱 {selectedCustomer.phone}</span>
            {selectedCustomer.email && <span>📧 {selectedCustomer.email}</span>}
          </div>
          {selectedCustomer.last_visit && (
            <div>
              Última visita: {new Date(selectedCustomer.last_visit).toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
