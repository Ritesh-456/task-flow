from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import (
    SuperAdminSignupSerializer, 
    UserSerializer, 
    StandardUserCreateSerializer, 
    InviteGenerateSerializer, 
    InviteSignupSerializer,
    CustomTokenObtainPairSerializer
)
from .models import Invite
from rest_framework_simplejwt.views import TokenObtainPairView

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

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
        role_filter = self.request.query_params.get('role')
        
        # Base QuerySet: enforce tenant isolation
        queryset = User.objects.all()
        
        # Apply role hierarchy
        if user.role == 'super_admin':
            # Super Admin can see everyone in their tenant (handled by middleware)
            pass
        elif user.role == 'admin':
            # Admin sees subordinates
            queryset = queryset.filter(reports_to=user)
        elif user.role == 'manager':
            # Manager sees employees directly under them
            queryset = queryset.filter(reports_to=user, role='employee')
        elif user.role == 'employee':
            # Employee only sees self
            queryset = queryset.filter(id=user.id)
        else:
            return User.objects.none()

        # Apply additional role filtering via query param if provided
        if role_filter:
            queryset = queryset.filter(role=role_filter)
            
        return queryset

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

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'super_admin':
            return User.objects.all()
        return User.objects.filter(id=user.id)

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    GET, PUT, PATCH current user's profile.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class InviteListView(generics.ListAPIView):
    """
    GET: Returns a list of all invites associated with the current tenant.
    """
    serializer_class = InviteGenerateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Invite.objects.filter(tenant=self.request.user.tenant).order_by('-created_at')

from django.core.mail import send_mail

class SendInviteEmailView(generics.GenericAPIView):
    """
    POST: Send the generated invite email via Django's console/SMTP backend.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        message = request.data.get('message')

        if not email or not message:
            return Response({"error": "Both email and message are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            send_mail(
                subject='You are invited to TaskFlow!',
                message=message,
                from_email='noreply@taskflow.dev',
                recipient_list=[email],
                fail_silently=False,
            )
            return Response({"message": "Email sent successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
