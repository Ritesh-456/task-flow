from django.urls import path
from .views import TaskListCreateView, TaskDetailView, DashboardMetricsView

urlpatterns = [
    path('dashboard/', DashboardMetricsView.as_view(), name='dashboard_metrics'),
    path('', TaskListCreateView.as_view(), name='task_list_create'),
    path('<int:pk>/', TaskDetailView.as_view(), name='task_detail'),
]
