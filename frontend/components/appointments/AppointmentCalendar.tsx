'use client';

import { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { Appointment } from '@/hooks/useAppointments';
import { Service } from '@/hooks/useServices';

interface AppointmentCalendarProps {
  appointments: Appointment[];
  services: Service[];
  onEventClick?: (appointment: Appointment) => void;
  onDateClick?: (date: Date) => void;
  onEventDrop?: (appointmentId: string, newStart: Date) => void;
}

// Função para gerar cores consistentes por serviço
const getServiceColor = (serviceId: string, index: number): string => {
  const colors = [
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#f59e0b', // amber-500
    '#10b981', // emerald-500
    '#06b6d4', // cyan-500
    '#f97316', // orange-500
    '#6366f1', // indigo-500
    '#14b8a6', // teal-500
    '#a855f7', // purple-500
  ];
  
  return colors[index % colors.length];
};

// Função para obter cor por status
const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'marcado': '#94a3b8',      // slate-400
    'confirmado': '#3b82f6',   // blue-500
    'em_atendimento': '#f59e0b', // amber-500
    'concluido': '#10b981',    // emerald-500
    'cancelado': '#ef4444',    // red-500
    'falta': '#6b7280',        // gray-500
  };
  
  return statusColors[status] || statusColors['marcado'];
};

