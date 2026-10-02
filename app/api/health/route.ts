import { NextResponse } from 'next/server';
import { getBinaryStatus } from '@/lib/binary-manager';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = getBinaryStatus();
  return NextResponse.json({
    status: status.ytdlp && status.ffmpeg ? 'healthy' : 'degraded',
    binaries: status,
    timestamp: new Date().toISOString(),
  });
}
