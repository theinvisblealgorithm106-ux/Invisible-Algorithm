import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { GalleryItem } from '@/models/GalleryItem';
import { requireAdminTabWrite } from '@/lib/auth-helpers';
import { deleteImageFromDrive } from '@/lib/googleDrive';

const EDITABLE_FIELDS = [
  'title', 'caption', 'image', 'imageFileId', 'album',
  'people', 'takenAt', 'order', 'isPublic', 'featured',
] as const;

function pickEditable(body: Record<string, unknown>) {
  const update: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) update[field] = body[field];
  }
  return update;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdminTabWrite(req, 'gallery');
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const existing = await GalleryItem.findById(id).select('imageFileId');
    if (!existing) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });

    const update = pickEditable(body);
    const item = await GalleryItem.findByIdAndUpdate(id, update, { new: true, runValidators: true });

    // If the photo itself was replaced, the old Drive file is now orphaned.
    const replacedFileId = existing.imageFileId;
    if (replacedFileId && 'imageFileId' in update && update.imageFileId !== replacedFileId) {
      await deleteImageFromDrive(replacedFileId);
    }

    return NextResponse.json({ success: true, data: { item } });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdminTabWrite(req, 'gallery');
    await connectDB();
    const { id } = await params;

    const item = await GalleryItem.findByIdAndDelete(id);
    if (!item) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });

    // Don't leave the uploaded file behind in Drive, burning quota forever.
    if (item.imageFileId) await deleteImageFromDrive(item.imageFileId);

    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
