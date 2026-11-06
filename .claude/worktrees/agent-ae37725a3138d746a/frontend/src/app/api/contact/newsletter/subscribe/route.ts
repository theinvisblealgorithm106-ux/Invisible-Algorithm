import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Newsletter } from '@/models/Newsletter';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, firstName } = await req.json();
    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const subscriber = await Newsletter.findOneAndUpdate(
      { email: email.toLowerCase() },
      { email: email.toLowerCase(), firstName, isActive: true, subscribedAt: new Date() },
      { upsert: true, new: true },
    );

    return NextResponse.json({ success: true, data: { subscriber } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
