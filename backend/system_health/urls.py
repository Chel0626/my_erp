"""
URLs para System Health Monitoring
"""

from django.urls import path
from .views import (
    SentryHealthView,
    SentryPerformanceView,
    RedisMetricsView,
    RedisFlushAllView,
    RedisDeleteKeyView,
    RedisInspectKeyView,
    InfraMetricsView,
    UptimeStatusView,
    OnlineUsersView,
)

urlpatterns = [
    # Sentry
    path('sentry/health/', SentryHealthView.as_view(), name='sentry-health'),
    path('sentry/performance/', SentryPerformanceView.as_view(), name='sentry-performance'),
    
    # Redis
    path('redis/metrics/', RedisMetricsView.as_view(), name='redis-metrics'),
    path('redis/flushall/', RedisFlushAllView.as_view(), name='redis-flushall'),
    path('redis/del_key/', RedisDeleteKeyView.as_view(), name='redis-delete-key'),
    path('redis/inspect_key/', RedisInspectKeyView.as_view(), name='redis-inspect-key'),
    
    # Infrastructure
    path('infra/metrics/', InfraMetricsView.as_view(), name='infra-metrics'),
    
    # Uptime & Users
    path('uptime/status/', UptimeStatusView.as_view(), name='uptime-status'),
    path('users/online/', OnlineUsersView.as_view(), name='online-users'),
]
