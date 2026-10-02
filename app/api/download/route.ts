import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { prepareVideoDownload } from '@/lib/media-service';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';
import { validateMediaUrl } from '@/lib/validator';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  let cleanupFn: (() => void) | null = null;
  try {
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(ip, 10, 60 * 1000);

    if (!rateLimit.allowed) {
      return new NextResponse('Rate limit exceeded. Please wait a moment before starting new downloads.', {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(rateLimit.resetMs / 1000).toString(),
        },
      });
    }

    const { searchParams } = new URL(req.url);
    const rawUrl = searchParams.get('url');
    const rawHeight = searchParams.get('height');

    if (!rawUrl) {
      return new NextResponse('Missing required parameter: url', { status: 400 });
    }

    const validation = validateMediaUrl(rawUrl);
    if (!validation.isValid || !validation.normalizedUrl) {
      return new NextResponse(validation.error || 'Invalid media URL', { status: 400 });
    }

    const targetHeight = rawHeight ? parseInt(rawHeight, 10) : undefined;
    const { filePath, fileName, cleanup } = await prepareVideoDownload(
      validation.normalizedUrl,
      targetHeight
    );
    cleanupFn = cleanup;

    const stats = fs.statSync(filePath);
    const nodeStream = fs.createReadStream(filePath);

    // Convert Node.js readable stream to Web standard ReadableStream for Next.js App Router
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on('data', (chunk) => {
          controller.enqueue(chunk);
        });
        nodeStream.on('end', () => {
          controller.close();
          if (cleanupFn) {
            cleanupFn();
            cleanupFn = null;
          }
        });
        nodeStream.on('error', (err) => {
          controller.error(err);
          if (cleanupFn) {
            cleanupFn();
            cleanupFn = null;
          }
        });
      },
      cancel() {
        nodeStream.destroy();
        if (cleanupFn) {
          cleanupFn();
          cleanupFn = null;
        }
      },
    });

    const safeFilename = fileName.replace(/[^\x20-\x7E]/g, '_');

    return new Response(webStream, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': stats.size.toString(),
        'Content-Disposition': `attachment; filename="${encodeURIComponent(safeFilename)}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err: any) {
    if (cleanupFn) {
      try {
        cleanupFn();
      } catch {}
    }
    console.error('[API /download] Error:', err.message);
    return new NextResponse(err.message || 'Failed to process media download.', { status: 500 });
  }
}
