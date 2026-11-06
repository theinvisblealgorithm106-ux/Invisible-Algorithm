import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Research } from '@/models/Research';
import { getTokenFromRequest, verifyAccessToken, requireAdmin } from '@/lib/auth-helpers';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const statusParam = searchParams.get('status') || '';

    const token = getTokenFromRequest(req);
    const payload = token ? verifyAccessToken(token) : null;
    const isAdmin = payload && (payload.role === 'admin' || payload.role === 'super_admin');

    const filter: Record<string, unknown> = {};
    if (!isAdmin) filter.status = 'published';
    else if (statusParam) filter.status = statusParam;
    if (category) filter.category = category;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { abstract: { $regex: search, $options: 'i' } },
    ];

    const total = await Research.countDocuments(filter);
    const research = await Research.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: { research, pagination: { total, page, pages: Math.ceil(total / limit) } },
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
    const research = await Research.create({ ...body, submittedBy: new mongoose.Types.ObjectId(admin.userId) });
    return NextResponse.json({ success: true, data: { research } }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
