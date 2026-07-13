import { NextResponse } from 'next/server';
import { requireAdminTabWrite } from '@/lib/auth-helpers';
import { createResumableUploadSession } from '@/lib/googleDrive';

const MAX_PDF_BYTES = 64 * 1024 * 1024; // 64MB

// Starts a direct browser-to-Google-Drive upload. The file itself never
// passes through this server — only this small metadata request does.
export async function POST(req: Request) {
  try {
    requireAdminTabWrite(req, 'research');
    const { filename, fileSize, mimeType } = await req.json();

    if (!filename || !fileSize || mimeType !== 'application/pdf') {
      return NextResponse.json({ success: false, message: 'filename, fileSize, and a PDF mimeType are required' }, { status: 400 });
    }
    if (fileSize > MAX_PDF_BYTES) {
      return NextResponse.json({ success: false, message: 'PDF must be under 64MB' }, { status: 400 });
    }

    const { uploadUrl, accessToken } = await createResumableUploadSession(filename, fileSize, mimeType);
    return NextResponse.json({ success: true, data: { uploadUrl, accessToken } });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error(err);
    return NextResponse.json({ success: false, message: 'Failed to start upload' }, { status: 500 });
  }
}
