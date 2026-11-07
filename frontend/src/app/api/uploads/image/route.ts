import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { canWriteTab } from '@/lib/permissions';
import {
  MAX_IMAGE_BYTES,
  isAllowedImageMimeType,
  uploadImageToDrive,
  ALLOWED_IMAGE_MIME_TYPES,
  describeDriveError,
} from '@/lib/googleDrive';

// Shared image upload for the Team and Gallery admin panels.
//
// Any role that can write *either* of those tabs may upload, because the
// returned URL is inert on its own — it only becomes visible to the public
// once it's saved onto a team member or gallery item, and those writes are
// guarded individually.
export async function POST(req: Request) {
  try {
    const payload = requireAuth(req);
    if (!canWriteTab(payload.role, 'team') && !canWriteTab(payload.role, 'gallery')) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
    }

    if (!isAllowedImageMimeType(file.type)) {
      return NextResponse.json({
        success: false,
        message: `Unsupported image type. Allowed: ${ALLOWED_IMAGE_MIME_TYPES.join(', ')}`,
      }, { status: 400 });
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({
        success: false,
        message: `Image must be under ${Math.floor(MAX_IMAGE_BYTES / 1024 / 1024)}MB`,
      }, { status: 413 });
    }

    const fileId = await uploadImageToDrive(
      Buffer.from(await file.arrayBuffer()),
      file.type
    );

    // Callers store this path verbatim (on TeamMember.avatar / GalleryItem.image).
    return NextResponse.json({ success: true, data: { fileId, url: `/api/images/${fileId}` } }, { status: 201 });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('[uploads/image]', err);
    // Say *why* it failed — an expired Drive token is otherwise invisible.
    const { message, status } = describeDriveError(err);
    return NextResponse.json({ success: false, message }, { status });
  }
}
