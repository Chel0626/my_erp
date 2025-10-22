"""
URL configuration for notifications app.
"""
from django.urls import path
from .views import NotificationViewSet

# Define as rotas manualmente para evitar duplicação do prefixo
urlpatterns = [
    path('', NotificationViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='notification-list'),
    path('<uuid:pk>/', NotificationViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='notification-detail'),
    path('unread/', NotificationViewSet.as_view({
        'get': 'unread'
    }), name='notification-unread'),
    path('count/', NotificationViewSet.as_view({
        'get': 'count'
    }), name='notification-count'),
    path('mark_as_read/', NotificationViewSet.as_view({
        'post': 'mark_as_read'
    }), name='notification-mark-as-read'),
    path('mark_all_as_read/', NotificationViewSet.as_view({
        'post': 'mark_all_as_read'
    }), name='notification-mark-all-as-read'),
    path('<uuid:pk>/mark_read/', NotificationViewSet.as_view({
        'post': 'mark_read'
    }), name='notification-mark-read'),
]
