from django.utils.deprecation import MiddlewareMixin
import threading
from django.db import models

# Thread-local storage to keep track of the current request's tenant
_thread_locals = threading.local()

def get_current_tenant():
    return getattr(_thread_locals, 'tenant', None)

class TenantMiddleware(MiddlewareMixin):
    """
    Middleware that attaches the tenant to thread-local storage 
    based on the authenticated user.
    """
    def process_request(self, request):
        if request.user.is_authenticated and hasattr(request.user, 'tenant'):
            _thread_locals.tenant = request.user.tenant
        else:
            _thread_locals.tenant = None

    def process_response(self, request, response):
        if hasattr(_thread_locals, 'tenant'):
            del _thread_locals.tenant
        return response

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
