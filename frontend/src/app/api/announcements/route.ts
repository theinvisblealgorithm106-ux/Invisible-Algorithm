import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Announcement } from '@/models/Announcement';
import { getTokenFromRequest, verifyAccessToken, requireAdminTabWrite } from '@/lib/auth-helpers';
import { canViewTab } from '@/lib/permissions';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category') || '';
    const token = getTokenFromRequest(req);
    const payload = token ? verifyAccessToken(token) : null;
    const canSeeAllStatuses = payload && canViewTab(payload.role, 'announcements');

    const query: Record<string, unknown> = {};
    if (!canSeeAllStatuses) query.status = 'published';
    if (category) query.category = category;

    const total = await Announcement.countDocuments(query);
    const announcements = await Announcement.find(query)
      .sort({ pinned: -1, publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({ success: true, data: { announcements, pagination: { total, page, pages: Math.ceil(total / limit) } } });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = requireAdminTabWrite(req, 'announcements');
    await connectDB();
    const body = await req.json();
    const announcement = await Announcement.create({ ...body, author: payload.userId });
    return NextResponse.json({ success: true, data: { announcement } }, { status: 201 });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
