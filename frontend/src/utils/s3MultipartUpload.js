/**
 * Upload a part to S3 via presigned URL.
 * Returns the ETag (required for complete).
 */
export async function uploadPartToS3(presignedUrl, blob) {
    const res = await fetch(presignedUrl, {
        method: "PUT",
        body: blob,
        // DO NOT set Content-Type unless your backend presign included it as a required header.
        // If you set headers incorrectly, the signature can fail.
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`S3 part upload failed: ${res.status} ${text}`);
    }

    const etag = res.headers.get("ETag");
    if (!etag) throw new Error("Missing ETag header from S3 response.");
    return etag;
}