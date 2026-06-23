import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Newsletter } from '@/models/Newsletter';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, firstName } = await req.json();
    if (!email) return NextResponse.json({ success: false, message: 'Email required' }, { status: 400 });
    await Newsletter.findOneAndUpdate({ email: email.toLowerCase() }, { email: email.toLowerCase(), firstName, isActive: true }, { upsert: true, new: true });
    return NextResponse.json({ success: true, message: 'Subscribed successfully' });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
