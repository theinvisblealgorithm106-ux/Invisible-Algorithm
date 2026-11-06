import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Research } from '@/models/Research';
import { requireAdmin } from '@/lib/auth-helpers';

export async function GET(req: Request) {
  try {
    await connectDB();
    try {
      requireAdmin(req);
    } catch (res) {
      return res as NextResponse;
    }

    const statusCounts = await Research.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const totalViews = await Research.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        byStatus: statusCounts,
        totalViews: totalViews[0]?.total || 0,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
