FROM python:3.12-slim

# Set environment variables for OpenAI API key
ENV OPENAI_API_KEY=${OPENAI_API_KEY}

WORKDIR /app

# Install OS dependencies (e.g., ffmpeg for audio processing)
RUN apt-get update -o Acquire::Retries=5 \
  && apt-get install -y --no-install-recommends ffmpeg ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy the project code
COPY . /app/

# Ensure entrypoint.sh is executable
RUN chmod +x /app/entrypoint.sh

# Expose port 8000 for the web server
EXPOSE 8000

# Command to run the Django web server using Gunicorn
# CMD ["/bin/bash", "-c", "gunicorn --bind 0.0.0.0:8000 core.wsgi:application"]
