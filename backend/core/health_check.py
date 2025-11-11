"""
Simple health check endpoint for UptimeRobot monitoring.
Public endpoint without authentication.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.cache import cache
from django.db import connection


class PublicHealthCheckView(APIView):
    """
    Public health check endpoint for external monitoring (UptimeRobot).
    No authentication required.
    
    Returns:
        200 OK if service is healthy
        503 Service Unavailable if critical services are down
    """
    authentication_classes = []  # No authentication
    permission_classes = []  # No permissions
    
    def get(self, request):
        """
        Check basic service health.
        """
        health_status = {
            "status": "ok",
            "service": "my_erp",
            "checks": {}
        }
        
        is_healthy = True
        
        # Check database
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            health_status["checks"]["database"] = "ok"
        except Exception as e:
            health_status["checks"]["database"] = f"error: {str(e)}"
            is_healthy = False
        
        # Check cache (Redis)
        try:
            cache.set("health_check_test", "ok", timeout=10)
            cache_value = cache.get("health_check_test")
            if cache_value == "ok":
                health_status["checks"]["cache"] = "ok"
            else:
                health_status["checks"]["cache"] = "warning: value mismatch"
        except Exception as e:
            health_status["checks"]["cache"] = f"error: {str(e)}"
            # Cache failure is not critical for health check
        
        # Return appropriate status code
        if is_healthy:
            return Response(health_status, status=status.HTTP_200_OK)
        else:
            health_status["status"] = "unhealthy"
            return Response(health_status, status=status.HTTP_503_SERVICE_UNAVAILABLE)
