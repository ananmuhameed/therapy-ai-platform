# Therapist Session Transcription & Reporting Platform

> Full-stack web app for therapists to record sessions, transcribe them using Whisper, and generate AI-powered session reports.

## 🔹 Tech Stack

- **Frontend**: React
- **Backend**: Django + Django REST Framework
- **Database**: PostgreSQL
- **Background Jobs**: Celery + Redis
- **AI**: Whisper (transcription) + NLP (summaries, analysis)
- **Containerization**: Docker, docker-compose

## 🔹 Project Structure

```text
backend/   # Django REST API
frontend/  # React SPA
docs/      # Architecture, diagrams, planning

## Git Workflow

- Never push directly to `main`.
- For every task, create a branch: `THER-<issue-number>-short-description`
  - Example: `THER-10-docker-setup`
- Commit messages must start with Jira key:
  - Example: `THER-10: add docker-compose.yml with backend/frontend/db services`
- Open a Pull Request to merge into `main`.
- At least 1 approval and passing CI are required before merging.
