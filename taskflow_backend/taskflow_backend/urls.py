from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/accounts/', include('accounts.urls')),
    path('api/v1/tasks/', include('tasks.urls')),
    path('api/v1/notifications/', include('notifications.urls')),
]
