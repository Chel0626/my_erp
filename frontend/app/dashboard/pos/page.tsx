'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCurrentCashRegister, useOpenCashRegister, useCreateSale } from '@/hooks/usePOS';
import { useProducts, type Product } from '@/hooks/useProducts';
import { useServices, type Service } from '@/hooks/useServices';
import { useCustomers, type CustomerListItem } from '@/hooks/useCustomers';
import { CartItem } from '@/types/pos';
import { ShoppingCart, DollarSign, Package, Briefcase, AlertCircle, CreditCard } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyInput } from '@/components/ui/currency-input';
import { toast } from 'sonner';

export default function POSPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [discount, setDiscount] = useState('0');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOpenCash, setShowOpenCash] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');

  const { data: currentCash, isLoading: cashLoading } = useCurrentCashRegister();
  const { data: products } = useProducts();
  const { data: services } = useServices();
  const { data: customers } = useCustomers();
  const openCash = useOpenCashRegister();
  const createSale = useCreateSale();

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

  const filteredProducts = products?.filter((p: Product) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredServices = services?.filter((s: Service) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (cashLoading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">PDV - Ponto de Venda</h1>
          <p className="text-muted-foreground">Sistema de vendas e caixa</p>
        </div>
        {currentCash && (
          <Badge variant="outline" className="text-lg px-4 py-2">
            Caixa Aberto - Saldo: R$ {parseFloat(currentCash.opening_balance).toFixed(2)}
          </Badge>
        )}
      </div>

      {/* Alert se não há caixa aberto */}
      {!currentCash && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você precisa abrir o caixa antes de realizar vendas.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Produtos e Serviços */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar produtos ou serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Produtos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto">
                {filteredProducts?.map((product: Product) => (
                  <Button
                    key={product.id}
                    variant="outline"
                    className="h-auto flex-col items-start p-3"
                    onClick={() => addToCart('product', product)}
                    disabled={!currentCash || product.stock_quantity <= 0}
                  >
                    <span className="font-semibold text-sm">{product.name}</span>
                    <span className="text-green-600 font-bold">
                      R$ {parseFloat(product.sale_price).toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Estoque: {product.stock_quantity}
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Serviços */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Serviços
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto">
                {filteredServices?.map((service: Service) => (
                  <Button
                    key={service.id}
                    variant="outline"
                    className="h-auto flex-col items-start p-3"
                    onClick={() => addToCart('service', service)}
                    disabled={!currentCash}
                  >
                    <span className="font-semibold text-sm">{service.name}</span>
                    <span className="text-green-600 font-bold">
                      R$ {parseFloat(service.price).toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {service.duration_minutes} min
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Carrinho */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrinho ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cliente */}
              <div className="space-y-2">
                <Label>Cliente (opcional)</Label>
                <Select
                  value={selectedCustomer?.toString() || ''}
                  onValueChange={(value) => setSelectedCustomer(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map((customer: CustomerListItem) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Items */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Carrinho vazio
                  </p>
                ) : (
                  cart.map((item) => (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="flex items-center justify-between gap-2 p-2 border rounded"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          R$ {item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateQuantity(item.type, item.id, item.quantity - 1)
                          }
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateQuantity(item.type, item.id, item.quantity + 1)
                          }
                        >
                          +
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromCart(item.type, item.id)}
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
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">
                      R$ {calculateSubtotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label>Desconto:</Label>
                    <Input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-24"
                    />
                  </div>
                  <div className="flex justify-between text-lg font-bold">
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
                  className="w-full"
                  size="lg"
                  onClick={() => setShowPayment(true)}
                  disabled={cart.length === 0 || !currentCash}
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Finalizar Venda
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir Caixa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Saldo Inicial</Label>
              <CurrencyInput
                value={openingBalance}
                onChange={setOpeningBalance}
                placeholder="R$ 0,00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleOpenCash} disabled={openCash.isPending}>
              {openCash.isPending ? 'Abrindo...' : 'Abrir Caixa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Pagamento */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizar Venda</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
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
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between text-2xl font-bold">
                <span>Total a Pagar:</span>
                <span className="text-green-600">R$ {calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayment(false)}>
              Cancelar
            </Button>
            <Button onClick={handleFinalizeSale} disabled={createSale.isPending}>
              {createSale.isPending ? 'Processando...' : 'Confirmar Pagamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
