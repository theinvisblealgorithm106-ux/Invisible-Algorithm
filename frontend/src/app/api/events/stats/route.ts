import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Event } from '@/models/Event';
import { requireAdminTabRead } from '@/lib/auth-helpers';

export async function GET(req: Request) {
  try {
    requireAdminTabRead(req, 'overview');
    await connectDB();
    const byStatus = await Event.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    return NextResponse.json({ success: true, data: { byStatus } });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
