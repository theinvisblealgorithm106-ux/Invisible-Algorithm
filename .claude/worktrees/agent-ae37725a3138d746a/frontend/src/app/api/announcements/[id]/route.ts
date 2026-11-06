import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Announcement } from '@/models/Announcement';
import { requireAdmin } from '@/lib/auth-helpers';

async function findAnnouncement(id: string) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const doc = await Announcement.findById(id);
    if (doc) return doc;
  }
  return Announcement.findOne({ slug: id });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const announcement = await findAnnouncement(id);
    if (!announcement) {
      return NextResponse.json({ success: false, message: 'Announcement not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { announcement } });
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
    const announcement = await Announcement.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!announcement) {
      return NextResponse.json({ success: false, message: 'Announcement not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { announcement } });
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
    const announcement = await Announcement.findByIdAndDelete(id);
    if (!announcement) {
      return NextResponse.json({ success: false, message: 'Announcement not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { message: 'Announcement deleted' } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
