from django.contrib import admin
from .models import Project, ProjectMember

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'tenant', 'status', 'created_by', 'created_at')
    list_filter = ('status', 'tenant')
    search_fields = ('name',)

@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    list_display = ('project', 'user', 'role', 'tenant', 'created_at')
    list_filter = ('role', 'tenant')
    search_fields = ('user__email', 'project__name')
