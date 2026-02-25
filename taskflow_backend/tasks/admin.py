from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'status', 'priority', 'assigned_to', 'assigned_by', 'due_date', 'tenant')
    list_filter = ('status', 'priority', 'tenant')
    search_fields = ('title', 'project__name', 'assigned_to__email')
