import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Research } from '@/models/Research';
import { requireAdminTabRead } from '@/lib/auth-helpers';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const research = await Research.findById(id).select('+pdfData title pdfMimeType status');
    if (!research || !research.pdfData) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }
    if (research.status !== 'published') {
      requireAdminTabRead(req, 'research');
    }

    return new NextResponse(research.pdfData, {
      headers: {
        'Content-Type': research.pdfMimeType || 'application/pdf',
        'Content-Disposition': `inline; filename="${research.title.replace(/[^\w.-]+/g, '_')}.pdf"`,
      },
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
