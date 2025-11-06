/**
 * Página de Gestão de Produtos
 * /dashboard/products
 */
'use client';

import { useState } from 'react';
import { 
  useProducts, 
  useCreateProduct, 
  useUpdateProduct, 
  useDeleteProduct,
  useAddStock,
  useRemoveStock,
  useProductSummary,
  exportProductsCSV,
  exportProductsExcel,
  exportProductsPDF,
  Product,
  CreateProductInput
} from '@/hooks/useProducts';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Package, 
  AlertTriangle, 
  XCircle, 
  DollarSign,
  Loader2,
  Filter,
  Download,
  FileText
} from 'lucide-react';

// Categorias disponíveis
const CATEGORIES = [
  { value: 'pomada', label: 'Pomada' },
  { value: 'shampoo', label: 'Shampoo' },
  { value: 'condicionador', label: 'Condicionador' },
  { value: 'oleo', label: 'Óleo' },
  { value: 'cera', label: 'Cera' },
  { value: 'gel', label: 'Gel' },
  { value: 'talco', label: 'Talco' },
  { value: 'navalhete', label: 'Navalhete/Descartável' },
  { value: 'toalha', label: 'Toalha' },
  { value: 'outro', label: 'Outro' },
];

// Motivos de movimentação
const ENTRY_REASONS = [
  { value: 'compra', label: 'Compra de Fornecedor' },
  { value: 'devolucao', label: 'Devolução' },
  { value: 'ajuste', label: 'Ajuste de Inventário' },
  { value: 'outro', label: 'Outro' },
];

const EXIT_REASONS = [
  { value: 'venda', label: 'Venda ao Cliente' },
  { value: 'perda', label: 'Perda/Dano' },
  { value: 'uso_interno', label: 'Uso Interno' },
  { value: 'ajuste', label: 'Ajuste de Inventário' },
  { value: 'outro', label: 'Outro' },
];