export default function AppointmentCalendar({
  appointments,
  services,
  onEventClick,
  onDateClick,
  onEventDrop,
}: AppointmentCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [view, setView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'>('timeGridWeek');

  // Mapeia serviços para cores
  const serviceColorMap = new Map<string, string>();
  services.forEach((service, index) => {
    serviceColorMap.set(service.id, getServiceColor(service.id, index));
  });

  // Converte appointments para eventos do FullCalendar
  const events = appointments.map(appointment => {
    const service = services.find(s => s.id === appointment.service);
    const serviceColor = service ? serviceColorMap.get(service.id) : '#6b7280'; // gray-500 como fallback
    
    // Cor principal: Serviço
    // Borda: Indicador de status (mais grossa para status importantes)
    const statusBorderStyle = appointment.status === 'cancelado' ? '4px solid #ef4444' : // red-500
                              appointment.status === 'concluido' ? '4px solid #10b981' : // green-500
                              appointment.status === 'em_atendimento' ? '4px solid #f59e0b' : // amber-500
                              appointment.status === 'confirmado' ? '3px solid #3b82f6' : // blue-500
                              '2px solid transparent';

    return {
      id: appointment.id,
      title: `${appointment.customer_name} - ${service?.name || 'Serviço'}`,
      start: appointment.start_time,
      end: appointment.end_time,
      backgroundColor: serviceColor,
      borderColor: serviceColor,
      textColor: '#ffffff',
      extendedProps: {
        appointment,
        service,
        statusBorderStyle,
      },
    };
  });

  const handleEventClick = (info: any) => {
    if (onEventClick) {
      onEventClick(info.event.extendedProps.appointment);
    }
  };

  const handleDateClick = (info: any) => {
    if (onDateClick) {
      onDateClick(info.date);
    }
  };

  const handleEventDrop = (info: any) => {
    if (onEventDrop) {
      onEventDrop(info.event.id, info.event.start);
    }
  };

  // Aplica estilos customizados aos eventos após renderização
  const handleEventDidMount = (info: any) => {
    const statusBorderStyle = info.event.extendedProps.statusBorderStyle;
    if (statusBorderStyle && info.el) {
      // Encontra o elemento .fc-event
      const eventEl = info.el.querySelector('.fc-event') || info.el;
      eventEl.style.border = statusBorderStyle;
    }
  };

  return (
    <div className="space-y-4">
      {/* Botões de Visualização */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setView('dayGridMonth');
            calendarRef.current?.getApi().changeView('dayGridMonth');
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            view === 'dayGridMonth'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Mês
        </button>
        <button
          onClick={() => {
            setView('timeGridWeek');
            calendarRef.current?.getApi().changeView('timeGridWeek');
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            view === 'timeGridWeek'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Semana
        </button>
        <button
          onClick={() => {
            setView('timeGridDay');
            calendarRef.current?.getApi().changeView('timeGridDay');
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            view === 'timeGridDay'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Dia
        </button>
        <button
          onClick={() => {
            setView('listWeek');
            calendarRef.current?.getApi().changeView('listWeek');
          }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            view === 'listWeek'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Lista
        </button>
      </div>

      {/* Legenda de Serviços */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Cores dos Serviços</h3>
        <div className="flex flex-wrap gap-3">
          {services.map((service) => (
            <div key={service.id} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: serviceColorMap.get(service.id) }}
              />
              <span className="text-sm text-gray-700">{service.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legenda de Status (Bordas) */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Indicadores de Status</h3>
        <p className="text-xs text-muted-foreground mb-3">
          A cor do evento indica o serviço. O status é mostrado por:
        </p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 rounded" style={{ 
              backgroundColor: '#6b7280', 
              border: '4px solid #ef4444' 
            }} />
            <span className="text-sm text-gray-700">Cancelado (borda vermelha)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 rounded" style={{ 
              backgroundColor: '#6b7280', 
              border: '4px solid #10b981' 
            }} />
            <span className="text-sm text-gray-700">Concluído (borda verde)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 rounded" style={{ 
              backgroundColor: '#6b7280', 
              border: '4px solid #f59e0b' 
            }} />
            <span className="text-sm text-gray-700">Em Atendimento (borda amarela)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 rounded" style={{ 
              backgroundColor: '#6b7280', 
              border: '3px solid #3b82f6' 
            }} />
            <span className="text-sm text-gray-700">Confirmado (borda azul)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 rounded" style={{ 
              backgroundColor: '#6b7280', 
              border: '2px solid transparent' 
            }} />
            <span className="text-sm text-gray-700">Marcado (sem borda)</span>
          </div>
        </div>
      </div>

      {/* Calendário */}
      <div className="bg-white border rounded-lg p-4 calendar-container">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView={view}
          locale={ptBrLocale}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: '',
          }}
          buttonText={{
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia',
            list: 'Lista',
          }}
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          slotDuration="00:30:00"
          allDaySlot={false}
          height="auto"
          events={events}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
          editable={true}
          eventDrop={handleEventDrop}
          eventDidMount={handleEventDidMount}
          eventResizableFromStart={true}
          nowIndicator={true}
          weekends={true}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
          }}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
          }}
          dayHeaderFormat={{
            weekday: 'short',
            day: 'numeric',
          }}
          eventContent={(arg) => {
            return (
              <div className="fc-event-main-frame p-1">
                <div className="fc-event-time text-xs font-semibold">
                  {arg.timeText}
                </div>
                <div className="fc-event-title text-xs truncate">
                  {arg.event.title}
                </div>
              </div>
            );
          }}
        />
      </div>

      <style jsx global>{`
        .calendar-container {
          min-height: 600px;
        }
        
        .fc {
          font-family: inherit;
        }
        
        .fc .fc-button {
          background-color: hsl(var(--primary));
          border-color: hsl(var(--primary));
          text-transform: capitalize;
          font-size: 0.875rem;
          padding: 0.5rem 1rem;
        }
        
        .fc .fc-button:hover {
          background-color: hsl(var(--primary) / 0.9);
          border-color: hsl(var(--primary) / 0.9);
        }
        
        .fc .fc-button:disabled {
          opacity: 0.5;
        }
        
        .fc .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          background-color: hsl(var(--primary) / 0.8);
          border-color: hsl(var(--primary) / 0.8);
        }
        
        .fc-theme-standard td,
        .fc-theme-standard th {
          border-color: hsl(var(--border));
        }
        
        .fc .fc-col-header-cell {
          background-color: hsl(var(--muted));
          font-weight: 600;
          padding: 0.75rem 0.5rem;
        }
        
        .fc .fc-timegrid-slot {
          height: 3rem;
        }
        
        .fc .fc-event {
          cursor: pointer;
          border-radius: 4px;
          padding: 2px;
        }
        
        .fc .fc-event:hover {
          opacity: 0.85;
          transform: scale(1.02);
          transition: all 0.2s ease;
        }

        /* Corrige overflow de texto no calendário mensal */
        .fc .fc-daygrid-event {
          white-space: normal;
          overflow: hidden;
          text-overflow: ellipsis;
          position: relative;
          z-index: 1;
        }

        .fc .fc-daygrid-event-harness {
          margin-bottom: 2px;
        }

        .fc .fc-daygrid-day-events {
          margin-bottom: 0;
        }

        .fc .fc-event-main {
          overflow: hidden;
        }

        .fc .fc-event-title {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }

        .fc .fc-event-time {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }
        
        .fc .fc-daygrid-day-number {
          padding: 0.5rem;
          font-weight: 500;
        }
        
        .fc .fc-daygrid-day.fc-day-today {
          background-color: hsl(var(--accent));
        }
        
        .fc .fc-timegrid-now-indicator-line {
          border-color: hsl(var(--destructive));
          border-width: 2px;
        }
        
        .fc .fc-list-event:hover td {
          background-color: hsl(var(--muted));
        }
      `}</style>
    </div>
  );
}
