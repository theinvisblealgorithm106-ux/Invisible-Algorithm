import { google } from 'googleapis';
import { randomUUID } from 'crypto';
import { Readable } from 'stream';

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID!;

// Uploads authenticate as the real Google account (via OAuth2 + a stored
// refresh token) rather than a service account. Service accounts have no
// storage quota of their own on a personal Gmail account — sharing a folder
// with one only grants permission, not the quota needed to actually write
// files into it. Authenticating as the account itself avoids that entirely.
function getAuthClient() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken || !FOLDER_ID) {
    throw new Error('Google Drive OAuth env vars are not configured');
  }
  const client = new google.auth.OAuth2(clientId, clientSecret);
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}

function getDriveClient() {
  return google.drive({ version: 'v3', auth: getAuthClient() });
}

// Starts a Google Drive resumable upload session and hands back the one-time
// session URL plus the access token to authorize it. The browser then PUTs
// the file bytes directly to Google — the file never passes through our own
// server, which matters because Vercel serverless functions hard-cap
// request bodies at 4.5MB regardless of how the route handler reads them.
//
// The file is uploaded under a server-generated random name rather than the
// user's chosen filename: Google's resumable PUT response is missing
// Access-Control-Allow-Origin (confirmed by testing — the preflight OPTIONS
// passes, but the actual PUT response doesn't carry the header), so a real
// browser can't read the response body/status at all despite the upload
// itself completing successfully server-side. Since the client can't learn
// the resulting file id, the caller instead looks the file up by this exact
// (unique) name afterward via findDriveFileByName.
export async function createResumableUploadSession(
  fileSize: number,
  mimeType: string
): Promise<{ uploadUrl: string; accessToken: string; driveFilename: string }> {
  const auth = getAuthClient();
  const { token: accessToken } = await auth.getAccessToken();
  if (!accessToken) throw new Error('Failed to obtain Google access token');

  const driveFilename = `${randomUUID()}.pdf`;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Type': mimeType,
      'X-Upload-Content-Length': String(fileSize),
    },
    body: JSON.stringify({ name: driveFilename, parents: [FOLDER_ID] }),
  });

  if (!res.ok) {
    throw new Error(`Failed to start Drive upload session: ${res.status} ${await res.text()}`);
  }
  const uploadUrl = res.headers.get('Location');
  if (!uploadUrl) throw new Error('Drive did not return an upload session URL');
  return { uploadUrl, accessToken, driveFilename };
}

