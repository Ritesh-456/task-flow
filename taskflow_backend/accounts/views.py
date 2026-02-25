from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import SuperAdminSignupSerializer, UserSerializer, StandardUserCreateSerializer, InviteGenerateSerializer, InviteSignupSerializer
from .models import Invite

User = get_user_model()

class SuperAdminSignupView(generics.CreateAPIView):
    """
    Allows registering a super_admin. Auto-creates the tenant.
    """
    queryset = User.objects.all()
    serializer_class = SuperAdminSignupSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user_serializer = UserSerializer(user)
        return Response({
            "message": "Super admin and tenant created successfully.",
            "user": user_serializer.data
        }, status=status.HTTP_201_CREATED)

class UserListCreateView(generics.ListCreateAPIView):
    """
    GET: Returns a list of users filtered according to role hierarchy.
    POST: Creates a user strictly within the requester's tenant and sets reports_to.
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return StandardUserCreateSerializer
        return UserSerializer

    def get_queryset(self):
        user = self.request.user
        
        # Super Admin: all users in tenant
        if user.role == 'super_admin':
            return User.objects.all() # Middleware handles tenant filtering
            
        # Admin: users where reports_to = admin
        elif user.role == 'admin':
            return User.objects.filter(reports_to=user)
            
        # Manager: employees where reports_to = manager
        elif user.role == 'manager':
            # Manager sees employees directly under them
            return User.objects.filter(reports_to=user, role='employee')
            
        # Employee: only self
        elif user.role == 'employee':
            return User.objects.filter(id=user.id)
            
        return User.objects.none()

class GenerateInviteView(generics.CreateAPIView):
    """
    POST: Generate an invite code based on requester's permissions.
    """
    queryset = Invite.objects.all()
    serializer_class = InviteGenerateSerializer
    permission_classes = [IsAuthenticated]

class ConsumeInviteView(generics.CreateAPIView):
    """
    POST: Sign up using an active, valid invite code.
    Auto-assigns the joining user to the inviter's tenant and reports_to hierarchy.
    """
    queryset = User.objects.all()
    serializer_class = InviteSignupSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user_serializer = UserSerializer(user)
        return Response({
            "message": "User registered successfully via invite.",
            "user": user_serializer.data
        }, status=status.HTTP_201_CREATED)
