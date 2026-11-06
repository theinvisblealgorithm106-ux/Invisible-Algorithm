import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { requireAdmin } from '@/lib/auth-helpers';

export async function GET(req: Request) {
  try {
    await connectDB();
    try {
      requireAdmin(req);
    } catch (res) {
      return res as NextResponse;
    }

    const [byRole, byStatus] = await Promise.all([
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      User.aggregate([{ $group: { _id: '$isActive', count: { $sum: 1 } } }]),
    ]);

    return NextResponse.json({ success: true, data: { byRole, byStatus } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
