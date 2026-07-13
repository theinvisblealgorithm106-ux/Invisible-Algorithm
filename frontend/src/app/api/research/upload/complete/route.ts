import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Research } from '@/models/Research';
import { requireAdminTabWrite } from '@/lib/auth-helpers';
import { makeFilePubliclyViewable } from '@/lib/googleDrive';

// Called after the browser has finished PUTting the file directly to Drive.
export async function POST(req: Request) {
  try {
    const payload = requireAdminTabWrite(req, 'research');
    await connectDB();

    const { title, name, driveFileId } = await req.json();
    if (!title?.trim() || !name?.trim() || !driveFileId) {
      return NextResponse.json({ success: false, message: 'Title, name, and driveFileId are required' }, { status: 400 });
    }

    await makeFilePubliclyViewable(driveFileId);

    const research = new Research({
      title: title.trim(),
      abstract: 'Submitted as a PDF — pending review.',
      content: 'Full paper submitted as a PDF attachment.',
      category: 'other',
      authors: [{ name: name.trim() }],
      status: 'submitted',
      submittedBy: payload.userId,
      pdfDriveFileId: driveFileId,
    });
    research.pdfUrl = `/api/research/${research._id}/pdf`;
    await research.save();

    return NextResponse.json({ success: true, data: { research } }, { status: 201 });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
