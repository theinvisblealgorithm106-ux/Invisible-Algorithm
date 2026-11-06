import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Research } from '@/models/Research';
import { requireAdmin } from '@/lib/auth-helpers';

async function findResearch(id: string) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const doc = await Research.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
    if (doc) return doc;
  }
  return Research.findOneAndUpdate({ slug: id }, { $inc: { views: 1 } }, { new: true });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const research = await findResearch(id);
    if (!research) {
      return NextResponse.json({ success: false, message: 'Research not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { research } });
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
    const research = await Research.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!research) {
      return NextResponse.json({ success: false, message: 'Research not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { research } });
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
    const research = await Research.findByIdAndDelete(id);
    if (!research) {
      return NextResponse.json({ success: false, message: 'Research not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { message: 'Research deleted' } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
