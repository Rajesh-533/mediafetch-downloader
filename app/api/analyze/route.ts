import { NextResponse } from 'next/server';
import { analyzeMedia } from '@/lib/media-service';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';
import { validateMediaUrl } from '@/lib/validator';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(ip, 30, 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please wait a moment before trying again.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(rateLimit.resetMs / 1000).toString(),
          },
        }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.url || typeof body.url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid media URL.' },
        { status: 400 }
      );
    }

    const validation = validateMediaUrl(body.url);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Invalid or unsupported URL.' },
        { status: 400 }
      );
    }

    const analysis = await analyzeMedia(validation.normalizedUrl!);

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (err: any) {
    console.error('[API /analyze] Error:', err.message);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to analyze media URL. Please ensure it is publicly accessible.',
      },
      { status: 500 }
    );
  }
}
