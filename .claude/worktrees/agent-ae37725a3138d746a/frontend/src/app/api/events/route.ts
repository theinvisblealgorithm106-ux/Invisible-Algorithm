import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Event } from '@/models/Event';
import { getTokenFromRequest, verifyAccessToken, requireAdmin } from '@/lib/auth-helpers';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const statusParam = searchParams.get('status') || '';
    const typeParam = searchParams.get('type') || '';

    const token = getTokenFromRequest(req);
    const payload = token ? verifyAccessToken(token) : null;
    const isAdmin = payload && (payload.role === 'admin' || payload.role === 'super_admin');

    const filter: Record<string, unknown> = {};
    if (!isAdmin) {
      filter.isPublic = true;
      if (statusParam) filter.status = statusParam;
      else filter.status = { $in: ['upcoming', 'ongoing'] };
    } else if (statusParam) {
      filter.status = statusParam;
    }
    if (typeParam) filter.type = typeParam;

    const total = await Event.countDocuments(filter);
    const events = await Event.find(filter)
      .sort({ startDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: { events, pagination: { total, page, pages: Math.ceil(total / limit) } },
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
    const event = await Event.create({ ...body, organizer: new mongoose.Types.ObjectId(admin.userId) });
    return NextResponse.json({ success: true, data: { event } }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
