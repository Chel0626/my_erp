/**
 * Card de Serviço
 * Exibe informações de um serviço com ações de editar/deletar
 */
import { Service } from '@/hooks/useServices';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Clock, DollarSign } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onToggleStatus: (service: Service) => void;
}

export function ServiceCard({ service, onEdit, onDelete, onToggleStatus }: ServiceCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{service.name}</CardTitle>
            <CardDescription className="mt-1">
              {service.description || 'Sem descrição'}
            </CardDescription>
          </div>
          <Badge 
            variant={service.is_active ? 'default' : 'secondary'}
            className="cursor-pointer"
            onClick={() => onToggleStatus(service)}
          >
            {service.is_active ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-green-600">
            R$ {parseFloat(service.price).toFixed(2)}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{service.duration_minutes} minutos</span>
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(service)}
          className="flex-1"
        >
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(service)}
          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Deletar
        </Button>
      </CardFooter>
    </Card>
  );
}
