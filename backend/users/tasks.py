from django.conf import settings
from django.core.mail import send_mail
from django.urls import reverse
from celery import shared_task
@shared_task
def send_verification_email(user_email, token):
    verify_url = f"{settings.FRONTEND_URL}/#/verify-email?token={token}"

    send_mail(
        subject="Verify your email",
        message=f"Click the link to verify your email:\n\n{verify_url}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user_email],
        fail_silently=False,
    )