// Looks up a file by its exact name within our folder, retrying briefly to
// absorb any propagation delay right after a resumable upload completes.
export async function findDriveFileByName(filename: string): Promise<string | null> {
  const drive = getDriveClient();
  const escaped = filename.replace(/'/g, "\\'");
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await drive.files.list({
      q: `name='${escaped}' and '${FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id)',
      spaces: 'drive',
    });
    const file = res.data.files?.[0];
    if (file?.id) return file.id;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return null;
}

// Drive file IDs are long, unguessable, random-looking strings, so granting
// "anyone with the link" view access is an acceptable trade-off — it lets
// downloads redirect straight to Drive instead of proxying bytes through
// our own server (which would hit the same 4.5MB response-body cap that
// forced the upload to go direct-to-Drive too). Our own status/role check
// in the /pdf route still gates who *learns* the link in the first place.
export async function makeFilePubliclyViewable(fileId: string): Promise<void> {
  const drive = getDriveClient();
  await drive.permissions.create({
    fileId,
    requestBody: { role: 'reader', type: 'anyone' },
  });
}

export function getDriveDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

export async function deletePdfFromDrive(fileId: string): Promise<void> {
  const drive = getDriveClient();
  await drive.files.delete({ fileId }).catch(() => {
    // Already gone or inaccessible — not fatal, the DB record is the source of truth.
  });
}


// ---------------------------------------------------------------------------
// Images (team photos, gallery)
// ---------------------------------------------------------------------------

// Images take a different route from research PDFs. A PDF can be 64MB, so it
// has to go browser-direct to Drive and be served by redirecting. Images are
// small and must render inside an <img> tag, where Drive's own URLs are
// unreliable (the uc?export endpoints redirect to interstitials and are rate
// limited for hotlinking). So images are uploaded *through* this server and
// served back through it too — which also means they need no public Drive
// permission at all, unlike the PDFs.
//
// That makes Vercel's 4.5MB request-body cap the binding constraint, hence the
// 4MB ceiling below. The browser downscales before uploading (see
// lib/compressImage.ts), so real photos land far under it.
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
] as const;

const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

export function isAllowedImageMimeType(mimeType: string): boolean {
  return (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mimeType);
}

// Uploads image bytes to the same Drive folder and returns the new file id.
export async function uploadImageToDrive(data: Buffer, mimeType: string): Promise<string> {
  const drive = getDriveClient();
  const ext = MIME_EXTENSIONS[mimeType] ?? 'bin';

  const res = await drive.files.create({
    requestBody: { name: `${randomUUID()}.${ext}`, parents: [FOLDER_ID] },
    media: { mimeType, body: Readable.from(data) },
    fields: 'id',
  });

  const fileId = res.data.id;
  if (!fileId) throw new Error('Drive did not return a file id for the uploaded image');
  return fileId;
}

// Reads an image back out of Drive so it can be proxied to the browser.
export async function getDriveImage(
  fileId: string
): Promise<{ data: Buffer; mimeType: string } | null> {
  const drive = getDriveClient();
  try {
    const meta = await drive.files.get({ fileId, fields: 'mimeType' });
    const mimeType = meta.data.mimeType || 'application/octet-stream';
    if (!mimeType.startsWith('image/')) return null;

    const file = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );
    return { data: Buffer.from(file.data as ArrayBuffer), mimeType };
  } catch {
    return null;
  }
}

// Same forgiving semantics as deletePdfFromDrive: the DB row is the source of
// truth, so a missing Drive file must not fail the caller.
export async function deleteImageFromDrive(fileId: string): Promise<void> {
  const drive = getDriveClient();
  await drive.files.delete({ fileId }).catch(() => {});
}


// Turns a Drive/OAuth failure into something an admin can act on.
//
// Without this every upload problem surfaces as a flat "Upload failed",
// which hides the one that actually happens in practice: the refresh token
// expiring. Google reports that as `invalid_grant`, which is also what you
// get after revoking access or changing the account password — and, most
// often here, when the OAuth consent screen is left in "Testing" mode, where
// refresh tokens are only valid for 7 days.
export function describeDriveError(err: unknown): { message: string; status: number } {
  const raw = err instanceof Error ? err.message : String(err);

  if (/OAuth env vars are not configured/i.test(raw)) {
    return {
      message: 'Google Drive is not configured on the server (missing GOOGLE_OAUTH_* / GOOGLE_DRIVE_FOLDER_ID).',
      status: 503,
    };
  }
  if (/invalid_grant/i.test(raw)) {
    return {
      message: 'Google Drive sign-in has expired. The refresh token needs to be regenerated and updated on the server.',
      status: 503,
    };
  }
  if (/invalid_client|unauthorized_client/i.test(raw)) {
    return {
      message: 'Google rejected the Drive client credentials (check GOOGLE_OAUTH_CLIENT_ID / SECRET).',
      status: 503,
    };
  }
  if (/storageQuotaExceeded|quotaExceeded/i.test(raw)) {
    return { message: 'The Google Drive account is out of storage.', status: 507 };
  }
  if (/File not found|notFound/i.test(raw)) {
    return {
      message: 'The configured Google Drive folder was not found (check GOOGLE_DRIVE_FOLDER_ID).',
      status: 503,
    };
  }
  return { message: 'Upload failed', status: 500 };
}
