import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Newsletter } from '@/models/Newsletter';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    await Newsletter.findOneAndUpdate({ email: email.toLowerCase() }, { isActive: false });
    return NextResponse.json({ success: true, data: { message: 'Unsubscribed successfully' } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
