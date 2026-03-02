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

    def get_queryset(self):
        user = getattr(self.request, 'effective_user', self.request.user)
        
        # Super Admin: all tenant tasks
        if user.role == 'super_admin':
            return Task.objects.all() # Middleware handles tenant
            
        # Admin: tasks of their managers + employees
        elif user.role == 'admin':
            # Find users who report to this Admin (Managers)
            subordinates = User.objects.filter(reports_to=user)
            # Find employees who report to those Managers
            sub_subordinates = User.objects.filter(reports_to__in=subordinates)
            
            allowed_users = list(subordinates) + list(sub_subordinates) + [user]
            return Task.objects.filter(assigned_to__in=allowed_users)
            
        # Manager: tasks assigned to their employees
        elif user.role == 'manager':
            employees = User.objects.filter(reports_to=user)
            allowed_users = list(employees) + [user]
            return Task.objects.filter(assigned_to__in=allowed_users)
            
        # Employee: tasks assigned to them only
        elif user.role == 'employee':
            return Task.objects.filter(assigned_to=user)
            
        return Task.objects.none()

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET, PUT, PATCH, DELETE operations.
    The get_queryset will automatically ensure you can't access a task
    outside your visibility, and the serializer validates assignments.
    """
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # We reuse the same visibility filtering for details
        user = getattr(self.request, 'effective_user', self.request.user)
        
        if user.role == 'super_admin':
            return Task.objects.all()
            
        elif user.role == 'admin':
            subordinates = User.objects.filter(reports_to=user)
            sub_subordinates = User.objects.filter(reports_to__in=subordinates)
            allowed_users = list(subordinates) + list(sub_subordinates) + [user]
            return Task.objects.filter(assigned_to__in=allowed_users)
            
        elif user.role == 'manager':
            employees = User.objects.filter(reports_to=user)
            allowed_users = list(employees) + [user]
            return Task.objects.filter(assigned_to__in=allowed_users)
            
        elif user.role == 'employee':
            return Task.objects.filter(assigned_to=user)
            
        return Task.objects.none()

class DashboardMetricsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def _get_allowed_users_for(self, request_user, effective_user):
        """
        Returns a queryset of users based on the effective_user context.
        The middleware already validated the relationship.
        """
        user_qs = User.objects.none()

        if effective_user.role == 'super_admin':
            user_qs = User.objects.all()
        elif effective_user.role == 'admin':
            subordinates = User.objects.filter(reports_to=effective_user)
            sub_subordinates = User.objects.filter(reports_to__in=subordinates)
            user_qs = User.objects.filter(id__in=list(subordinates.values_list('id', flat=True)) + list(sub_subordinates.values_list('id', flat=True)) + [effective_user.id])
        elif effective_user.role == 'manager':
            employees = User.objects.filter(reports_to=effective_user)
            user_qs = User.objects.filter(id__in=list(employees.values_list('id', flat=True)) + [effective_user.id])
        elif effective_user.role == 'employee':
            user_qs = User.objects.filter(id=effective_user.id)
            
        return user_qs

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
