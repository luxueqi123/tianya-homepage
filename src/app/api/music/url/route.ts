import { NextResponse } from 'next/server';

import { getCachedQqMusicPreview } from '@/lib/qqmusic/preview-cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PREVIEW_HEADERS = {
  'Cache-Control': 'private, max-age=60',
};

export async function GET() {
  try {
    const preview = await getCachedQqMusicPreview();
    return NextResponse.json(
      {
        ok: true,
        url: preview.url,
        source: 'qqmusic',
        preview: true,
        expiresIn: preview.expiresIn,
      },
      { headers: PREVIEW_HEADERS },
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: '音乐暂时不可用，请稍后再试',
        reason: 'preview_unavailable',
      },
      { status: 503, headers: PREVIEW_HEADERS },
    );
  }
}
