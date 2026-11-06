import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { requireAdmin } from '@/lib/auth-helpers';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    try {
      requireAdmin(req);
    } catch (res) {
      return res as NextResponse;
    }
    const { id } = await params;
    const { role } = await req.json();
    const user = await User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { user } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
