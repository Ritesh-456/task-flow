import os
import sys
import django
from datetime import timedelta
from django.utils import timezone
import random

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "taskflow_backend.settings")
django.setup()

from accounts.models import User, Tenant, Invite
from projects.models import Project, ProjectMember
from tasks.models import Task

def run_seed():
    print("Clearing existing data...")
    Task.objects.all().delete()
    ProjectMember.objects.all().delete()
    Project.objects.all().delete()
    Invite.objects.all().delete()
    User.objects.all().delete()
    Tenant.objects.all().delete()

    print("Creating Tenant...")
    tenant = Tenant.objects.create(name="ShreeTech Solutions Pvt Ltd", plan="premium")
    from accounts.middleware import _thread_locals
    _thread_locals.tenant = tenant

    print("Creating Super Admin...")
    super_admin = User.objects.create_user(
        email="ritesh.brahmachari@shreetech.com",
        password="Test@123",
        first_name="Ritesh",
        last_name="Brahmachari",
        role="super_admin",
        tenant=tenant,
        avatar="/avatars/image_1.webp"
    )
    tenant.owner = super_admin
    tenant.save()

    print("Creating Admins...")
    admin_data = [
        ("Amit", "Verma", "amit.verma@shreetech.com"),
        ("Priya", "Nair", "priya.nair@shreetech.com"),
        ("Rahul", "Singh", "rahul.singh@shreetech.com")
    ]
    admins = []
    for i, (fname, lname, email) in enumerate(admin_data):
        admin = User.objects.create_user(
            email=email,
            password="Test@123",
            first_name=fname,
            last_name=lname,
            role="admin",
            tenant=tenant,
            reports_to=super_admin,
            created_by=super_admin,
            avatar=f"/avatars/image_{i+2}.webp"
        )
        admins.append(admin)

    print("Creating Managers...")
    manager_data = {
        admins[0]: [("Manish", "Gupta", "manish.gupta@shreetech.com"), ("Sneha", "Iyer", "sneha.iyer@shreetech.com")],
        admins[1]: [("Arjun", "Reddy", "arjun.reddy@shreetech.com"), ("Neha", "Kapoor", "neha.kapoor@shreetech.com")],
        admins[2]: [("Karan", "Mehta", "karan.mehta@shreetech.com")]
    }
    managers = []
    for admin, mgrs in manager_data.items():
        for i, (fname, lname, email) in enumerate(mgrs):
            mgr = User.objects.create_user(
                email=email,
                password="Test@123",
                first_name=fname,
                last_name=lname,
                role="manager",
                tenant=tenant,
                reports_to=admin,
                created_by=admin,
                avatar=f"/avatars/image_{i+10}.webp"
            )
            managers.append(mgr)

    print("Creating Employees...")
    emp_names = [
        ("Ravi", "Kumar"), ("Pooja", "Sharma"), ("Ankit", "Jain"), ("Divya", "Patel"),
        ("Rohit", "Das"), ("Kavita", "Singh"), ("Vikram", "Chawla"), ("Anjali", "Desai"),
        ("Suresh", "Menon"), ("Deepa", "Pillai"), ("Ramesh", "Reddy"), ("Meera", "Joshi"),
        ("Vivek", "Nath"), ("Tara", "Banerjee"), ("Ajay", "Ghosh"), ("Nisha", "Bose"),
        ("Gaurav", "Sengupta"), ("Kiran", "Bhat"), ("Sandhaya", "Rao"), ("Tarun", "Garg"),
        ("Rashmi", "Dubey"), ("Mohit", "Yadav"), ("Swati", "Mishra"), ("Prakash", "Tiwari"),
        ("Smriti", "Pandey"), ("Alok", "Chauhan"), ("Jyoti", "Rajput"), ("Deepak", "Thakur"),
        ("Priyanka", "Malik"), ("Nitin", "Bhatia")
    ]
    
    employees = []
    emp_idx = 0
    for mgr in managers:
        for _ in range(6):
            if emp_idx < len(emp_names):
                fname, lname = emp_names[emp_idx]
                email = f"{fname.lower()}.{lname.lower()}@shreetech.com"
                emp = User.objects.create_user(
                    email=email,
                    password="Test@123",
                    first_name=fname,
                    last_name=lname,
                    role="employee",
                    tenant=tenant,
                    reports_to=mgr,
                    created_by=mgr,
                    avatar=f"/avatars/image_{emp_idx+20}.webp"
                )
                employees.append(emp)
                emp_idx += 1

    print("Creating Projects...")
    project_names = ["E-Commerce Platform", "AI Analytics Dashboard", "Mobile Banking App"]
    projects = []
    for i, p_name in enumerate(project_names):
        admin = admins[i]
        project = Project.objects.create(
            tenant=tenant,
            name=p_name,
            description=f"A flagship project led by Team {admin.first_name}",
            created_by=super_admin
        )
        projects.append(project)

        # Assign Admin
        ProjectMember.objects.create(project=project, user=admin, role='admin')
        # Assign Managers belonging to this Admin
        p_mgrs = [m for m in managers if m.reports_to == admin]
        for m in p_mgrs:
            ProjectMember.objects.create(project=project, user=m, role='manager')
            # Assign Employees belonging to this Manager
            p_emps = [e for e in employees if e.reports_to == m]
            for e in p_emps:
                ProjectMember.objects.create(project=project, user=e, role='employee')

    print("Creating Tasks...")
    task_titles = [
        "Design wireframes", "Setup database schema", "Implement authentication API",
        "Create landing page", "Write unit tests", "Configure CI/CD pipeline",
        "Optimize images", "Integrate payment gateway", "Fix navigation bug",
        "Conduct user research", "Draft API documentation", "Deploy staging environment"
    ]
    
    now = timezone.now()
    
    for i, project in enumerate(projects):
        admin = admins[i]
        p_mgrs = [m for m in managers if m.reports_to == admin]
        p_emps = [e for e in employees if e.reports_to in p_mgrs]
        
        for j in range(12):
            title = f"{task_titles[j]} - Phase {j//4 + 1}"
            priority = random.choice(['low', 'medium', 'high'])
            
            # Determine status based on required distribution (40% done, 40% in_progress, 20% todo)
            rand_val = random.random()
            if rand_val < 0.4:
                status = 'done'
            elif rand_val < 0.8:
                status = 'in_progress'
            else:
                status = 'todo'
                
            # Randomize due dates; make some overdue
            if status == 'done':
                due_date = now - timedelta(days=random.randint(1, 10))
            elif random.random() < 0.2 and status != 'done': # 20% of outstanding tasks are overdue
                due_date = now - timedelta(days=random.randint(1, 5))
            else:
                due_date = now + timedelta(days=random.randint(1, 15))
                
            assignee = random.choice(p_emps) if p_emps else None
            creator = assignee.reports_to if assignee and assignee.reports_to else admin
            
            
            # Backdate the task creation by 0 to 7 days
            creation_date = now - timedelta(days=random.randint(0, 7))

            task = Task.objects.create(
                tenant=tenant,
                project=project,
                title=title,
                description=f"Detailed description for {title}.",
                status=status,
                priority=priority,
                assigned_to=assignee,
                assigned_by=creator,
                due_date=due_date
            )
            # Override created_at which usually defaults to auto_now_add
            task.created_at = creation_date
            task.save(update_fields=['created_at'])

    print("Creating Invites...")
    import secrets
    for user in admins + managers + employees:
        Invite.objects.create(
            code=secrets.token_urlsafe(8),
            email=user.email,
            role=user.role,
            tenant=tenant,
            created_by=user.reports_to if user.reports_to else super_admin,
            expires_at=now + timedelta(days=2),
            is_used=True,
            used_by=user
        )

    print("Database seeding completed successfully!")

if __name__ == '__main__':
    run_seed()
