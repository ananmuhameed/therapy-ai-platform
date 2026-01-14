#!/bin/bash

# Run Django migrations
echo "Running migrations..."
python manage.py migrate

# Collect static files (uncomment for production use)
# echo "Collecting static files..."
# python manage.py collectstatic --noinput

# Start the Django web server using Gunicorn
echo "Starting the Django web server..."
gunicorn --bind 0.0.0.0:8000 core.wsgi:application
# exec python manage.py runserver 0.0.0.0:8000