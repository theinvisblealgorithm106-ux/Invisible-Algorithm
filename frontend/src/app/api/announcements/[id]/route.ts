import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Announcement } from '@/models/Announcement';
import { requireAdminTabWrite } from '@/lib/auth-helpers';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const announcement = await Announcement.findOne(isObjectId ? { _id: id } : { slug: id });
    if (!announcement) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: { announcement } });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdminTabWrite(req, 'announcements');
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const announcement = await Announcement.findByIdAndUpdate(id, body, { new: true });
    if (!announcement) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: { announcement } });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdminTabWrite(req, 'announcements');
    await connectDB();
    const { id } = await params;
    await Announcement.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
