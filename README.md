
# Therapist AI Platform

## Introduction

The **Therapist AI Platform** is designed to streamline the workflow of therapists by automating tasks such as session documentation, transcription, and report generation. The platform integrates **AWS** for cloud storage, **Celery** for asynchronous task processing, **Whisper** for audio transcription, and **Large Language Models (LLMs)** for NLP-based analysis and session report generation.

By leveraging these technologies, therapists can focus more on patient care, while the platform handles administrative tasks efficiently.

---

## Key Technologies

### 1. **AWS (Amazon Web Services)**
- **S3 Storage**: AWS S3 is used for storing audio files associated with therapy sessions. It ensures scalable, reliable, and secure storage of session recordings.

### 2. **Celery (Asynchronous Task Processing)**
- **Background Task Handling**: Celery is used to process time-consuming tasks in the background, such as audio transcription and NLP analysis. Redis is used as the message broker for task management.

### 3. **Whisper (AI Model for Audio Transcription)**
- **Automated Transcription**: Whisper transcribes audio recordings into text, which is then saved in the database and linked to the respective therapy session.

### 4. **LLMs (Large Language Models) for NLP**
- **AI-Powered Report Generation**: After transcription, LLMs analyze the text to generate structured reports, including session summaries, key points, treatment plans, and risk flags.

---

## Platform Architecture Overview

The **Therapist AI Platform** integrates the following technologies:

- **AWS S3**: Used for storing session audio files securely and reliably.
- **Celery**: Handles background tasks like audio transcription using **Whisper** and NLP-based report generation with **LLMs**.
- **Whisper**: Transcribes the session audio asynchronously via Celery.
- **LLMs**: Analyzes transcribed text to generate structured session reports, highlighting key points, risk flags, and treatment plans.

This architecture ensures that therapists can upload audio, generate transcripts, and automatically receive detailed session reports, all managed in the background for efficient workflow management.

---

## Running the Platform Locally with Docker

The platform is fully containerized using **Docker** and **Docker Compose** to ensure consistency across development, staging, and production environments.

### Requirements:
- Docker and Docker Compose installed on your machine.
- AWS account for S3 setup.

### Installation Steps:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/ananmuhameed/therapy-ai-platform.git
   cd therapy-ai-platform
   ```

2. **Set Up AWS Configuration:**
   - Create an AWS account if you don't have one.
   - Set up an S3 bucket for storing session audio files.
   - Add your AWS credentials (`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`) to your `.env` file.

3. **Set Up Environment Variables:**
   - Copy the `.env.sample` file to `.env`:
     ```bash
     cp .env.sample .env
     ```
   - Configure AWS S3-related variables in the `.env` file (e.g., `AWS_STORAGE_BUCKET_NAME`, `AWS_S3_REGION_NAME`).

4. **Start the Services Using Docker Compose:**
   ```bash
   docker-compose up --build
   ```
   This command will build and start all required services (backend, frontend, database, Celery worker, Redis, etc.).

5. **Access the Application:**
   - Backend will be running on `http://localhost:8000`.
   - Frontend will be available on `http://localhost:5173`.

6. **Start the Celery Worker:**
   To handle transcription tasks and report generation asynchronously, start the Celery worker:
   ```bash
   docker-compose exec backend celery -A core worker --loglevel=info
   ```

7. **Migrate the Database:**
   If you are running the project for the first time, apply the migrations:
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

8. **Seeding Data (optional):**
   If you need to seed the database with test data:
   ```bash
   docker-compose exec backend python manage.py loaddata initial_data.json
   ```

9. **Run Tests (optional):**
   To ensure everything is working correctly, you can run the tests:
   ```bash
   docker-compose exec backend python manage.py test
   ```

---

## Celery Configuration for Transcription and NLP Tasks

### 1. **Transcription Task**
   - After a session audio is uploaded, a Celery task is triggered to transcribe the audio file using **Whisper**.
   - The transcription task runs asynchronously, so therapists can continue working without waiting for the transcription to complete.
   - Once transcription is complete, the transcribed text is stored in the database.

### 2. **NLP Report Generation Task**
   - A second Celery task generates an AI-based report using an **LLM** after the transcription is complete.
   - The report includes:
     - Session summary
     - Key points
     - Treatment plans
     - Risk flags
   - Therapists can review and edit the generated reports before finalizing them.

---

## API Endpoints

### Authentication
- **POST /auth/register**: Register a new therapist.
- **POST /auth/login**: Login and receive JWT token.
- **GET /auth/me**: Retrieve logged-in therapist's profile.

### Patient Management
- **POST /patients**: Add a new patient.
- **GET /patients**: Get all patients for the logged-in therapist.
- **GET /patients/{id}**: Get details of a specific patient.
- **PUT /patients/{id}**: Edit patient details.
- **DELETE /patients/{id}**: Delete a patient.

### Session Management
- **POST /sessions**: Create a new therapy session.
- **GET /sessions**: Get all sessions for a therapist or patient.
- **GET /sessions/{id}**: Get details of a specific session.
- **POST /sessions/{id}/audio**: Upload audio for a specific session.

### Transcription & Report Generation
- **GET /sessions/{id}/transcript**: Get the transcript for a specific session.
- **POST /sessions/{id}/report**: Generate AI-based report for a session.
- **PATCH /sessions/{id}/report**: Edit and finalize the session report.

---

## Future Enhancements (Out of Scope for Current Release)

- **Mobile App**: Develop a mobile app for therapists to manage their sessions and patients on-the-go.
- **Payment Integration**: Add subscription plans and payment processing.
- **Real-time Analytics Dashboard**: Provide real-time session data and performance analytics.
- **AI Model Upgrades**: Integrate more advanced AI models for session analysis and report generation.

---

## Conclusion

The **Therapist AI Platform** aims to significantly reduce the manual effort involved in therapy session documentation and management, allowing therapists to focus more on their patients. By leveraging **AWS**, **Celery**, **Whisper**, and **LLMs**, the platform provides a robust and scalable solution to modernize therapy workflows.

For any issues or suggestions, please refer to the project repository or contact the development team.
