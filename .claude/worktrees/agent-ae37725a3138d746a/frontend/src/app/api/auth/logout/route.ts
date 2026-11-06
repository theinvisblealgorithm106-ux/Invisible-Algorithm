import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { getTokenFromRequest, verifyAccessToken } from '@/lib/auth-helpers';

export async function POST(req: Request) {
  try {
    await connectDB();
    const token = getTokenFromRequest(req);
    if (token) {
      const payload = verifyAccessToken(token);
      if (payload) {
        await User.findByIdAndUpdate(payload.userId, { $unset: { refreshToken: 1 } });
      }
    }
    return NextResponse.json({ success: true, data: { message: 'Logged out successfully' } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
