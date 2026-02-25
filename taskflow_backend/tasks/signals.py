from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Task
from notifications.models import Notification

@receiver(post_save, sender=Task)
def task_post_save_handler(sender, instance, created, **kwargs):
    if not instance.assigned_to:
        return
        
    if created:
        Notification.objects.create(
            user=instance.assigned_to,
            tenant=instance.tenant,
            type='task_assigned',
            message=f"You have been assigned a new task: {instance.title}"
        )
    else:
        if instance.status == 'done':
            # Notify assigner that task is done
            if instance.assigned_by and instance.assigned_by != instance.assigned_to:
                Notification.objects.create(
                    user=instance.assigned_by,
                    tenant=instance.tenant,
                    type='task_completed',
                    message=f"Task '{instance.title}' assigned to {instance.assigned_to.email} has been completed."
                )
        else:
            Notification.objects.create(
                user=instance.assigned_to,
                tenant=instance.tenant,
                type='task_updated',
                message=f"Task '{instance.title}' has been updated."
            )
