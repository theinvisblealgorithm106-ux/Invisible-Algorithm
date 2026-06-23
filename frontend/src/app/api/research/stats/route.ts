import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Research } from '@/models/Research';
import { requireAdmin } from '@/lib/auth-helpers';

export async function GET(req: Request) {
  try {
    requireAdmin(req);
    await connectDB();
    const [byStatus, totalViews] = await Promise.all([
      Research.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Research.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
    ]);
    return NextResponse.json({ success: true, data: { byStatus, totalViews: totalViews[0]?.total || 0 } });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
