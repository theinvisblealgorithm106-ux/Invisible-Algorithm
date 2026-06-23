import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Event } from '@/models/Event';
import { requireAdmin } from '@/lib/auth-helpers';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';

    const query: Record<string, unknown> = { isPublic: true };
    if (status) query.status = status;
    if (type) query.type = type;

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .sort({ startDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({ success: true, data: { events, pagination: { total, page, pages: Math.ceil(total / limit) } } });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = requireAdmin(req);
    await connectDB();
    const body = await req.json();
    const event = await Event.create({ ...body, organizer: payload.userId });
    return NextResponse.json({ success: true, data: { event } }, { status: 201 });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
