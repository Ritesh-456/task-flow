from django.urls import path
from .views import (
    OverviewAnalyticsView,
    TaskDistributionView,
    TasksOverTimeView,
    UserProductivityView,
    ProjectProgressView
)

urlpatterns = [
    path('overview', OverviewAnalyticsView.as_view(), name='analytics-overview'),
    path('task-distribution', TaskDistributionView.as_view(), name='analytics-task-distribution'),
    path('tasks-over-time', TasksOverTimeView.as_view(), name='analytics-tasks-over-time'),
    path('user-productivity', UserProductivityView.as_view(), name='analytics-user-productivity'),
    path('project-progress', ProjectProgressView.as_view(), name='analytics-project-progress'),
]
