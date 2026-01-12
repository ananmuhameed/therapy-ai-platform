import api from "./axiosInstance";

/**
 * Start multipart upload for a session.
 * Backend returns: { uploadId, key, partSize }
 */
export async function startSessionAudioMultipart(
  sessionId,
  { filename, contentType } = {},
  config = {}
) {
  const payload = {};
  if (filename) payload.filename = filename;
  if (contentType) payload.content_type = contentType;

  const { data } = await api.post(
    `/sessions/${sessionId}/audio/multipart/start/`,
    payload,
    config
  );
  return data;
}

/**
 * Get presigned URL for uploading one part.
 * Backend returns: { url, partNumber }
 */
export async function presignSessionAudioPart(
  sessionId,
  { uploadId, partNumber },
  config = {}
) {
  const { data } = await api.post(
    `/sessions/${sessionId}/audio/multipart/presign/`,
    { uploadId, partNumber },
    config
  );
  return data;
}

/**
 * Complete multipart upload ( triggers transcription on backend).
 * parts: [{ PartNumber, ETag }]
 */
export async function completeSessionAudioMultipart(
  sessionId,
  { uploadId, parts, originalFilename, languageCode },
  config = {}
) {
  const payload = { uploadId, parts };
  if (originalFilename) payload.original_filename = originalFilename;
  if (languageCode) payload.language_code = languageCode;

  const { data } = await api.post(
    `/sessions/${sessionId}/audio/multipart/complete/`,
    payload,
    config
  );
  return data;
}


export async function abortSessionAudioMultipart(
  sessionId,
  { uploadId } = {},
  config = {}
) {
  const payload = uploadId ? { uploadId } : {};
  const { data } = await api.post(
    `/sessions/${sessionId}/audio/multipart/abort/`,
    payload,
    config
  );
  return data;
}
