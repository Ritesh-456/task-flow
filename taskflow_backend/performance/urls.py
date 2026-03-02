from django.urls import path
from .views import PerformanceDashboardView

urlpatterns = [
    path('dashboard', PerformanceDashboardView.as_view(), name='performance-dashboard'),
]
