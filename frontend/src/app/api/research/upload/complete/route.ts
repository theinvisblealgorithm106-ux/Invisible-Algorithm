import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Research } from '@/models/Research';
import { requireAdminTabWrite } from '@/lib/auth-helpers';
import { findDriveFileByName, makeFilePubliclyViewable } from '@/lib/googleDrive';

// Called after the browser attempts to PUT the file directly to Drive. We
// can't trust a driveFileId reported by the client — Google's resumable
// upload PUT response is missing Access-Control-Allow-Origin, so a real
// browser can't read that response at all even though the upload itself
// succeeds server-side. Instead we look the file up ourselves by the exact
// (unique, server-generated) filename to confirm it actually landed.
export async function POST(req: Request) {
  try {
    const payload = requireAdminTabWrite(req, 'research');
    await connectDB();

    const { title, name, driveFilename } = await req.json();
    if (!title?.trim() || !name?.trim() || !driveFilename) {
      return NextResponse.json({ success: false, message: 'Title, name, and driveFilename are required' }, { status: 400 });
    }

    const driveFileId = await findDriveFileByName(driveFilename);
    if (!driveFileId) {
      return NextResponse.json({ success: false, message: 'Upload did not complete — please try again' }, { status: 502 });
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
