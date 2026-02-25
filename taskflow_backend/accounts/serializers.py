from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import Tenant, Invite
from django.utils import timezone
import secrets

User = get_user_model()

class TenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tenant
        fields = ['id', 'name', 'plan', 'created_at']
        read_only_fields = ['id', 'created_at']

class SuperAdminSignupSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password', 'company_name']

    def create(self, validated_data):
        company_name = validated_data.pop('company_name')
        password = validated_data.pop('password')
        
        with transaction.atomic():
            # 1. Create User (super_admin)
            user = User.objects.create_user(
                email=validated_data['email'],
                password=password,
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', ''),
                role='super_admin'
            )
            
            # 2. Complete Auto Tenant Creation 
            tenant = Tenant.objects.create(
                name=company_name,
                owner=user,  # Set user as owner
                plan='free'
            )
            
            # 3. Assign tenant to user
            user.tenant = tenant
            user.save()
            
        return user

class UserSerializer(serializers.ModelSerializer):
    tenant = TenantSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'role', 'tenant', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at', 'tenant']

class StandardUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password', 'role']

    def validate_role(self, value):
        request_user = self.context['request'].user
        
        # Strict hierarchy enforcement
        if request_user.role == 'super_admin' and value not in ['admin', 'manager', 'employee']:
            raise serializers.ValidationError("Super Admin can create Admin, Manager, or Employee.")
        elif request_user.role == 'admin' and value not in ['manager', 'employee']:
            raise serializers.ValidationError("Admin can only create Manager or Employee.")
        elif request_user.role == 'manager' and value != 'employee':
            raise serializers.ValidationError("Manager can only create Employee.")
        elif request_user.role == 'employee':
            raise serializers.ValidationError("Employees cannot create users.")
            
        return value

    def create(self, validated_data):
        from .middleware import get_current_tenant
        request_user = self.context['request'].user
        
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data['role'],
            tenant=get_current_tenant(),
            created_by=request_user,
            reports_to=request_user
        )
        return user

class InviteGenerateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invite
        fields = ['code', 'role', 'expires_at']
        read_only_fields = ['code']

    def validate_role(self, value):
        request_user = self.context['request'].user
        
        # Enforce who can generate invites for what
        if request_user.role == 'super_admin' and value not in ['admin', 'manager', 'employee']:
            raise serializers.ValidationError("Super Admin can invite Admin, Manager, or Employee.")
        elif request_user.role == 'admin' and value not in ['manager', 'employee']:
            raise serializers.ValidationError("Admin can only invite Manager or Employee.")
        elif request_user.role == 'manager' and value != 'employee':
            raise serializers.ValidationError("Manager can only invite Employee.")
        elif request_user.role == 'employee':
            raise serializers.ValidationError("Employees cannot generate invites.")
            
        return value

    def create(self, validated_data):
        request_user = self.context['request'].user
        validated_data['created_by'] = request_user
        validated_data['tenant'] = request_user.tenant
        validated_data['code'] = secrets.token_urlsafe(16)
        
        # Default expiration to 7 days if not provided
        if 'expires_at' not in validated_data:
            validated_data['expires_at'] = timezone.now() + timezone.timedelta(days=7)
            
        return super().create(validated_data)

class InviteSignupSerializer(serializers.ModelSerializer):
    code = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password', 'code']

    def validate_code(self, value):
        try:
            invite = Invite.objects.get(code=value)
        except Invite.DoesNotExist:
            raise serializers.ValidationError("Invalid invite code.")
            
        if invite.is_used:
            raise serializers.ValidationError("This invite code has already been used.")
            
        if invite.expires_at < timezone.now():
            raise serializers.ValidationError("This invite code has expired.")
            
        return value

    def create(self, validated_data):
        code = validated_data.pop('code')
        invite = Invite.objects.get(code=code)
        
        with transaction.atomic():
            user = User.objects.create_user(
                email=validated_data['email'],
                password=validated_data['password'],
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', ''),
                role=invite.role,
                tenant=invite.tenant,
                created_by=invite.created_by,
                reports_to=invite.created_by
            )
            
            invite.is_used = True
            invite.used_by = user
            invite.save()
            
        return user
