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
        user = self.request.user
        
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
        user = self.request.user
        
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
