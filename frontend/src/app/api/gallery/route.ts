import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { GalleryItem } from '@/models/GalleryItem';
import { getTokenFromRequest, verifyAccessToken, requireAdminTabWrite } from '@/lib/auth-helpers';
import { canViewTab } from '@/lib/permissions';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '24'), 100);
    const album = searchParams.get('album') || '';

    const token = getTokenFromRequest(req);
    const payload = token ? verifyAccessToken(token) : null;
    const canSeeHidden = !!payload && canViewTab(payload.role, 'gallery');

    const query: Record<string, unknown> = canSeeHidden ? {} : { isPublic: true };
    if (album) query.album = album;

    const total = await GalleryItem.countDocuments(query);
    const items = await GalleryItem.find(query)
      .sort({ order: 1, takenAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Album list for the public filter bar — distinct over what the caller
    // is allowed to see, so a hidden-only album doesn't leak as an empty tab.
    const albums = (await GalleryItem.distinct('album', canSeeHidden ? {} : { isPublic: true }))
      .filter(Boolean)
      .sort();

    return NextResponse.json({
      success: true,
      data: { items, albums, pagination: { total, page, pages: Math.ceil(total / limit) || 1 } },
    });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = requireAdminTabWrite(req, 'gallery');
    await connectDB();
    const body = await req.json();

    if (!body.image) {
      return NextResponse.json({ success: false, message: 'An image is required' }, { status: 400 });
    }

    if (body.order === undefined || body.order === null || body.order === '') {
      const last = await GalleryItem.findOne().sort({ order: -1 }).select('order');
      body.order = last ? last.order + 1 : 0;
    }

    const item = await GalleryItem.create({ ...body, uploadedBy: payload.userId });
    return NextResponse.json({ success: true, data: { item } }, { status: 201 });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