export default function ProductsPage() {
  const { toast } = useToast();
  
  // Estados
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [showInactive, setShowInactive] = useState(false);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockOperation, setStockOperation] = useState<'add' | 'remove'>('add');
  
  // Form states
  const [formData, setFormData] = useState<Partial<CreateProductInput>>({
    is_active: true,
    stock_quantity: 0,
    min_stock: 5,
  });
  const [stockFormData, setStockFormData] = useState({
    quantity: 1,
    reason: '',
    notes: '',
  });
  
  // Queries
  const { data: products = [], isLoading } = useProducts({
    category: categoryFilter || undefined,
    is_active: showInactive ? undefined : true,
  });
  const { data: summary } = useProductSummary();
  
  // Mutations
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const addStock = useAddStock();
  const removeStock = useRemoveStock();
  
  // Handlers
  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setFormData({
      is_active: true,
      stock_quantity: 0,
      min_stock: 5,
    });
    setShowProductDialog(true);
  };
  
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      cost_price: parseFloat(product.cost_price),
      sale_price: parseFloat(product.sale_price),
      min_stock: product.min_stock,
      barcode: product.barcode,
      sku: product.sku,
      image_url: product.image_url,
      is_active: product.is_active,
    });
    setShowProductDialog(true);
  };
  
  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };
  
  const handleAddStock = (product: Product) => {
    setSelectedProduct(product);
    setStockOperation('add');
    setStockFormData({ quantity: 1, reason: 'compra', notes: '' });
    setShowStockDialog(true);
  };
  
  const handleRemoveStock = (product: Product) => {
    setSelectedProduct(product);
    setStockOperation('remove');
    setStockFormData({ quantity: 1, reason: 'ajuste', notes: '' });
    setShowStockDialog(true);
  };
  
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (selectedProduct) {
        await updateProduct.mutateAsync({
          id: selectedProduct.id,
          ...formData,
        });
        toast({
          title: 'Produto atualizado',
          description: 'As alterações foram salvas com sucesso.',
        });
      } else {
        await createProduct.mutateAsync(formData as CreateProductInput);
        toast({
          title: 'Produto criado',
          description: 'O produto foi adicionado ao inventário.',
        });
      }
      setShowProductDialog(false);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Erro',
        description: axiosError.response?.data?.message || 'Ocorreu um erro ao salvar o produto.',
        variant: 'destructive',
      });
    }
  };
  
  const handleSubmitStock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) return;
    
    try {
      if (stockOperation === 'add') {
        await addStock.mutateAsync({
          productId: selectedProduct.id,
          ...stockFormData,
        });
        toast({
          title: 'Estoque adicionado',
          description: `${stockFormData.quantity} unidades adicionadas ao estoque.`,
        });
      } else {
        await removeStock.mutateAsync({
          productId: selectedProduct.id,
          ...stockFormData,
        });
        toast({
          title: 'Estoque removido',
          description: `${stockFormData.quantity} unidades removidas do estoque.`,
        });
      }
      setShowStockDialog(false);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Erro',
        description: axiosError.response?.data?.message || 'Ocorreu um erro ao atualizar o estoque.',
        variant: 'destructive',
      });
    }
  };
  
  const confirmDelete = async () => {
    if (!selectedProduct) return;
    
    try {
      await deleteProduct.mutateAsync(selectedProduct.id);
      toast({
        title: 'Produto deletado',
        description: 'O produto foi removido do inventário.',
      });
      setShowDeleteDialog(false);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Erro',
        description: axiosError.response?.data?.message || 'Ocorreu um erro ao deletar o produto.',
        variant: 'destructive',
      });
    }
  };

  // Funções de exportação
  const handleExportCSV = async () => {
    try {
      await exportProductsCSV({});
      toast({
        title: 'Exportação concluída',
        description: 'Os produtos foram exportados para CSV.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao exportar os produtos.',
        variant: 'destructive',
      });
    }
  };

  const handleExportExcel = async () => {
    try {
      await exportProductsExcel({});
      toast({
        title: 'Exportação concluída',
        description: 'Os produtos foram exportados para Excel.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao exportar os produtos.',
        variant: 'destructive',
      });
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportProductsPDF({});
      toast({
        title: 'Exportação concluída',
        description: 'Os produtos foram exportados para PDF.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao exportar os produtos.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-4">
      {/* Header - Compacto mobile */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Produtos</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gerencie seu inventário de produtos
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleCreateProduct} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
          <div className="grid grid-cols-3 gap-2 sm:flex">
            <Button variant="outline" onClick={handleExportPDF} size="sm" className="px-3">
              <FileText className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
            <Button variant="outline" onClick={handleExportExcel} size="sm" className="px-3">
              <FileText className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Excel</span>
            </Button>
            <Button variant="outline" onClick={handleExportCSV} size="sm" className="px-3">
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">CSV</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards - Grid responsivo */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5 sm:pb-2 space-y-0">
              <CardTitle className="text-xs sm:text-sm font-medium">Produtos</CardTitle>
              <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold">{summary.total_products}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                {summary.active_products} ativos
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-1.5 sm:pb-2 space-y-0">
              <CardTitle className="text-xs sm:text-sm font-medium">Estoque Baixo</CardTitle>
              <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-600 flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-2xl font-bold text-yellow-600">
                {summary.low_stock_products}
              </div>
              <p className="text-xs text-muted-foreground">
                Produtos abaixo do mínimo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sem Estoque</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {summary.out_of_stock_products}
              </div>
              <p className="text-xs text-muted-foreground">
                Produtos esgotados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Valor do Estoque</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {parseFloat(summary.total_stock_value).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Valor total em custo
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="category">Categoria</Label>
            <Select value={categoryFilter || "all"} onValueChange={(value) => setCategoryFilter(value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              id="show-inactive"
              checked={showInactive}
              onCheckedChange={setShowInactive}
            />
            <Label htmlFor="show-inactive">Mostrar inativos</Label>
          </div>
          
          {(categoryFilter || showInactive) && (
            <Button
              variant="outline"
              onClick={() => {
                setCategoryFilter('');
                setShowInactive(false);
              }}
            >
              Limpar Filtros
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Grid de Produtos */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {categoryFilter || !showInactive
                ? 'Tente ajustar os filtros ou criar um novo produto.'
                : 'Comece adicionando seu primeiro produto ao inventário.'}
            </p>
            <Button onClick={handleCreateProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Produto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: Product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onAddStock={handleAddStock}
              onRemoveStock={handleRemoveStock}
            />
          ))}
        </div>
      )}

      {/* Dialog de Produto (Criar/Editar) */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct
                ? 'Atualize as informações do produto.'
                : 'Preencha os dados do novo produto.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitProduct} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={value => setFormData({...formData, category: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <Switch
                  id="is_active"
                  checked={formData.is_active ?? true}
                  onCheckedChange={value => setFormData({...formData, is_active: value})}
                />
                <Label htmlFor="is_active">Produto ativo</Label>
              </div>

              <div>
                <Label htmlFor="cost_price">Preço de Custo (R$) *</Label>
                <Input
                  id="cost_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost_price || ''}
                  onChange={e => setFormData({...formData, cost_price: parseFloat(e.target.value)})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="sale_price">Preço de Venda (R$) *</Label>
                <Input
                  id="sale_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.sale_price || ''}
                  onChange={e => setFormData({...formData, sale_price: parseFloat(e.target.value)})}
                  required
                />
              </div>

              {!selectedProduct && (
                <div>
                  <Label htmlFor="stock_quantity">Estoque Inicial</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    value={formData.stock_quantity || 0}
                    onChange={e => setFormData({...formData, stock_quantity: parseInt(e.target.value)})}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="min_stock">Estoque Mínimo</Label>
                <Input
                  id="min_stock"
                  type="number"
                  min="0"
                  value={formData.min_stock || 5}
                  onChange={e => setFormData({...formData, min_stock: parseInt(e.target.value)})}
                />
              </div>

              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku || ''}
                  onChange={e => setFormData({...formData, sku: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="barcode">Código de Barras</Label>
                <Input
                  id="barcode"
                  value={formData.barcode || ''}
                  onChange={e => setFormData({...formData, barcode: e.target.value})}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="image_url">URL da Imagem</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url || ''}
                  onChange={e => setFormData({...formData, image_url: e.target.value})}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowProductDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createProduct.isPending || updateProduct.isPending}
              >
                {(createProduct.isPending || updateProduct.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {selectedProduct ? 'Salvar Alterações' : 'Criar Produto'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Movimentação de Estoque */}
      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {stockOperation === 'add' ? 'Adicionar Estoque' : 'Remover Estoque'}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct?.name}
              <br />
              <span className="text-sm">
                Estoque atual: <strong>{selectedProduct?.stock_quantity}</strong> unidades
              </span>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitStock} className="space-y-4">
            <div>
              <Label htmlFor="quantity">Quantidade *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={stockOperation === 'remove' ? selectedProduct?.stock_quantity : undefined}
                value={stockFormData.quantity}
                onChange={e => setStockFormData({...stockFormData, quantity: parseInt(e.target.value)})}
                required
              />
            </div>

            <div>
              <Label htmlFor="reason">Motivo *</Label>
              <Select
                value={stockFormData.reason}
                onValueChange={value => setStockFormData({...stockFormData, reason: value})}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o motivo" />
                </SelectTrigger>
                <SelectContent>
                  {(stockOperation === 'add' ? ENTRY_REASONS : EXIT_REASONS).map(reason => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={stockFormData.notes}
                onChange={e => setStockFormData({...stockFormData, notes: e.target.value})}
                rows={3}
                placeholder="Informações adicionais sobre a movimentação..."
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowStockDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={addStock.isPending || removeStock.isPending}
              >
                {(addStock.isPending || removeStock.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Confirmar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a deletar o produto <strong>{selectedProduct?.name}</strong>.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteProduct.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
