import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Event } from '@/models/Event';
import { requireAdmin } from '@/lib/auth-helpers';

export async function GET(req: Request) {
  try {
    await connectDB();
    try {
      requireAdmin(req);
    } catch (res) {
      return res as NextResponse;
    }

    const statusCounts = await Event.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    return NextResponse.json({ success: true, data: { byStatus: statusCounts } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
