import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Event } from '@/models/Event';
import { requireAdmin } from '@/lib/auth-helpers';

async function findEvent(id: string) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const doc = await Event.findById(id);
    if (doc) return doc;
  }
  return Event.findOne({ slug: id });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const event = await findEvent(id);
    if (!event) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { event } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    try {
      requireAdmin(req);
    } catch (res) {
      return res as NextResponse;
    }
    const { id } = await params;
    const body = await req.json();
    const event = await Event.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!event) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { event } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    try {
      requireAdmin(req);
    } catch (res) {
      return res as NextResponse;
    }
    const { id } = await params;
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { message: 'Event deleted' } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
