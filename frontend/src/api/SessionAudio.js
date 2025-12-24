import api from "./axiosInstance";

export async function uploadSessionAudio(sessionId, file, languageCode) {
    const formData = new FormData();
    formData.append("audio_file", file);          // MUST match backend
    if (languageCode) formData.append("language_code", languageCode);

    return api.post(`/sessions/${sessionId}/upload-audio/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}

export async function replaceSessionAudio(sessionId, file, languageCode) {
    const formData = new FormData();
    formData.append("audio_file", file);
    if (languageCode) formData.append("language_code", languageCode);

    return api.post(`/sessions/${sessionId}/replace-audio/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
}