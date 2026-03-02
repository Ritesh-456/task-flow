from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    SuperAdminSignupView, 
    UserListCreateView, 
    GenerateInviteView, 
    ConsumeInviteView,
    CustomTokenObtainPairView,
    UserDetailView,
    UserProfileView,
    InviteListView,
    SendInviteEmailView
)

urlpatterns = [
    # JWT Auth
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    
    # Auth/Signup
    path('signup/', SuperAdminSignupView.as_view(), name='super_admin_signup'),
    path('auth/signup-with-invite/', ConsumeInviteView.as_view(), name='consume_invite'),
    
    # Invites Flow
    path('invites/', InviteListView.as_view(), name='invite_list'),
    path('invites/generate/', GenerateInviteView.as_view(), name='generate_invite'),
    path('invites/send-email/', SendInviteEmailView.as_view(), name='send_invite_email'),
    path('invites/consume/', ConsumeInviteView.as_view(), name='consume_invite_legacy'),
    
    # User Management
    path('users/', UserListCreateView.as_view(), name='user_list_create'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user_detail'),
]
