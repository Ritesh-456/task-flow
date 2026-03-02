from django.utils.deprecation import MiddlewareMixin
import threading
from django.db import models

# Thread-local storage to keep track of the current request's tenant
_thread_locals = threading.local()

def get_current_tenant():
    return getattr(_thread_locals, 'tenant', None)

def set_request_context(request, user, view_as_id=None):
    """
    Centralized helper to set tenant and impersonation context.
    Safely handles both session and JWT authenticated users.
    """
    if not user or not user.is_authenticated:
        _thread_locals.tenant = None
        _thread_locals.effective_user = None
        request.effective_user = None
        return

    # 1. Set Tenant
    _thread_locals.tenant = getattr(user, 'tenant', None)
    
    # 2. Set Impersonation
    request.effective_user = user
    _thread_locals.effective_user = user

    if view_as_id:
        from .models import User
        try:
            target_user = User.objects.get(id=view_as_id)
            
            # RBAC Validation: Requester must be in the same tenant
            if target_user.tenant == user.tenant:
                # Hierarchy Validation: requester role > target role
                role_weights = {'super_admin': 4, 'admin': 3, 'manager': 2, 'employee': 1}
                requester_weight = role_weights.get(user.role, 0)
                target_weight = role_weights.get(target_user.role, 0)
                
                if requester_weight > target_weight:
                    request.effective_user = target_user
                    _thread_locals.effective_user = target_user
        except (User.DoesNotExist, ValueError):
            pass

class TenantMiddleware(MiddlewareMixin):
    """
    Middleware that attaches the tenant to thread-local storage 
    based on the authenticated user (Session Auth).
    """
    def process_request(self, request):
        if request.user.is_authenticated:
            set_request_context(request, request.user)

    def process_response(self, request, response):
        if hasattr(_thread_locals, 'tenant'):
            del _thread_locals.tenant
        return response

class ImpersonationMiddleware(MiddlewareMixin):
    """
    Middleware for user impersonation via header (Session Auth fallback).
    """
    def process_request(self, request):
        if request.user.is_authenticated:
            view_as_id = request.headers.get('X-View-As-User')
            set_request_context(request, request.user, view_as_id)

    def process_response(self, request, response):
        if hasattr(_thread_locals, 'effective_user'):
            del _thread_locals.effective_user
        return response

def get_effective_user():
    return getattr(_thread_locals, 'effective_user', None)

class TenantAwareManager(models.Manager):
    """
    Manager that automatically filters querysets by the current tenant.
    """
    def get_queryset(self):
        tenant = get_current_tenant()
        if tenant:
            return super().get_queryset().filter(tenant=tenant)
        # Fallback if no tenant is set (e.g. anonymous requests or management commands)
        return super().get_queryset()

class TenantAwareModel(models.Model):
    """
    Abstract base model that ensures all data is strictly tenant-isolated.
    In future, make sure all models (Tasks, Projects, etc.) inherit this.
    """
    tenant = models.ForeignKey('accounts.Tenant', on_delete=models.CASCADE)
    objects = TenantAwareManager()
    
    class Meta:
        abstract = True
        
    def save(self, *args, **kwargs):
        # Auto-assign tenant internally on creation
        if not self.tenant_id:
            tenant = get_current_tenant()
            if tenant:
                self.tenant = tenant
            else:
                raise ValueError("Cannot save TenantAwareModel without an active tenant context.")
        super().save(*args, **kwargs)
