import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ContactMessage } from '@/models/ContactMessage';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const message = await ContactMessage.create(body);
    return NextResponse.json({ success: true, data: { message } }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
