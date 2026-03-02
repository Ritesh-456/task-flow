from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import Task
from .serializers import TaskSerializer
from django.contrib.auth import get_user_model
from datetime import timedelta
from django.db.models import Count
from rest_framework.exceptions import PermissionDenied

User = get_user_model()

class TaskListCreateView(generics.ListCreateAPIView):
    """
    GET: Returns tasks filtered by strictly governed RBAC hierarchy.
    POST: Creates a task ensuring assignment constraints.
    """
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def _get_allowed_users_for(self, effective_user):
        if effective_user.role == 'super_admin':
            return User.objects.filter(tenant=effective_user.tenant)
        elif effective_user.role == 'admin':
            subordinates = User.objects.filter(reports_to=effective_user)
            sub_subordinates = User.objects.filter(reports_to__in=subordinates)
            return User.objects.filter(id__in=list(subordinates.values_list('id', flat=True)) + list(sub_subordinates.values_list('id', flat=True)) + [effective_user.id])
        elif effective_user.role == 'manager':
            employees = User.objects.filter(reports_to=effective_user)
            return User.objects.filter(id__in=list(employees.values_list('id', flat=True)) + [effective_user.id])
        elif effective_user.role == 'employee':
            return User.objects.filter(id=effective_user.id)
        return User.objects.none()

    def get_queryset(self):
        user = getattr(self.request, 'effective_user', self.request.user)
        base_qs = Task.objects.filter(project__tenant=user.tenant)
        
        if user.role == 'super_admin':
            return base_qs
            
        allowed_users = self._get_allowed_users_for(user)
        return base_qs.filter(assigned_to__in=allowed_users)

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET, PUT, PATCH, DELETE operations.
    The get_queryset will automatically ensure you can't access a task
    outside your visibility, and the serializer validates assignments.
    """
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = getattr(self.request, 'effective_user', self.request.user)
        base_qs = Task.objects.filter(project__tenant=user.tenant)
        
        if user.role == 'super_admin':
            return base_qs
            
        allowed_users = TaskListCreateView._get_allowed_users_for(self, user)
        return base_qs.filter(assigned_to__in=allowed_users)

class DashboardMetricsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _get_allowed_users_for(self, request_user, effective_user):
        if effective_user.role == 'super_admin':
            return User.objects.filter(tenant=effective_user.tenant)
        elif effective_user.role == 'admin':
            subordinates = User.objects.filter(reports_to=effective_user)
            sub_subordinates = User.objects.filter(reports_to__in=subordinates)
            return User.objects.filter(id__in=list(subordinates.values_list('id', flat=True)) + list(sub_subordinates.values_list('id', flat=True)) + [effective_user.id])
        elif effective_user.role == 'manager':
            employees = User.objects.filter(reports_to=effective_user)
            return User.objects.filter(id__in=list(employees.values_list('id', flat=True)) + [effective_user.id])
        elif effective_user.role == 'employee':
            return User.objects.filter(id=effective_user.id)
            
        return User.objects.none()

    def get_task_queryset_for_users(self, allowed_users):
        return Task.objects.filter(assigned_to__in=allowed_users)

    def get(self, request):
        effective_user = getattr(request, 'effective_user', request.user)
        allowed_users = self._get_allowed_users_for(request.user, effective_user)
        tasks = self.get_task_queryset_for_users(allowed_users)
        
        now = timezone.now().date()
        
        # 1. Metrics
        total_tasks = tasks.count()
        completed_tasks = tasks.filter(status='done').count()
        pending_tasks = tasks.exclude(status='done').count()
        overdue_tasks = tasks.filter(status__in=['todo', 'in_progress'], due_date__lt=now).count()

        # 2. task distribution
        distribution = {
            'todo': tasks.filter(status='todo').count(),
            'in_progress': tasks.filter(status='in_progress').count(),
            'done': completed_tasks,
        }

        # 3. weekly performance (Tasks completed in the last 7 days)
        seven_days_ago = now - timedelta(days=7)
        weekly_tasks = tasks.filter(status='done', due_date__gte=seven_days_ago, due_date__lte=now) # Assuming due_date was the metric.
        # Group by due_date
        weekly_performance = list(weekly_tasks.values('due_date').annotate(count=Count('id')).order_by('due_date'))

        return Response({
            'metrics': {
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'pending_tasks': pending_tasks,
                'overdue_tasks': overdue_tasks,
            },
            'distribution': distribution,
            'weekly_performance': weekly_performance
        })
