from rest_framework import generics, permissions, viewsets, status
from rest_framework.response import Response
from .models import Project, ProjectMember
from .serializers import ProjectSerializer, ProjectMemberSerializer

class ProjectListCreateView(generics.ListCreateAPIView):
    """
    GET: List projects for the current tenant.
    POST: Create a new project for the current tenant.
    """
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def _get_allowed_users_for(self, effective_user):
        from accounts.models import User
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
        base_qs = Project.objects.filter(tenant=user.tenant)
        
        if user.role == 'super_admin':
            return base_qs
            
        allowed_users = self._get_allowed_users_for(user)
        return base_qs.filter(members__user__in=allowed_users).distinct()

    def perform_create(self, serializer):
        serializer.save()

class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET, PUT, PATCH, DELETE a specific project.
    """
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = getattr(self.request, 'effective_user', self.request.user)
        base_qs = Project.objects.filter(tenant=user.tenant)
        
        if user.role == 'super_admin':
            return base_qs
            
        allowed_users = ProjectListCreateView._get_allowed_users_for(self, user)
        return base_qs.filter(members__user__in=allowed_users).distinct()

class ProjectMemberViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing project memberships.
    """
    serializer_class = ProjectMemberSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_id = self.request.query_params.get('project_id')
        user = getattr(self.request, 'effective_user', self.request.user)
        
        qs = ProjectMember.objects.all()
        if project_id:
            qs = qs.filter(project_id=project_id)
        
        if user.role != 'super_admin':
            # Only see members of projects you are a member of
            qs = qs.filter(project__members__user=user)
        
        return qs.distinct()

    def create(self, request, *args, **kwargs):
        user = getattr(self.request, 'effective_user', self.request.user)
        target_user_id = request.data.get('user')
        project_id = request.data.get('project')
        role = request.data.get('role', 'employee')

        from accounts.models import User
        try:
            target_user = User.objects.get(id=target_user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # RBAC Checks
        if user.role == 'manager':
            # Manager can only add Employees who report to them
            if target_user.role != 'employee' or target_user.reports_to != user:
                return Response(
                    {"error": "Managers can only assign employees who report to them."}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        elif user.role == 'admin':
            # Admin can assign Managers and Employees
            if target_user.role not in ['manager', 'employee']:
                return Response(
                    {"error": "Admins can only assign Managers and Employees."}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        elif user.role == 'super_admin':
            pass # No restrictions within tenant
        else:
            return Response({"error": "Insufficient permissions"}, status=status.HTTP_403_FORBIDDEN)

        return super().create(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        user = getattr(self.request, 'effective_user', self.request.user)
        instance = self.get_object()

        # RBAC Checks for removal
        if user.role == 'manager':
            if instance.user.role != 'employee' or instance.user.reports_to != user:
                return Response(
                    {"error": "Managers can only remove employees who report to them."}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        elif user.role == 'admin':
            if instance.user.role not in ['manager', 'employee']:
                return Response(
                    {"error": "Admins can only remove Managers and Employees."}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        elif user.role == 'super_admin':
            pass
        else:
            return Response({"error": "Insufficient permissions"}, status=status.HTTP_403_FORBIDDEN)

        return super().destroy(request, *args, **kwargs)

class ProjectAssignRoleView(generics.CreateAPIView):
    """
    POST: Assign multiple users to a project.
    Expects: {"userIds": [id1, id2], "role": "admin" | "manager" | "employee"}
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk, *args, **kwargs):
        user = getattr(self.request, 'effective_user', self.request.user)
        user_ids = request.data.get('userIds', [])
        target_role = request.data.get('role', 'employee')
        
        try:
            project = Project.objects.get(pk=pk, tenant=user.tenant)
        except Project.DoesNotExist:
            return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)
            
        # Permission Verification
        if user.role == 'employee':
            return Response({"error": "Employees cannot assign members."}, status=status.HTTP_403_FORBIDDEN)
            
        if user.role == 'manager' and target_role != 'employee':
            return Response({"error": "Managers can only assign employees."}, status=status.HTTP_403_FORBIDDEN)
            
        if user.role == 'admin' and target_role not in ['manager', 'employee']:
            return Response({"error": "Admins can only assign managers and employees."}, status=status.HTTP_403_FORBIDDEN)
            
        if user.role == 'super_admin' and target_role not in ['admin', 'manager', 'employee']:
            return Response({"error": "Super admins can only assign administrators, managers and employees."}, status=status.HTTP_403_FORBIDDEN)
            
        from accounts.models import User
        target_users = User.objects.filter(id__in=user_ids, tenant=user.tenant, role=target_role)
        
        # Verify hierarchy for managers assigning employees
        if user.role == 'manager':
            target_users = target_users.filter(reports_to=user)
            if target_users.count() != len(user_ids):
                return Response({"error": "You can only assign employees that report to you directly."}, status=status.HTTP_403_FORBIDDEN)
                
        # Perform assignment
        assigned_count = 0
        for t_user in target_users:
            obj, created = ProjectMember.objects.get_or_create(
                project=project,
                user=t_user,
                defaults={'role': target_role}
            )
            if created:
                assigned_count += 1
                
        return Response({
            "message": f"Successfully assigned {assigned_count} users to project.",
            "assigned_count": assigned_count
        }, status=status.HTTP_200_OK)
