import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Application } from '@/models/Application';
import { requireAdminTabWrite } from '@/lib/auth-helpers';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdminTabWrite(req, 'applications');
    await connectDB();
    const { id } = await params;
    const { status, reviewNotes } = await req.json();
    const application = await Application.findByIdAndUpdate(id, { status, reviewNotes, reviewedAt: new Date() }, { new: true });
    if (!application) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: { application } });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
