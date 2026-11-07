// Downscales an image in the browser before upload.
//
// Phone photos are routinely 4-12MB, which would bounce off both the 4MB
// server limit and Vercel's 4.5MB request-body cap. Resizing client-side
// fixes that, and also keeps the public pages fast — nothing on this site
// displays an image wider than ~1600px.
//
// Falls back to the original file if anything goes wrong (an exotic format,
// a canvas that won't paint), letting the server's own validation be the
// final word rather than silently blocking the upload here.

export interface CompressOptions {
  maxDimension?: number;
  quality?: number;
  mimeType?: string;
}

export async function compressImage(
  file: File,
  { maxDimension = 1600, quality = 0.85, mimeType = 'image/webp' }: CompressOptions = {}
): Promise<File> {
  // GIFs may be animated; re-encoding would freeze them on the first frame.
  if (file.type === 'image/gif') return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));

    // Already small enough and in a web-friendly format — leave it alone.
    if (scale === 1 && file.size <= 1024 * 1024) {
      bitmap.close?.();
      return file;
    }

    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close?.();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, mimeType, quality)
    );
    if (!blob) return file;

    // Re-encoding can occasionally inflate an already-optimised file.
    if (blob.size >= file.size && scale === 1) return file;

    const extension = mimeType === 'image/webp' ? 'webp' : 'jpg';
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
    return new File([blob], `${baseName}.${extension}`, { type: mimeType });
  } catch {
    return file;
  }
}

// Uploads a file to /api/uploads/image and returns the stored URL. Compresses
// first unless told otherwise.
export async function uploadImage(file: File, compress = true): Promise<string> {
  const prepared = compress ? await compressImage(file) : file;

  // Catch the unshrinkable case locally rather than at the edge, where the
  // rejection arrives as an opaque non-JSON 413.
  const MAX_BYTES = 4 * 1024 * 1024;
  if (prepared.size > MAX_BYTES) {
    throw new Error(
      `Image is ${(prepared.size / 1024 / 1024).toFixed(1)}MB, over the 4MB limit, and couldn't be `
      + 'compressed automatically. Convert it to JPEG or PNG and try again.'
    );
  }

  const body = new FormData();
  body.append('file', prepared);

  // Plain fetch rather than the axios client: FormData needs the browser to
  // set its own multipart boundary, and the axios instance pins
  // Content-Type: application/json.
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const res = await fetch('/api/uploads/image', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.success) {
    // A non-JSON body means the request never reached the route handler.
    // The usual cause is Vercel rejecting it at the edge for exceeding the
    // 4.5MB body cap — which happens when compression fell back to the
    // original file (e.g. an HEIC the browser can't decode).
    if (!json) {
      if (res.status === 413) {
        throw new Error(
          `Image is too large (${(prepared.size / 1024 / 1024).toFixed(1)}MB after processing). `
          + 'Try a smaller photo, or save it as JPEG/PNG first.'
        );
      }
      throw new Error(`Upload failed (HTTP ${res.status})`);
    }
    throw new Error(json.message || `Upload failed (HTTP ${res.status})`);
  }
  return json.data.url as string;
}
