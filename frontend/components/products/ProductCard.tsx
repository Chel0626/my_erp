/**
 * Card de Produto
 * Exibe informações visuais do produto com badge de estoque
 */
'use client';

import { Product } from '@/hooks/useProducts';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Edit, 
  Trash2, 
  Plus, 
  Minus, 
  AlertTriangle,
  XCircle,
  TrendingUp
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onAddStock?: (product: Product) => void;
  onRemoveStock?: (product: Product) => void;
}

export function ProductCard({ 
  product, 
  onEdit, 
  onDelete, 
  onAddStock, 
  onRemoveStock 
}: ProductCardProps) {
  
  // Define cor do badge de estoque
  const getStockBadgeVariant = (): "destructive" | "default" | "secondary" | "outline" => {
    if (product.stock_status === 'out') return 'destructive';
    if (product.stock_status === 'low') return 'secondary';
    return 'default';
  };

  const getStockIcon = () => {
    if (product.stock_status === 'out') return <XCircle className="h-3 w-3" />;
    if (product.stock_status === 'low') return <AlertTriangle className="h-3 w-3" />;
    return <Package className="h-3 w-3" />;
  };

  const getStockLabel = () => {
    if (product.stock_status === 'out') return 'Sem Estoque';
    if (product.stock_status === 'low') return 'Estoque Baixo';
    return 'Em Estoque';
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header com imagem ou placeholder */}
      <CardHeader className="p-0">
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
          )}
          
          {/* Badge de status no canto */}
          <div className="absolute top-2 right-2 flex gap-2">
            <Badge variant={getStockBadgeVariant()} className="gap-1">
              {getStockIcon()}
              {getStockLabel()}
            </Badge>
            
            {!product.is_active && (
              <Badge variant="secondary">Inativo</Badge>
            )}
          </div>
          
          {/* Badge de categoria */}
          <div className="absolute bottom-2 left-2">
            <Badge variant="outline" className="bg-white/90 dark:bg-gray-900/90">
              {product.category_display}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {/* Conteúdo */}
      <CardContent className="p-4">
        {/* Nome do produto */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        {/* Descrição */}
        {product.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        
        {/* Preços */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Custo</p>
            <p className="text-sm font-medium">
              R$ {parseFloat(product.cost_price).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Venda</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              R$ {parseFloat(product.sale_price).toFixed(2)}
            </p>
          </div>
        </div>
        
        {/* Margem de lucro */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <TrendingUp className="h-3 w-3" />
          <span>Margem: {product.profit_margin.toFixed(1)}%</span>
        </div>
        
        {/* Estoque */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground">Estoque Atual</p>
              <p className="text-2xl font-bold">
                {product.stock_quantity}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Mínimo</p>
              <p className="text-sm font-medium text-muted-foreground">
                {product.min_stock}
              </p>
            </div>
          </div>
        </div>
        
        {/* Códigos (se houver) */}
        {(product.sku || product.barcode) && (
          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground space-y-1">
            {product.sku && <p>SKU: {product.sku}</p>}
            {product.barcode && <p>Código: {product.barcode}</p>}
          </div>
        )}
      </CardContent>

      {/* Footer com ações */}
      <CardFooter className="p-4 pt-0 flex gap-2">
        {onAddStock && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAddStock(product)}
            className="flex-1"
          >
            <Plus className="h-4 w-4 mr-1" />
            Entrada
          </Button>
        )}
        
        {onRemoveStock && product.stock_quantity > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRemoveStock(product)}
            className="flex-1"
          >
            <Minus className="h-4 w-4 mr-1" />
            Saída
          </Button>
        )}
        
        {onEdit && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(product)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
        
        {onDelete && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(product)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
