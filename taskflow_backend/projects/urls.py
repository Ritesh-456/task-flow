from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectListCreateView, ProjectDetailView, ProjectMemberViewSet, ProjectAssignRoleView

router = DefaultRouter()
router.register(r'members', ProjectMemberViewSet, basename='project-member')

urlpatterns = [
    path('', ProjectListCreateView.as_view(), name='project_list_create'),
    path('<int:pk>/', ProjectDetailView.as_view(), name='project_detail'),
    path('<int:pk>/assign/', ProjectAssignRoleView.as_view(), name='project_assign'),
    path('', include(router.urls)),
]
