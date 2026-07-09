'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '../../../../sanity.config';

export { viewport } from 'next-sanity/studio';

export const dynamic = 'force-dynamic';

export default function StudioPage() {
  return <NextStudio config={config} />;
}
