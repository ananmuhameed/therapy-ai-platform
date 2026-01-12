import { uploadMultipartUnified } from "./unifiedMultipartUploader";

const MIN_S3_PART_BYTES = 6 * 1024 * 1024;

export function createRecordingChunkSource() {
  let done = false;
  let bufferBlobs = [];
  let bufferBytes = 0;

  function pushBlob(blob) {
    if (!blob || blob.size === 0) return;
    bufferBlobs.push(blob);
    bufferBytes += blob.size;
  }

  function markDone() {
    done = true;
  }

 async function getNextChunk() {
  if (bufferBytes >= MIN_S3_PART_BYTES) {
    const blob = new Blob(bufferBlobs, { type: "audio/webm" });
    bufferBlobs = [];
    bufferBytes = 0;
    return { blob, isLast: false };
  }

  if (done && bufferBytes > 0) {
    const blob = new Blob(bufferBlobs, { type: "audio/webm" });
    bufferBlobs = [];
    bufferBytes = 0;
    return { blob, isLast: true };
  }

  if (done && bufferBytes === 0) {
    return { done: true };
  }

  // not ready yet
  return null;
}
  return { pushBlob, markDone, getNextChunk };
}

export function uploadRecordingAudio({
  sessionId,
  filename,
  languageCode,
  getNextChunk,
  onProgressBytes,
}) {
  const controller = new AbortController();

  const promise = uploadMultipartUnified({
    sessionId,
    filename,
    contentType: "audio/webm",
    languageCode,
    getNextChunk,
    onProgress: onProgressBytes,
    signal: controller.signal, // ✅ pass down
  });

  return {
    promise,
    cancel: () => controller.abort(),
  };
}
