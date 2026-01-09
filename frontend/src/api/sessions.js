import api from "./axiosInstance";

export async function createSessionFormData({ patientId, sessionDate, durationMinutes, notesBefore }) {
    const formData = new FormData();
    formData.append("patient", patientId);

    if (sessionDate) formData.append("session_date", sessionDate);
    if (durationMinutes != null) formData.append("duration_minutes", String(durationMinutes));
    if (notesBefore) formData.append("notes_before", notesBefore);

    return api.post("/sessions/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}