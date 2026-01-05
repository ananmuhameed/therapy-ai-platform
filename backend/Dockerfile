FROM python:3.12-slim

WORKDIR /app

# Install uv (fast pip)
RUN pip install --no-cache-dir uv

# Install Python deps
COPY requirements.txt /app/requirements.txt
RUN uv pip install --system -r /app/requirements.txt

# Copy project
COPY . /app/

RUN chmod +x /app/entrypoint.sh

EXPOSE 8000
