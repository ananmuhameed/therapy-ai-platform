import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

app = Celery("core")

# read CELERY_* settings from Django settings, with CELERY_ namespace
app.config_from_object("django.conf:settings", namespace="CELERY")

# auto-discover tasks.py in installed apps
app.autodiscover_tasks()