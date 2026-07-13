import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Research } from '@/models/Research';
import { requireAdminTabWrite } from '@/lib/auth-helpers';

const MAX_PDF_BYTES = 8 * 1024 * 1024; // 8MB — stays well under MongoDB's 16MB document limit

export async function POST(req: Request) {
  try {
    const payload = requireAdminTabWrite(req, 'research');
    await connectDB();

    const form = await req.formData();
    const title = (form.get('title') as string | null)?.trim();
    const name = (form.get('name') as string | null)?.trim();
    const file = form.get('file') as File | null;

    if (!title || !name || !file) {
      return NextResponse.json({ success: false, message: 'Title, name, and a PDF file are required' }, { status: 400 });
    }
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ success: false, message: 'File must be a PDF' }, { status: 400 });
    }
    if (file.size > MAX_PDF_BYTES) {
      return NextResponse.json({ success: false, message: 'PDF must be under 8MB' }, { status: 400 });
    }

    const pdfData = Buffer.from(await file.arrayBuffer());

    const research = new Research({
      title,
      abstract: 'Submitted as a PDF — pending review.',
      content: 'Full paper submitted as a PDF attachment.',
      category: 'other',
      authors: [{ name }],
      status: 'submitted',
      submittedBy: payload.userId,
      pdfData,
      pdfMimeType: file.type,
    });
    research.pdfUrl = `/api/research/${research._id}/pdf`;
    await research.save();

    const { pdfData: _omit, ...safe } = research.toObject();
    return NextResponse.json({ success: true, data: { research: safe } }, { status: 201 });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
