"""
URLs do módulo de Agendamentos
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceViewSet, AppointmentViewSet

router = DefaultRouter()
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'appointments', AppointmentViewSet, basename='appointment')

urlpatterns = [
    path('', include(router.urls)),
]
