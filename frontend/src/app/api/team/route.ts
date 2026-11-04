import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { TeamMember } from '@/models/TeamMember';
import { getTokenFromRequest, verifyAccessToken, requireAdminTabWrite } from '@/lib/auth-helpers';
import { canViewTab } from '@/lib/permissions';
import { seedTeamIfEmpty } from '@/lib/teamSeed';

export async function GET(req: Request) {
  try {
    await connectDB();
    await seedTeamIfEmpty();

    const token = getTokenFromRequest(req);
    const payload = token ? verifyAccessToken(token) : null;
    // Admins editing the Team tab need to see hidden members too; the public
    // team page only ever gets the active ones.
    const canSeeHidden = !!payload && canViewTab(payload.role, 'team');

    const query: Record<string, unknown> = canSeeHidden ? {} : { isActive: true };
    const members = await TeamMember.find(query).sort({ order: 1, createdAt: 1 });

    return NextResponse.json({ success: true, data: { members } });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    requireAdminTabWrite(req, 'team');
    await connectDB();
    const body = await req.json();

    // New members go to the end of the list unless an order was given.
    if (body.order === undefined || body.order === null || body.order === '') {
      const last = await TeamMember.findOne().sort({ order: -1 }).select('order');
      body.order = last ? last.order + 1 : 0;
    }

    const member = await TeamMember.create(body);
    return NextResponse.json({ success: true, data: { member } }, { status: 201 });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    // A duplicate slug is the one error an admin can actually fix, so say so
    // instead of returning a generic 500.
    if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
      return NextResponse.json(
        { success: false, message: 'A team member with that URL slug already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
