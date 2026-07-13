import { google } from 'googleapis';
import { randomUUID } from 'crypto';

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
