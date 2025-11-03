from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GoalViewSet, GoalProgressViewSet

router = DefaultRouter()
router.register(r'goals', GoalViewSet, basename='goal')
router.register(r'progress', GoalProgressViewSet, basename='goalprogress')

urlpatterns = [
    path('', include(router.urls)),
]
