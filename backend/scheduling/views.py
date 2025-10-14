"""
Views do módulo de Agendamentos
Implementa BLOCO 4: Workflows do módulo de Agendamentos
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import timedelta

from .models import Service, Appointment
from .serializers import (
    ServiceSerializer,
    AppointmentSerializer,
    CreateAppointmentSerializer
)
from core.permissions import IsSameTenant, IsTenantAdmin


class ServiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento de Serviços
    Implementa filtros automáticos por tenant
    """
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated, IsSameTenant]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_active']

    def get_queryset(self):
        """
        Retorna apenas serviços do mesmo tenant
        Implementa: BLOCO 3 - Regras de Segurança
        """
        if self.request.user.is_authenticated:
            return Service.objects.filter(tenant=self.request.user.tenant)
        return Service.objects.none()

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Retorna apenas serviços ativos"""
        services = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(services, many=True)
        return Response(serializer.data)


class AppointmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento de Agendamentos
    Implementa: BLOCO 4 - Workflow: Criar Novo Agendamento
    """
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsSameTenant]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'professional', 'service']

    def get_queryset(self):
        """
        Retorna apenas agendamentos do mesmo tenant
        Implementa: BLOCO 3 - Regras de Segurança
        """
        if self.request.user.is_authenticated:
            queryset = Appointment.objects.filter(tenant=self.request.user.tenant)
            
            # Filtros opcionais via query params
            date = self.request.query_params.get('date', None)
            if date:
                queryset = queryset.filter(start_time__date=date)
            
            start_date = self.request.query_params.get('start_date', None)
            end_date = self.request.query_params.get('end_date', None)
            if start_date and end_date:
                queryset = queryset.filter(
                    start_time__date__gte=start_date,
                    start_time__date__lte=end_date
                )
            
            return queryset
        return Appointment.objects.none()

    def create(self, request, *args, **kwargs):
        """
        Cria novo agendamento
        Usa serializer simplificado para melhor UX
        """
        serializer = CreateAppointmentSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        appointment = serializer.save()

        # Retorna com o serializer completo
        output_serializer = AppointmentSerializer(appointment)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def today(self, request):
        """Retorna agendamentos do dia atual"""
        today = timezone.now().date()
        appointments = self.get_queryset().filter(start_time__date=today)
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def week(self, request):
        """Retorna agendamentos da semana atual"""
        today = timezone.now().date()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        
        appointments = self.get_queryset().filter(
            start_time__date__gte=week_start,
            start_time__date__lte=week_end
        )
        serializer = self.get_serializer(appointments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirma um agendamento"""
        appointment = self.get_object()
        appointment.status = 'confirmado'
        appointment.save()
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Inicia atendimento"""
        appointment = self.get_object()
        appointment.status = 'em_atendimento'
        appointment.save()
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Conclui um agendamento"""
        appointment = self.get_object()
        appointment.status = 'concluido'
        appointment.save()
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancela um agendamento"""
        appointment = self.get_object()
        appointment.status = 'cancelado'
        appointment.save()
        serializer = self.get_serializer(appointment)
        return Response(serializer.data)
