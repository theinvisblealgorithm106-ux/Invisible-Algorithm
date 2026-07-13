import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Research } from '@/models/Research';
import { requireAdminTabRead } from '@/lib/auth-helpers';
import { getDriveDownloadUrl } from '@/lib/googleDrive';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const research = await Research.findById(id).select('pdfDriveFileId status');
    if (!research || !research.pdfDriveFileId) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    if (research.status !== 'published') {
      requireAdminTabRead(req, 'research');
    }

    // Redirect straight to Drive rather than proxying the bytes ourselves —
    // Vercel functions cap response bodies at 4.5MB, same as the upload side.
    return NextResponse.redirect(getDriveDownloadUrl(research.pdfDriveFileId));
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
