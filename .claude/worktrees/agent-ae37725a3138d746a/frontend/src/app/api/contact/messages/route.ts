import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ContactMessage } from '@/models/ContactMessage';
import { requireAdmin } from '@/lib/auth-helpers';

export async function GET(req: Request) {
  try {
    await connectDB();
    try {
      requireAdmin(req);
    } catch (res) {
      return res as NextResponse;
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const total = await ContactMessage.countDocuments(filter);
    const messages = await ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: { messages, pagination: { total, page, pages: Math.ceil(total / limit) } },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
