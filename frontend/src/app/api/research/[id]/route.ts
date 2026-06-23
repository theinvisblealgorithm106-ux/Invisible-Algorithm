import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Research } from '@/models/Research';
import { requireAdmin } from '@/lib/auth-helpers';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const research = await Research.findOne(isObjectId ? { _id: id } : { slug: id });
    if (!research) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    await Research.findByIdAndUpdate(research._id, { $inc: { views: 1 } });
    return NextResponse.json({ success: true, data: { research } });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req);
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const research = await Research.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!research) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: { research } });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req);
    await connectDB();
    const { id } = await params;
    await Research.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
