import { uploadMultipartUnified } from "./unifiedMultipartUploader";

export async function uploadFileAudio({
    sessionId,
    file,
    languageCode,
    onProgress,
}) {
    const partSize = 10 * 1024 * 1024; // should match backend’s returned partSize ideally
    let offset = 0;

    async function getNextChunk() {
        if (offset >= file.size) return { blob: new Blob([]), isLast: true }; // won't happen normally

        const end = Math.min(offset + partSize, file.size);
        const blob = file.slice(offset, end);
        offset = end;

        const isLast = offset >= file.size;
        return { blob, isLast };
    }

    return uploadMultipartUnified({
        sessionId,
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        languageCode,
        getNextChunk,
        onProgress: (bytes) => onProgress?.(bytes / file.size),
    });
}