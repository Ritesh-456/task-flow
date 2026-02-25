from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'is_read', 'tenant', 'created_at')
    list_filter = ('is_read', 'type', 'tenant', 'created_at')
    search_fields = ('user__email', 'message')
