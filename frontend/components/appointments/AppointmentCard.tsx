/**
 * Card de Agendamento
 * Exibe informações de um agendamento com ações rápidas
 */
import { Appointment } from '@/hooks/useAppointments';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Scissors, Phone, Mail, CheckCircle, XCircle, PlayCircle, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (appointment: Appointment) => void;
  onConfirm?: (id: string) => void;
  onCancel?: (id: string) => void;
  onStart?: (id: string) => void;
  onComplete?: (id: string) => void;
}

const statusConfig = {
  marcado: { label: 'Marcado', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  confirmado: { label: 'Confirmado', color: 'bg-green-100 text-green-800 border-green-200' },
  em_atendimento: { label: 'Em Atendimento', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  concluido: { label: 'Concluído', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-200' },
  falta: { label: 'Falta', color: 'bg-orange-100 text-orange-800 border-orange-200' },
};

export function AppointmentCard({
  appointment,
  onEdit,
  onDelete,
  onConfirm,
  onCancel,
  onStart,
  onComplete,
}: AppointmentCardProps) {
  const statusInfo = statusConfig[appointment.status] || statusConfig.marcado;

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              {appointment.customer_name}
            </CardTitle>
          </div>
          <Badge className={`${statusInfo.color} border`}>
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        {/* Serviço */}
        <div className="flex items-center gap-2 text-sm">
          <Scissors className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{appointment.service_details?.name || 'Serviço'}</span>
          {appointment.service_details?.price && (
            <span className="text-green-600 ml-auto">
              R$ {parseFloat(appointment.service_details.price).toFixed(2)}
            </span>
          )}
        </div>

        {/* Profissional */}
        {appointment.professional_details && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>com {appointment.professional_details.name}</span>
          </div>
        )}

        {/* Data e Hora */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDateTime(appointment.start_time)}</span>
          </div>
        </div>

        {/* Duração */}
        {appointment.service_details?.duration_minutes && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{appointment.service_details.duration_minutes} minutos</span>
            {appointment.end_time && (
              <span className="ml-auto">
                até {formatTime(appointment.end_time)}
              </span>
            )}
          </div>
        )}

        {/* Contato */}
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          {appointment.customer_phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{appointment.customer_phone}</span>
            </div>
          )}
          {appointment.customer_email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="truncate">{appointment.customer_email}</span>
            </div>
          )}
        </div>

        {/* Observações */}
        {appointment.notes && (
          <div className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
            <p className="line-clamp-2">{appointment.notes}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 pt-3 border-t">
        {/* Ações baseadas no status */}
        {appointment.status === 'marcado' && onConfirm && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onConfirm(appointment.id)}
            className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Confirmar
          </Button>
        )}

        {appointment.status === 'confirmado' && onStart && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onStart(appointment.id)}
            className="flex-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
          >
            <PlayCircle className="h-4 w-4 mr-1" />
            Iniciar
          </Button>
        )}

        {appointment.status === 'em_atendimento' && onComplete && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onComplete(appointment.id)}
            className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Concluir
          </Button>
        )}

        {/* Ações sempre disponíveis (exceto para concluídos) */}
        {appointment.status !== 'concluido' && appointment.status !== 'cancelado' && (
          <>
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(appointment)}
                className="flex-1"
              >
                <Pencil className="h-4 w-4 mr-1" />
                Editar
              </Button>
            )}

            {onCancel && appointment.status !== 'cancelado' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCancel(appointment.id)}
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
            )}
          </>
        )}

        {/* Deletar (apenas admin) */}
        {onDelete && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(appointment)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
