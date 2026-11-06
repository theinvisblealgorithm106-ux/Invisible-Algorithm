import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Event } from '@/models/Event';
import { requireAdminTabRead } from '@/lib/auth-helpers';
import { eventStatusQuery } from '@/lib/eventStatus';

export async function GET(req: Request) {
  try {
    requireAdminTabRead(req, 'overview');
    await connectDB();
    // Counting the stored `status` would report finished events as upcoming,
    // so each bucket is counted with the same date query the listings use.
    const now = new Date();
    const statuses = ['upcoming', 'ongoing', 'completed', 'cancelled'] as const;
    const counts = await Promise.all(
      statuses.map((s) => Event.countDocuments(eventStatusQuery(s, now)))
    );
    const byStatus = statuses
      .map((s, i) => ({ _id: s, count: counts[i] }))
      .filter((row) => row.count > 0);
    return NextResponse.json({ success: true, data: { byStatus } });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
