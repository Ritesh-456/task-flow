from django.contrib import admin
from .models import Tenant, User, Invite

@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ('name', 'plan', 'created_at')
    search_fields = ('name',)
    list_filter = ('plan',)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'tenant', 'is_active')
    search_fields = ('email', 'first_name', 'last_name')
    list_filter = ('role', 'is_active', 'tenant')
    ordering = ('email',)

@admin.register(Invite)
class InviteAdmin(admin.ModelAdmin):
    list_display = ('code', 'role', 'tenant', 'created_by', 'is_used', 'expires_at')
    list_filter = ('role', 'is_used', 'tenant', 'expires_at')
    search_fields = ('code', 'created_by__email')
