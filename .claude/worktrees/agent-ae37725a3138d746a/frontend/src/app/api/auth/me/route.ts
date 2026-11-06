import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { getTokenFromRequest, verifyAccessToken } from '@/lib/auth-helpers';

export async function GET(req: Request) {
  try {
    await connectDB();
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }
    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });
    }
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { user } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
