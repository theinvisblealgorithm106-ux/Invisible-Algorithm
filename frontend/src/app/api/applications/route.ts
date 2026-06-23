import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Application } from '@/models/Application';
import { requireAdmin } from '@/lib/auth-helpers';

export async function GET(req: Request) {
  try {
    requireAdmin(req);
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || '';
    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    const total = await Application.countDocuments(query);
    const applications = await Application.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    return NextResponse.json({ success: true, data: { applications, pagination: { total, page, pages: Math.ceil(total / limit) } } });
  } catch (err) {
    if (err instanceof NextResponse) return err;
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
    const msg = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
