from rest_framework import permissions

class RoleBasedAccess(permissions.BasePermission):
    """
    Enforces the role-based permission system:
    - Super Admin -> full tenant access
    - Admin -> users below them
    - Manager -> assigned employees
    - Employee -> only their data
    Note: Tenant isolation is primarily handled by the TenantAwareQuerySet/Middleware.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Enforce global tenant sanity check (though queryset should handle this)
        if hasattr(obj, 'tenant') and obj.tenant != user.tenant:
            return False
            
        if user.role == 'super_admin':
            return True
            
        if user.role == 'admin':
            # Admin can access most objects, but not other super_admins
            if hasattr(obj, 'role') and obj.role == 'super_admin':
                return False
            return True
            
        if user.role == 'manager':
            # Managers access data belonging to them or their subordinates
            if hasattr(obj, 'reports_to'):
                return obj.reports_to == user or obj == user
            if hasattr(obj, 'created_by'):
                return obj.created_by == user or (obj.created_by and obj.created_by.reports_to == user)
            return False
            
        if user.role == 'employee':
            # Employees access only their own data
            if hasattr(obj, 'created_by'):
                return obj.created_by == user
            # If the object itself is a user record
            if getattr(obj, 'id', None) == user.id:
                return True
            return False
            
        return False
