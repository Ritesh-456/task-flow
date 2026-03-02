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

    def get_queryset(self):
        # Switch to effective_user if impersonating
        user = getattr(self.request, 'effective_user', self.request.user)
        
        # Super Admin: see all projects in tenant
        if user.role == 'super_admin':
            return Project.objects.all()
            
        # Others: projects where the user or effective_user is a member
        return Project.objects.filter(members__user=user)

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
        if user.role == 'super_admin':
            return Project.objects.all()
        return Project.objects.filter(members__user=user)

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
