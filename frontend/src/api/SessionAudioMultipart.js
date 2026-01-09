import api from "./axiosInstance";

/**
 * Start multipart upload for a session.
 * Backend returns: { uploadId, key, partSize }
 */
export async function startSessionAudioMultipart(sessionId, { filename, contentType } = {}) {
    const payload = {};
    if (filename) payload.filename = filename;
    if (contentType) payload.content_type = contentType;

    const { data } = await api.post(`/sessions/${sessionId}/audio/multipart/start/`, payload);
    return data; // { uploadId, key, partSize }
}

/**
 * Get presigned URL for uploading one part.
 * Backend returns: { url, partNumber }
 */
export async function presignSessionAudioPart(sessionId, { uploadId, partNumber }) {
    const { data } = await api.post(`/sessions/${sessionId}/audio/multipart/presign/`, {
        uploadId,
        partNumber,
    });
    return data; // { url, partNumber }
}

/**
 * Complete multipart upload (this triggers transcription on backend).
 * parts: [{ PartNumber, ETag }]
 */
export async function completeSessionAudioMultipart(sessionId, { uploadId, parts, originalFilename, languageCode }) {
    const payload = { uploadId, parts };
    if (originalFilename) payload.original_filename = originalFilename;
    if (languageCode) payload.language_code = languageCode;

    const { data } = await api.post(`/sessions/${sessionId}/audio/multipart/complete/`, payload);
    return data; // { detail, audio_id }
}

/**
 * Abort multipart upload (optional but recommended for cancel/failure).
 */
export async function abortSessionAudioMultipart(sessionId) {
    const { data } = await api.post(`/sessions/${sessionId}/audio/multipart/abort/`);
    return data;
}