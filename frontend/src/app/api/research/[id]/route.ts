import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Research } from '@/models/Research';
import { requireResearchModerator } from '@/lib/auth-helpers';
import { deletePdfFromDrive } from '@/lib/googleDrive';

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
    requireResearchModerator(req);
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
    requireResearchModerator(req);
    await connectDB();
    const { id } = await params;
    const research = await Research.findByIdAndDelete(id);
    if (research?.pdfDriveFileId) {
      await deletePdfFromDrive(research.pdfDriveFileId);
    }
    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
