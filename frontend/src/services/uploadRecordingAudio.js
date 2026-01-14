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
        // if we have enough for a non-last part
        if (bufferBytes >= MIN_S3_PART_BYTES) {
            const blob = new Blob(bufferBlobs, { type: "audio/webm" });
            bufferBlobs = [];
            bufferBytes = 0;
            return { blob, isLast: false };
        }

        // if recording stopped, flush remainder as last part
        if (done && bufferBytes > 0) {
            const blob = new Blob(bufferBlobs, { type: "audio/webm" });
            bufferBlobs = [];
            bufferBytes = 0;
            return { blob, isLast: true };
        }

        // if done and nothing left, we're finished (shouldn't be called again)
        if (done && bufferBytes === 0) {
            return { blob: new Blob([], { type: "audio/webm" }), isLast: true };
        }

        return null; // not ready yet
    }

    return { pushBlob, markDone, getNextChunk };
}

export async function uploadRecordingAudio({
    sessionId,
    filename,
    languageCode,
    getNextChunk,
    onProgressBytes,
}) {
    return uploadMultipartUnified({
        sessionId,
        filename,
        contentType: "audio/webm",
        languageCode,
        getNextChunk,
        onProgress: onProgressBytes,
    });
}