import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Application } from '@/models/Application';
import { requireAdmin } from '@/lib/auth-helpers';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    try {
      requireAdmin(req);
    } catch (res) {
      return res as NextResponse;
    }
    const { id } = await params;
    const { status, reviewNotes } = await req.json();
    const updateData: Record<string, unknown> = { status, reviewNotes, reviewedAt: new Date() };
    const application = await Application.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!application) {
      return NextResponse.json({ success: false, message: 'Application not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { application } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
