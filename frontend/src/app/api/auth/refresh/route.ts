import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '@/lib/auth-helpers';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { refreshToken } = await req.json();
    if (!refreshToken) return NextResponse.json({ success: false, message: 'Refresh token required' }, { status: 400 });
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) return NextResponse.json({ success: false, message: 'Invalid refresh token' }, { status: 401 });
    const user = await User.findById(payload.userId).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      return NextResponse.json({ success: false, message: 'Invalid refresh token' }, { status: 401 });
    }
    const newPayload = { userId: user._id.toString(), role: user.role };
    const accessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);
    user.refreshToken = newRefreshToken;
    await user.save();
    return NextResponse.json({ success: true, data: { accessToken, refreshToken: newRefreshToken } });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
