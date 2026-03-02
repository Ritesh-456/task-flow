from django.contrib import admin
from .models import Tenant, User

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


