import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Event } from '@/models/Event';
import { deriveEventStatus, isEventOpen } from '@/lib/eventStatus';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const { name, email } = await req.json();
    if (!name || !email) return NextResponse.json({ success: false, message: 'Name and email required' }, { status: 400 });
    const event = await Event.findById(id);
    if (!event) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });

    // Without this it was possible to register for an event that finished
    // years ago, since nothing checked the dates.
    if (!isEventOpen(event)) {
      const status = deriveEventStatus(event);
      return NextResponse.json({
        success: false,
        message: status === 'cancelled' ? 'This event was cancelled' : 'This event has already ended',
      }, { status: 400 });
    }

    if (event.capacity && event.registeredCount >= event.capacity) {
      return NextResponse.json({ success: false, message: 'Event is full' }, { status: 400 });
    }
    event.registrations.push({ name, email, registeredAt: new Date() });
    event.registeredCount += 1;
    await event.save();
    return NextResponse.json({ success: true, message: 'Registered successfully' });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
