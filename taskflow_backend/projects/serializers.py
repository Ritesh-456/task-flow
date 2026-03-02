from rest_framework import serializers
from .models import Project, ProjectMember

class ProjectMemberSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = ProjectMember
        fields = ['id', 'user', 'user_email', 'user_name', 'role', 'created_at']

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

class ProjectSerializer(serializers.ModelSerializer):
    members = ProjectMemberSerializer(many=True, read_only=True)
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'status', 'created_by', 'created_by_name', 'created_at', 'members']
        read_only_fields = ['id', 'created_by', 'created_at']

    def get_created_by_name(self, obj):
        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}"
        return "Unknown"

    def create(self, validated_data):
        from accounts.middleware import _thread_locals
        request = self.context.get('request')
        
        if request and request.user:
            # Explicitly set thread-local for TenantAwareModel.save()
            _thread_locals.tenant = request.user.tenant
            validated_data['tenant'] = request.user.tenant
            validated_data['created_by'] = request.user
            
        project = super().create(validated_data)
        
        # Automatically add the creator as an admin member
        if request and request.user:
            ProjectMember.objects.create(
                project=project,
                user=request.user,
                role='admin',
                tenant=request.user.tenant
            )
            
        return project
