import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { signAccessToken, signRefreshToken } from '@/lib/auth-helpers';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.isActive) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    }

    const payload = { userId: user._id.toString(), role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;

    return NextResponse.json({ success: true, data: { user: userObj, accessToken, refreshToken } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
