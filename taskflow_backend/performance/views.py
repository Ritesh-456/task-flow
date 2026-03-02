from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.middleware import get_current_tenant
from accounts.models import User
from tasks.models import Task
from django.db.models import Count, Q, Avg
from django.utils import timezone
from datetime import timedelta

class PerformanceDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        effective_user = getattr(request, 'effective_user', request.user)
        tenant = effective_user.tenant
        
        # Determine the user scope based on RBAC
        users = User.objects.filter(tenant=tenant)
        if effective_user.role == 'admin':
            users = users.filter(Q(reports_to=effective_user) | Q(reports_to__reports_to=effective_user) | Q(id=effective_user.id))
        elif effective_user.role == 'manager':
            users = users.filter(Q(reports_to=effective_user) | Q(id=effective_user.id))
        elif effective_user.role == 'employee':
            users = users.filter(id=effective_user.id)

        user_stats = users.annotate(
            completed_tasks=Count('tasks_assigned', filter=Q(tasks_assigned__status='done')),
            pending_tasks=Count('tasks_assigned', filter=Q(tasks_assigned__status__in=['todo', 'in_progress'])),
            total_assigned=Count('tasks_assigned'),
            active_projects=Count('project_memberships', distinct=True) # Used correct related_name
        )

        users_data = []
        overall_rating = 0
        total_tracked = user_stats.count()

        for u in user_stats:
            # Baseline dummy calculation for performance rating out of 10
            base_rating = 5.0
            if u.total_assigned > 0:
                completion_ratio = u.completed_tasks / u.total_assigned
                base_rating = min(10.0, 5.0 + (completion_ratio * 5.0))
            
            overall_rating += base_rating

            users_data.append({
                '_id': str(u.id),
                'id': str(u.id),
                'name': f"{u.first_name} {u.last_name}".strip(),
                'email': u.email,
                'role': u.role,
                'avatar': u.avatar,
                'isAvailable': True, # Hardcoded for demo
                'performance': {
                    'rating': round(base_rating, 1),
                    'completedTasks': u.completed_tasks,
                    'activeProjects': u.active_projects,
                    'pendingTasks': u.pending_tasks
                }
            })

        avg_rating = round(overall_rating / total_tracked, 1) if total_tracked > 0 else 0

        return Response({
            'teamStats': {
                'avgRating': avg_rating,
                'totalUsers': total_tracked
            },
            'users': users_data
        })
