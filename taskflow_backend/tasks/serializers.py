from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Task
from projects.models import Project

User = get_user_model()

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'id', 'tenant', 'project', 'title', 'description', 
            'priority', 'status', 'assigned_to', 'assigned_by', 
            'due_date', 'created_at'
        ]
        read_only_fields = ['id', 'tenant', 'assigned_by', 'created_at']

    def validate_assigned_to(self, value):
        if not value:
            return value
            
        request_user = self.context['request'].user
        
        # 1: Tenant Validation
        if value.tenant != request_user.tenant:
            raise serializers.ValidationError("Cannot assign task outside your tenant.")
            
        # 2: Hierarchy Validation
        if request_user.role == 'super_admin':
            pass # Super admin can assign to anyone in tenant
        elif request_user.role == 'admin':
            # Admin can assign to users where reports_to = admin
            if value.reports_to != request_user:
                raise serializers.ValidationError("Admin can only assign tasks to their managers or employees.")
        elif request_user.role == 'manager':
            # Manager can assign to employees where reports_to = manager
            if value.reports_to != request_user or value.role != 'employee':
                raise serializers.ValidationError("Manager can only assign tasks to their employees.")
        elif request_user.role == 'employee':
            # Employee can only assign to self
            if value != request_user:
                raise serializers.ValidationError("Employees can only assign tasks to themselves.")
                
        return value

    def create(self, validated_data):
        from accounts.middleware import get_current_tenant
        request_user = self.context['request'].user
        validated_data['tenant'] = get_current_tenant()
        validated_data['assigned_by'] = request_user
        
        if 'assigned_to' not in validated_data and request_user.role == 'employee':
             validated_data['assigned_to'] = request_user

        return super().create(validated_data)
