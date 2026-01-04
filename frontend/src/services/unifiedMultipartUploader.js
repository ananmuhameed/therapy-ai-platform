import { 
    startSessionAudioMultipart,
    presignSessionAudioPart,
    completeSessionAudioMultipart,
    abortSessionAudioMultipart } from "../api/SessionAudioMultipart";
import { uploadPartToS3 } from "../utils/s3MultipartUpload";

const MIN_S3_PART_BYTES = 6 * 1024 * 1024; // must be >= 5MB except last

/**
 * Unified multipart upload runner.
 * - getNextChunk(): returns { blob, isLast } OR null if not ready yet
 * - onProgress(bytesUploaded) optional
 *
 * For file upload: getNextChunk returns immediately until done.
 * For recording: getNextChunk is driven by MediaRecorder pushing blobs into a buffer.
 */
export async function uploadMultipartUnified({
    sessionId,
    filename,
    contentType,
    languageCode,
    getNextChunk,
    onProgress,
    maxRetriesPerPart = 3,
}) {
    const { uploadId } = await startSessionAudioMultipart(sessionId, { filename, contentType });

    const parts = [];
    let partNumber = 1;
    let uploadedBytes = 0;

    try {
        while (true) {
            const next = await getNextChunk();
            if (!next) {
                // recording flow: not ready yet, wait a bit
                await new Promise((r) => setTimeout(r, 200));
                continue;
            }

            const { blob, isLast } = next;

            // Enforce multipart rule: all parts except last must be >=5MB
            if (!isLast && blob.size < MIN_S3_PART_BYTES) {
                // this should not happen if your recording buffer logic is correct
                // but we’ll be defensive: wait for more data
                await new Promise((r) => setTimeout(r, 200));
                continue;
            }

            const { url } = await presignSessionAudioPart(sessionId, { uploadId, partNumber });

            let etag = null;
            for (let attempt = 1; attempt <= maxRetriesPerPart; attempt++) {
                try {
                    etag = await uploadPartToS3(url, blob);
                    break;
                } catch (err) {
                    if (attempt === maxRetriesPerPart) throw err;
                }
            }

            parts.push({ PartNumber: partNumber, ETag: etag });
            partNumber += 1;

            uploadedBytes += blob.size;
            if (onProgress) onProgress(uploadedBytes);

            if (isLast) break;
        }

        return await completeSessionAudioMultipart(sessionId, {
            uploadId,
            parts,
            originalFilename: filename,
            languageCode,
        });
    } catch (err) {
        try { await abortSessionAudioMultipart(sessionId); } catch (_) { }
        throw err;
    }
}