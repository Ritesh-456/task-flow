from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import SuperAdminSignupView, UserListCreateView, GenerateInviteView, ConsumeInviteView

urlpatterns = [
    # JWT Auth
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Signup
    path('signup/', SuperAdminSignupView.as_view(), name='super_admin_signup'),
    
    # Invites Flow
    path('invites/generate/', GenerateInviteView.as_view(), name='generate_invite'),
    path('invites/consume/', ConsumeInviteView.as_view(), name='consume_invite'),
    
    # User Management
    path('users/', UserListCreateView.as_view(), name='user_list_create'),
]
