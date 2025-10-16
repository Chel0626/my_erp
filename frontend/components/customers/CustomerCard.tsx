/**
 * Card de Cliente
 * Exibe resumo do cliente com ações
 */
import { Customer, CustomerListItem } from '@/hooks/useCustomers';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Eye,
  Edit,
  MoreVertical,
  Phone,
  Mail,
  Calendar,
  UserX,
  UserCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CustomerCardProps {
  customer: CustomerListItem | Customer;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onActivate?: (id: string) => void;
  onDeactivate?: (id: string) => void;
}

// Configuração de tags
const tagConfig = {
  VIP: {
    label: 'VIP',
    variant: 'default' as const,
    emoji: '⭐',
    className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  },
  REGULAR: {
    label: 'Regular',
    variant: 'secondary' as const,
    emoji: '👤',
    className: 'bg-blue-500 hover:bg-blue-600 text-white',
  },
  NOVO: {
    label: 'Novo',
    variant: 'outline' as const,
    emoji: '✨',
    className: 'bg-green-500 hover:bg-green-600 text-white',
  },
  INATIVO: {
    label: 'Inativo',
    variant: 'destructive' as const,
    emoji: '💤',
    className: 'bg-gray-500 hover:bg-gray-600 text-white',
  },
};

export function CustomerCard({
  customer,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
}: CustomerCardProps) {
  const tagInfo = tagConfig[customer.tag];
  
  // Iniciais para avatar
  const initials = customer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleCardClick = () => {
    if (onView) {
      onView(customer.id);
    }
  };

  return (
    <Card
      className={`hover:shadow-lg transition-all cursor-pointer ${
        !customer.is_active ? 'opacity-60' : ''
      }`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={'avatar_url' in customer ? customer.avatar_url : undefined}
                alt={customer.name}
              />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">
                {customer.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={tagInfo.className}>
                  {tagInfo.emoji} {tagInfo.label}
                </Badge>
                {!customer.is_active && (
                  <Badge variant="outline" className="text-xs">
                    Inativo
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onView(customer.id);
                }}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalhes
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onEdit(customer.id);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {customer.is_active ? (
                onDeactivate && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeactivate(customer.id);
                    }}
                    className="text-red-600"
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Desativar
                  </DropdownMenuItem>
                )
              ) : (
                onActivate && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onActivate(customer.id);
                    }}
                    className="text-green-600"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Ativar
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Telefone */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>{customer.phone}</span>
        </div>

        {/* Email */}
        {customer.email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span className="truncate">{customer.email}</span>
          </div>
        )}

        {/* Última visita */}
        {customer.last_visit && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Última visita:{' '}
              {format(new Date(customer.last_visit), 'dd/MM/yyyy', {
                locale: ptBR,
              })}
            </span>
          </div>
        )}

        {/* Aniversário este mês */}
        {'is_birthday_month' in customer && customer.is_birthday_month && (
          <div className="flex items-center gap-2 text-sm text-amber-600 font-medium mt-2">
            🎂 Aniversariante este mês!
          </div>
        )}

        {/* Stats (se disponível) */}
        {'total_appointments' in customer && customer.total_appointments !== undefined && (
          <div className="flex gap-4 mt-3 pt-3 border-t text-sm">
            <div>
              <span className="text-muted-foreground">Agendamentos: </span>
              <span className="font-semibold">{customer.total_appointments}</span>
            </div>
            {customer.total_spent !== undefined && (
              <div>
                <span className="text-muted-foreground">Gasto: </span>
                <span className="font-semibold">
                  R$ {customer.total_spent.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
