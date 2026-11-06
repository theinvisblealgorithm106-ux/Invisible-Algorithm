import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Event } from '@/models/Event';
import { requireAdminTabWrite } from '@/lib/auth-helpers';
import { eventStatusQuery, withDerivedStatus } from '@/lib/eventStatus';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';

    // Status is derived from dates (see lib/eventStatus.ts), so a status
    // filter becomes a date query rather than a match on the stored field.
    const now = new Date();
    const query: Record<string, unknown> = { isPublic: true, ...eventStatusQuery(status, now) };
    if (type) query.type = type;

    // Upcoming events read best soonest-first; past ones most-recent-first.
    const sort: Record<string, 1 | -1> = status === 'completed' ? { startDate: -1 } : { startDate: 1 };

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: {
        events: events.map((e) => withDerivedStatus(e, now)),
        pagination: { total, page, pages: Math.ceil(total / limit) },
      },
    });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = requireAdminTabWrite(req, 'events');
    await connectDB();
    const body = await req.json();
    const event = await Event.create({ ...body, organizer: payload.userId });
    return NextResponse.json({ success: true, data: { event } }, { status: 201 });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
