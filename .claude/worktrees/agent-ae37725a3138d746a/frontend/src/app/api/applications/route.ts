import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Application } from '@/models/Application';
import { requireAdmin } from '@/lib/auth-helpers';

export async function GET(req: Request) {
  try {
    await connectDB();
    try {
      requireAdmin(req);
    } catch (res) {
      return res as NextResponse;
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const total = await Application.countDocuments(filter);
    const applications = await Application.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: { applications, pagination: { total, page, pages: Math.ceil(total / limit) } },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const application = await Application.create(body);
    return NextResponse.json({ success: true, data: { application } }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
