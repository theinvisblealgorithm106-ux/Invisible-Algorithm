import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Announcement } from '@/models/Announcement';
import { getTokenFromRequest, verifyAccessToken, requireAdmin } from '@/lib/auth-helpers';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') || '';

    const token = getTokenFromRequest(req);
    const payload = token ? verifyAccessToken(token) : null;
    const isAdmin = payload && (payload.role === 'admin' || payload.role === 'super_admin');

    const filter: Record<string, unknown> = {};
    if (!isAdmin) filter.status = 'published';
    if (category) filter.category = category;

    const total = await Announcement.countDocuments(filter);
    const announcements = await Announcement.find(filter)
      .sort({ pinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: { announcements, pagination: { total, page, pages: Math.ceil(total / limit) } },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    let admin: { userId: string; role: string };
    try {
      admin = requireAdmin(req);
    } catch (res) {
      return res as NextResponse;
    }

    const body = await req.json();
    const announcement = await Announcement.create({ ...body, author: new mongoose.Types.ObjectId(admin.userId) });
    return NextResponse.json({ success: true, data: { announcement } }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
