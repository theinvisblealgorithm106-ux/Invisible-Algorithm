import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Newsletter } from '@/models/Newsletter';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();
    await Newsletter.findOneAndUpdate({ email: email.toLowerCase() }, { isActive: false });
    return NextResponse.json({ success: true, message: 'Unsubscribed' });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
