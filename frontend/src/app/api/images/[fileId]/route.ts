import { NextResponse } from 'next/server';
import { getDriveImage } from '@/lib/googleDrive';

// Proxies an uploaded image out of Drive. Public by design — these are team
// photos and gallery pictures that appear on public pages.
//
// Drive file ids are opaque and unguessable, and this only ever serves files
// whose mime type is an image (enforced in getDriveImage), so it can't be used
// to read research PDFs out of the same folder.
export async function GET(_req: Request, { params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params;

  // Drive ids are URL-safe base64-ish; reject anything else before calling out.
  if (!/^[A-Za-z0-9_-]{10,128}$/.test(fileId)) {
    return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
  }

  try {
    const image = await getDriveImage(fileId);
    if (!image) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(image.data), {
      headers: {
        'Content-Type': image.mimeType,
        'Content-Length': String(image.data.byteLength),
        // The id changes whenever the image does, so this can be cached hard.
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
