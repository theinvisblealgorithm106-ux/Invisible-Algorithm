import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Research } from '@/models/Research';
import { getTokenFromRequest, verifyAccessToken, requireAdminTabWrite } from '@/lib/auth-helpers';
import { canViewTab } from '@/lib/permissions';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const token = getTokenFromRequest(req);
    const payload = token ? verifyAccessToken(token) : null;
    const canSeeAllStatuses = payload && canViewTab(payload.role, 'research');

    const query: Record<string, unknown> = {};
    if (!canSeeAllStatuses) query.status = 'published';
    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    const total = await Research.countDocuments(query);
    const research = await Research.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({ success: true, data: { research, pagination: { total, page, pages: Math.ceil(total / limit) } } });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = requireAdminTabWrite(req, 'research');
    await connectDB();
    const body = await req.json();
    const research = await Research.create({ ...body, submittedBy: payload.userId });
    return NextResponse.json({ success: true, data: { research } }, { status: 201 });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
