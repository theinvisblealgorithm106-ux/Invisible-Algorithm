import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ContactMessage } from '@/models/ContactMessage';
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
    const { status } = await req.json();
    const message = await ContactMessage.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    if (!message) {
      return NextResponse.json({ success: false, message: 'Message not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { message } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
