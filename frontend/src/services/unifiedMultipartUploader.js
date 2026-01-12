import {
  startSessionAudioMultipart,
  presignSessionAudioPart,
  completeSessionAudioMultipart,
  abortSessionAudioMultipart,
} from "../api/SessionAudioMultipart";
import { uploadPartToS3 } from "../utils/s3MultipartUpload";

const MIN_S3_PART_BYTES = 6 * 1024 * 1024; // must be >= 5MB except last

function throwIfAborted(signal) {
  if (signal?.aborted) {
    const err = new Error("Upload cancelled");
    err.name = "AbortError";
    throw err;
  }
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted)
      return reject(
        Object.assign(new Error("Upload cancelled"), { name: "AbortError" })
      );

    const id = setTimeout(resolve, ms);

    if (signal) {
      const onAbort = () => {
        clearTimeout(id);
        reject(
          Object.assign(new Error("Upload cancelled"), { name: "AbortError" })
        );
      };
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}

/**
 * Unified multipart upload runner.
 * - getNextChunk(): returns { blob, isLast } OR null if not ready yet
 * - onProgress(bytesUploaded) optional
 */
export async function uploadMultipartUnified({
  sessionId,
  filename,
  contentType,
  languageCode,
  getNextChunk,
  onProgress,
  maxRetriesPerPart = 3,
  signal,
}) {
  throwIfAborted(signal);

  const { uploadId } = await startSessionAudioMultipart(
    sessionId,
    { filename, contentType },
    { signal }
  );

  const parts = [];
  let partNumber = 1;
  let uploadedBytes = 0;

  try {
    while (true) {
      throwIfAborted(signal);

      const next = await getNextChunk();
      if (next?.done) break;
      if (!next) {
        await sleep(200, signal);
        continue;
      }

      const { blob, isLast } = next;

      // Defensive: enforce multipart rule (all parts except last must be >= 5MB)
      if (!isLast && blob.size < MIN_S3_PART_BYTES) {
        await sleep(200, signal);
        continue;
      }

      throwIfAborted(signal);

      const { url } = await presignSessionAudioPart(
        sessionId,
        { uploadId, partNumber },
        { signal }
      );

      let etag = null;
      for (let attempt = 1; attempt <= maxRetriesPerPart; attempt++) {
        throwIfAborted(signal);

        try {
          etag = await uploadPartToS3(url, blob, { signal });
          break;
        } catch (err) {
          // if cancelled, stop immediately
          if (err?.name === "AbortError") throw err;
          if (attempt === maxRetriesPerPart) throw err;
        }
      }

      parts.push({ PartNumber: partNumber, ETag: etag });
      partNumber += 1;

      uploadedBytes += blob.size;
      if (onProgress) onProgress(uploadedBytes);

      if (isLast) break;
    }

    throwIfAborted(signal);

    return await completeSessionAudioMultipart(
      sessionId,
      {
        uploadId,
        parts,
        originalFilename: filename,
        languageCode,
      },
      { signal }
    );
  } catch (err) {
    // Abort server-side multipart upload when cancelled or failed
    try {
      await abortSessionAudioMultipart(sessionId, { uploadId }, { signal });
    } catch (_) {}

    throw err;
  }
}
