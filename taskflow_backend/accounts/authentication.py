from rest_framework_simplejwt.authentication import JWTAuthentication
from .middleware import set_request_context

class TaskFlowJWTAuthentication(JWTAuthentication):
    """
    Custom JWT Authentication that sets the organization (tenant) 
    and impersonation context immediately after authentication.
    """
    def authenticate(self, request):
        result = super().authenticate(request)
        if result is not None:
            user, token = result
            view_as_id = request.headers.get('X-View-As-User')
            set_request_context(request, user, view_as_id)
        return result
