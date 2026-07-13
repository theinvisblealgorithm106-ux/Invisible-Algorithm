import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ContactMessage } from '@/models/ContactMessage';
import { requireAdminTabRead } from '@/lib/auth-helpers';

export async function GET(req: Request) {
  try {
    requireAdminTabRead(req, 'messages');
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || '';
    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    const total = await ContactMessage.countDocuments(query);
    const messages = await ContactMessage.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    return NextResponse.json({ success: true, data: { messages, pagination: { total, page, pages: Math.ceil(total / limit) } } });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
