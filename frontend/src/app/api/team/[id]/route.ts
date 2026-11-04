import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { TeamMember } from '@/models/TeamMember';
import {
  getTokenFromRequest,
  verifyAccessToken,
  requireAdminTabWrite,
} from '@/lib/auth-helpers';
import { canViewTab } from '@/lib/permissions';
import { seedTeamIfEmpty } from '@/lib/teamSeed';

// Fields an admin is allowed to set. Anything else in the body is ignored so
// a stray _id/createdAt from a round-tripped object can't corrupt the doc.
const EDITABLE_FIELDS = [
  'slug',
  'firstName',
  'lastName',
  'role',
  'school',
  'avatar',
  'avatarPosition',
  'bio',
  'socialLinks',
  'order',
  'isActive',
] as const;

function pickEditable(body: Record<string, unknown>) {
  const update: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) update[field] = body[field];
  }
  return update;
}

// /team/[slug] is the public URL, so look members up by slug as well as by id.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    await seedTeamIfEmpty();
    const { id } = await params;

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const member = await TeamMember.findOne(isObjectId ? { _id: id } : { slug: id });
    if (!member) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });

    // Don't leak a hidden member's profile on the public page.
    if (!member.isActive) {
      const token = getTokenFromRequest(req);
      const payload = token ? verifyAccessToken(token) : null;
      if (!payload || !canViewTab(payload.role, 'team')) {
        return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
      }
    }

    return NextResponse.json({ success: true, data: { member } });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdminTabWrite(req, 'team');
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const member = await TeamMember.findByIdAndUpdate(id, pickEditable(body), {
      new: true,
      runValidators: true,
    });
    if (!member) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: { member } });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
      return NextResponse.json(
        { success: false, message: 'A team member with that URL slug already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdminTabWrite(req, 'team');
    await connectDB();
    const { id } = await params;
    const member = await TeamMember.findByIdAndDelete(id);
    if (!member) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
