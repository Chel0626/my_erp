/**
 * Página de Listagem de Clientes
 * Dashboard com cards, filtros e busca
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useCustomers,
  useCreateCustomer,
  useActivateCustomer,
  useDeactivateCustomer,
  useDeleteCustomer,
  useCustomerSummary,
  CustomerFilters,
} from '@/hooks/useCustomers';
import { CustomerCard } from '@/components/customers/CustomerCard';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  Filter,
  Users,
  Star,
  UserPlus,
  UserX,
  Cake,
} from 'lucide-react';

export default function CustomersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<CustomerFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Hooks
  const { data: customers, isLoading } = useCustomers(filters);
  const { data: summary } = useCustomerSummary();
  const createCustomer = useCreateCustomer();
  const activateCustomer = useActivateCustomer();
  const deactivateCustomer = useDeactivateCustomer();
  const deleteCustomer = useDeleteCustomer();

  // Handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      setFilters((prev) => ({ ...prev, search: value }));
    } else {
      setFilters((prev) => {
        const { search, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleFilterTag = (value: string) => {
    if (value === 'all') {
      setFilters((prev) => {
        const { tag, ...rest } = prev;
        return rest;
      });
    } else {
      setFilters((prev) => ({
        ...prev,
        tag: value as CustomerFilters['tag'],
      }));
    }
  };

  const handleFilterActive = (value: string) => {
    if (value === 'all') {
      setFilters((prev) => {
        const { is_active, ...rest } = prev;
        return rest;
      });
    } else {
      setFilters((prev) => ({
        ...prev,
        is_active: value === 'active',
      }));
    }
  };

  const handleView = (id: string) => {
    router.push(`/dashboard/customers/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/customers/${id}?edit=true`);
  };

  const handleActivate = (id: string) => {
    activateCustomer.mutate(id);
  };

  const handleDeactivate = (id: string) => {
    deactivateCustomer.mutate(id);
  };

  const handleCreateSubmit = (data: any) => {
    createCustomer.mutate(data, {
      onSuccess: () => {
        setShowCreateDialog(false);
      },
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus clientes e suas informações
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_customers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-600" />
                VIP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.vip_customers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Regulares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.regular_customers}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-green-600" />
                Novos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.new_customers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserX className="h-4 w-4 text-gray-600" />
                Inativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.inactive_customers}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Cake className="h-4 w-4 text-pink-600" />
                Aniversários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.birthdays_this_month}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone, email ou CPF..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Selects */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select onValueChange={handleFilterTag} defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                <SelectItem value="VIP">⭐ VIP</SelectItem>
                <SelectItem value="REGULAR">👤 Regular</SelectItem>
                <SelectItem value="NOVO">✨ Novo</SelectItem>
                <SelectItem value="INATIVO">💤 Inativo</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={handleFilterActive} defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setFilters({});
                setSearchTerm('');
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customers Grid */}
      <div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-12 bg-gray-200 rounded-full w-12" />
                  <div className="h-4 bg-gray-200 rounded w-32 mt-4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : customers && customers.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {customers.length} cliente(s) encontrado(s)
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onView={handleView}
                  onEdit={handleEdit}
                  onActivate={handleActivate}
                  onDeactivate={handleDeactivate}
                />
              ))}
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhum cliente encontrado
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {Object.keys(filters).length > 0
                  ? 'Tente ajustar os filtros ou criar um novo cliente.'
                  : 'Comece criando seu primeiro cliente.'}
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Cliente
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo cliente
            </DialogDescription>
          </DialogHeader>
          <CustomerForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setShowCreateDialog(false)}
            isLoading={createCustomer.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
