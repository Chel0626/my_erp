'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCurrentCashRegister, useOpenCashRegister, useCreateSale } from '@/hooks/usePOS';
import { useProducts, type Product } from '@/hooks/useProducts';
import { useServices, type Service } from '@/hooks/useServices';
import { useCustomers, useCreateCustomer, type CustomerListItem } from '@/hooks/useCustomers';
import { CartItem } from '@/types/pos';
import { ShoppingCart, Package, Briefcase, AlertCircle, CreditCard, UserPlus, Search, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyInput } from '@/components/ui/currency-input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function POSPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [discount, setDiscount] = useState('0');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOpenCash, setShowOpenCash] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [openProductSearch, setOpenProductSearch] = useState(false);
  const [openServiceSearch, setOpenServiceSearch] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const { data: currentCash, isLoading: cashLoading } = useCurrentCashRegister();
  const { data: products } = useProducts();
  const { data: services } = useServices();
  const { data: customers } = useCustomers();
  const openCash = useOpenCashRegister();
  const createSale = useCreateSale();
  const createCustomer = useCreateCustomer();

  // Verificar se há caixa aberto
  useEffect(() => {
    if (!cashLoading && !currentCash) {
      setShowOpenCash(true);
    }
  }, [currentCash, cashLoading]);

  const handleOpenCash = async () => {
    try {
      await openCash.mutateAsync({
        opening_balance: openingBalance,
        notes: 'Abertura de caixa',
      });
      toast.success('Caixa aberto com sucesso!');
      setShowOpenCash(false);
    } catch (error) {
      toast.error('Erro ao abrir caixa');
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      toast.error('Preencha nome e telefone');
      return;
    }
    
    try {
      const created = await createCustomer.mutateAsync(newCustomer);
      setSelectedCustomer(Number(created.id));
      setShowNewCustomer(false);
      setNewCustomer({ name: '', phone: '', email: '' });
      toast.success('Cliente criado e selecionado!');
    } catch (error) {
      toast.error('Erro ao criar cliente');
    }
  };

  const addToCart = (type: 'product' | 'service', item: Product | Service) => {
    const existingItem = cart.find(
      (cartItem) => cartItem.type === type && cartItem.id.toString() === item.id.toString()
    );

    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.type === type && cartItem.id.toString() === item.id.toString()
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      const price = type === 'product' 
        ? parseFloat((item as Product).sale_price || '0')
        : parseFloat((item as Service).price || '0');
      
      setCart([
        ...cart,
        {
          type,
          id: item.id,
          name: item.name,
          quantity: 1,
          price,
          discount: 0,
        },
      ]);
    }
  };

  const removeFromCart = (type: string, id: string | number) => {
    setCart(cart.filter((item) => !(item.type === type && item.id.toString() === id.toString())));
  };

  const updateQuantity = (type: string, id: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(type, id);
      return;
    }
    setCart(
      cart.map((item) =>
        item.type === type && item.id.toString() === id.toString() ? { ...item, quantity } : item
      )
    );
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - parseFloat(discount || '0');
  };

  const handleFinalizeSale = async () => {
    if (cart.length === 0) {
      toast.error('Adicione itens ao carrinho');
      return;
    }

    try {
      const saleData = {
        customer: selectedCustomer,
        discount: discount || '0',
        payment_method: paymentMethod,
        payment_status: 'paid',
        notes: '',
        items: cart.map((item) => ({
          product: item.type === 'product' ? (typeof item.id === 'string' ? parseInt(item.id) : item.id) : null,
          service: item.type === 'service' ? (typeof item.id === 'string' ? parseInt(item.id) : item.id) : null,
          professional: item.professional || null,
          quantity: item.quantity.toString(),
          unit_price: item.price.toString(),
          discount: item.discount.toString(),
        })),
      };

      await createSale.mutateAsync(saleData);
      toast.success('Venda realizada com sucesso!');
      
      // Limpar carrinho
      setCart([]);
      setSelectedCustomer(null);
      setDiscount('0');
      setShowPayment(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || 'Erro ao finalizar venda');
    }
  };

  if (cashLoading) {
    return <div className="p-3 sm:p-6 text-sm sm:text-base">Carregando...</div>;
  }

  return (
    <div className="p-3 sm:p-6 space-y-3 sm:space-y-6 pb-20 lg:pb-6">
      {/* Header - Compacto mobile */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">PDV - Ponto de Venda</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Sistema de vendas e caixa</p>
        </div>
        {currentCash && (
          <Badge variant="outline" className="text-xs sm:text-base px-2 py-1 sm:px-4 sm:py-2 self-start">
            Caixa Aberto - R$ {parseFloat(currentCash.opening_balance).toFixed(2)}
          </Badge>
        )}
      </div>

      {/* Alert se não há caixa aberto */}
      {!currentCash && (
        <Alert className="py-2.5 sm:py-3">
          <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <AlertDescription className="text-xs sm:text-sm">
            Você precisa abrir o caixa antes de realizar vendas.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Busca de Produtos e Serviços */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {/* Produtos - Combobox */}
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Popover open={openProductSearch} onOpenChange={setOpenProductSearch}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openProductSearch}
                    className="w-full justify-between h-10 text-sm"
                    disabled={!currentCash}
                  >
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Buscar produto para adicionar...</span>
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Digite o nome do produto..." />
                    <CommandList>
                      <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                      <CommandGroup>
                        {products?.filter((p: Product) => p.is_active).map((product: Product) => (
                          <CommandItem
                            key={product.id}
                            value={product.name}
                            onSelect={() => {
                              if (product.stock_quantity > 0) {
                                addToCart('product', product);
                                setOpenProductSearch(false);
                              } else {
                                toast.error('Produto sem estoque');
                              }
                            }}
                            className="flex items-center justify-between cursor-pointer"
                            disabled={product.stock_quantity <= 0}
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium">{product.name}</span>
                              <span className="text-xs text-muted-foreground">
                                Estoque: {product.stock_quantity} • R$ {parseFloat(product.sale_price).toFixed(2)}
                              </span>
                            </div>
                            {product.stock_quantity <= 0 && (
                              <Badge variant="destructive" className="text-xs">Sem estoque</Badge>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

          {/* Serviços - Combobox */}
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
                Serviços
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Popover open={openServiceSearch} onOpenChange={setOpenServiceSearch}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openServiceSearch}
                    className="w-full justify-between h-10 text-sm"
                    disabled={!currentCash}
                  >
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Buscar serviço para adicionar...</span>
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Digite o nome do serviço..." />
                    <CommandList>
                      <CommandEmpty>Nenhum serviço encontrado.</CommandEmpty>
                      <CommandGroup>
                        {services?.filter((s: Service) => s.is_active).map((service: Service) => (
                          <CommandItem
                            key={service.id}
                            value={service.name}
                            onSelect={() => {
                              addToCart('service', service);
                              setOpenServiceSearch(false);
                            }}
                            className="flex items-center justify-between cursor-pointer"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium">{service.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {service.duration_minutes} min • R$ {parseFloat(service.price).toFixed(2)}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>
        </div>

        {/* Carrinho - Fixed mobile */}
        <div className="space-y-3 sm:space-y-4 lg:sticky lg:top-4">
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                Carrinho ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {/* Cliente */}
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs sm:text-sm">Cliente (opcional)</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewCustomer(true)}
                    className="h-6 sm:h-7 text-[10px] sm:text-xs px-2"
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    Novo
                  </Button>
                </div>
                <Select
                  value={selectedCustomer?.toString() || ''}
                  onValueChange={(value) => setSelectedCustomer(parseInt(value))}
                >
                  <SelectTrigger className="h-9 sm:h-10 text-xs sm:text-sm">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map((customer: CustomerListItem) => (
                      <SelectItem key={customer.id} value={customer.id.toString()} className="text-xs sm:text-sm">
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Items */}
              <div className="space-y-2 max-h-[250px] sm:max-h-[300px] overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6 sm:py-8 text-xs sm:text-sm">
                    Carrinho vazio
                  </p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="flex items-center justify-between gap-2 p-2 border rounded"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs sm:text-sm truncate">{item.name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          R$ {item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateQuantity(item.type, item.id, item.quantity - 1)
                          }
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-sm"
                        >
                          -
                        </Button>
                        <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateQuantity(item.type, item.id, item.quantity + 1)
                          }
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-sm"
                        >
                          +
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromCart(item.type, item.id)}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-base sm:text-lg"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Totais */}
              {cart.length > 0 && (
                <div className="space-y-2 border-t pt-3 sm:pt-4">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Subtotal:</span>
                    <span className="font-semibold">
                      R$ {calculateSubtotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs sm:text-sm">Desconto:</Label>
                    <Input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-20 sm:w-24 h-8 sm:h-10 text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex justify-between text-base sm:text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">
                      R$ {calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="space-y-2">
                <Button
                  className="w-full h-11 sm:h-12 text-sm sm:text-base"
                  onClick={() => setShowPayment(true)}
                  disabled={cart.length === 0 || !currentCash}
                >
                  <CreditCard className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Finalizar Venda
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-9 sm:h-10 text-xs sm:text-sm"
                  onClick={() => setCart([])}
                  disabled={cart.length === 0}
                >
                  Limpar Carrinho
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog: Abrir Caixa */}
      <Dialog open={showOpenCash} onOpenChange={setShowOpenCash}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Abrir Caixa</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Saldo Inicial</Label>
              <CurrencyInput
                value={openingBalance}
                onChange={setOpeningBalance}
                placeholder="R$ 0,00"
                className="h-9 sm:h-10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleOpenCash} disabled={openCash.isPending} className="w-full sm:w-auto">
              {openCash.isPending ? 'Abrindo...' : 'Abrir Caixa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Novo Cliente */}
      <Dialog open={showNewCustomer} onOpenChange={setShowNewCustomer}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Cadastro Rápido de Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Nome *</Label>
              <Input
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                placeholder="Nome completo"
                className="h-9 sm:h-10"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Telefone *</Label>
              <Input
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                placeholder="(00) 00000-0000"
                className="h-9 sm:h-10"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Email (opcional)</Label>
              <Input
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                placeholder="email@exemplo.com"
                className="h-9 sm:h-10"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowNewCustomer(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleCreateCustomer} disabled={createCustomer.isPending} className="w-full sm:w-auto">
              {createCustomer.isPending ? 'Salvando...' : 'Salvar Cliente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Pagamento */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Finalizar Venda</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Forma de Pagamento</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="h-9 sm:h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                  <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="bank_transfer">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted p-3 sm:p-4 rounded-lg">
              <div className="flex justify-between text-xl sm:text-2xl font-bold">
                <span>Total:</span>
                <span className="text-green-600">R$ {calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowPayment(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleFinalizeSale} disabled={createSale.isPending} className="w-full sm:w-auto">
              {createSale.isPending ? 'Processando...' : 'Confirmar Pagamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
