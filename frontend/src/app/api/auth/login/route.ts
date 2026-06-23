import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { signAccessToken, signRefreshToken } from '@/lib/auth-helpers';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password required' }, { status: 400 });
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }
    if (!user.isActive) {
      return NextResponse.json({ success: false, message: 'Account is disabled' }, { status: 403 });
    }
    const payload = { userId: user._id.toString(), role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    user.refreshToken = refreshToken;
    await user.save();
    const { password: _, refreshToken: __, ...userData } = user.toObject();
    return NextResponse.json({ success: true, data: { user: userData, accessToken, refreshToken } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
