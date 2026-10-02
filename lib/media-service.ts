import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import { getYtDlpPath, getFfmpegPath } from './binary-manager';
import { validateMediaUrl } from './validator';

export interface MediaResolution {
  height: number;
  label: string;
  isBest: boolean;
  formatId?: string;
  ext: string;
  filesizeApprox?: number;
  fps?: number;
}

export interface MediaAnalysis {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  durationFormatted: string;
  author: string;
  platform: 'youtube' | 'instagram';
  resolutions: MediaResolution[];
  bestResolutionLabel: string;
  audioBitrateKbps?: number;
  isLive?: boolean;
}

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export async function analyzeMedia(rawUrl: string): Promise<MediaAnalysis> {
  const validation = validateMediaUrl(rawUrl);
  if (!validation.isValid || !validation.normalizedUrl || !validation.platform) {
    throw new Error(validation.error || 'Invalid media URL.');
  }

  const ytdlpPath = getYtDlpPath();
  if (!fs.existsSync(ytdlpPath)) {
    throw new Error('yt-dlp processing engine is currently not installed or unavailable.');
  }

  const args = [
    '--dump-json',
    '--no-playlist',
    '--no-warnings',
    '--skip-download',
    '--quiet',
    validation.normalizedUrl,
  ];

  const jsonOutput = await new Promise<string>((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const proc = spawn(ytdlpPath, args, { windowsHide: true });

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    const timeout = setTimeout(() => {
      proc.kill('SIGKILL');
      reject(new Error('Analysis timed out. The server took too long to fetch media information.'));
    }, 45000);

    proc.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        // Sanitize error message to avoid leaking internals
        const errLower = stderr.toLowerCase();
        if (errLower.includes('private video') || errLower.includes('private account')) {
          reject(new Error('This media is private or not publicly accessible.'));
        } else if (errLower.includes('sign in') || errLower.includes('login required')) {
          reject(new Error('This media requires account login. MediaFetch only downloads public content.'));
        } else if (errLower.includes('not found') || errLower.includes('404')) {
          reject(new Error('Media not found. Please verify the URL.'));
        } else {
          reject(new Error('Unable to extract media information. The link may be restricted or unsupported.'));
        }
        return;
      }
      resolve(stdout);
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`Failed to start analysis engine: ${err.message}`));
    });
  });

  let data: any;
  try {
    data = JSON.parse(jsonOutput);
  } catch (err) {
    throw new Error('Failed to parse media format information.');
  }

  const title = data.title || 'Untitled Media';
  const thumbnail = data.thumbnail || '';
  const duration = typeof data.duration === 'number' ? data.duration : 0;
  const author = data.uploader || data.channel || data.creator || 'Unknown Creator';
  const formats: any[] = Array.isArray(data.formats) ? data.formats : [];

  // Extract distinct video heights
  const heightMap = new Map<number, { formatId: string; filesize?: number; fps?: number }>();

  for (const f of formats) {
    const h = f.height;
    if (h && typeof h === 'number' && h > 0) {
      const existing = heightMap.get(h);
      const size = f.filesize || f.filesize_approx || undefined;
      const fps = f.fps;
      if (!existing || (size && (!existing.filesize || size > existing.filesize))) {
        heightMap.set(h, {
          formatId: f.format_id,
          filesize: size,
          fps,
        });
      }
    }
  }

  // If no formats had explicit height (e.g. some Instagram posts), use a default progressive video resolution
  let heights = Array.from(heightMap.keys()).sort((a, b) => b - a);
  if (heights.length === 0) {
    heights = [720]; // default fallback quality
  }

  const maxHeight = heights[0];
  const bestLabel = maxHeight >= 2160
    ? 'Best Quality — 2160p (4K)'
    : maxHeight >= 1440
    ? 'Best Quality — 1440p (2K)'
    : maxHeight >= 1080
    ? 'Best Quality — 1080p (Full HD)'
    : maxHeight >= 720
    ? 'Best Quality — 720p (HD)'
    : `Best Quality — ${maxHeight}p`;

  const resolutions: MediaResolution[] = heights.map((h, index) => {
    const info = heightMap.get(h);
    const isBest = index === 0;
    let label = `${h}p`;
    if (h >= 2160) label = isBest ? `Best Quality — 2160p (4K)` : `2160p (4K)`;
    else if (h >= 1440) label = isBest ? `Best Quality — 1440p (2K)` : `1440p (2K)`;
    else if (h >= 1080) label = isBest ? `Best Quality — 1080p (Full HD)` : `1080p (Full HD)`;
    else if (h >= 720) label = isBest ? `Best Quality — 720p (HD)` : `720p (HD)`;
    else label = isBest ? `Best Quality — ${h}p` : `${h}p`;

    return {
      height: h,
      label,
      isBest,
      formatId: info?.formatId,
      ext: 'mp4',
      filesizeApprox: info?.filesize,
      fps: info?.fps,
    };
  });

  // Calculate best available audio bitrate
  let bestAudioBitrate = 128;
  for (const f of formats) {
    if (f.abr && typeof f.abr === 'number' && f.abr > bestAudioBitrate) {
      bestAudioBitrate = Math.round(f.abr);
    }
  }

  return {
    id: data.id || 'video',
    title,
    thumbnail,
    duration,
    durationFormatted: formatDuration(duration),
    author,
    platform: validation.platform,
    resolutions,
    bestResolutionLabel: bestLabel,
    audioBitrateKbps: bestAudioBitrate,
    isLive: data.is_live || false,
  };
}

export interface PreparedDownload {
  filePath: string;
  cleanup: () => void;
  fileName: string;
}

export async function prepareVideoDownload(
  rawUrl: string,
  targetHeight?: number
): Promise<PreparedDownload> {
  const validation = validateMediaUrl(rawUrl);
  if (!validation.isValid || !validation.normalizedUrl) {
    throw new Error(validation.error || 'Invalid media URL.');
  }

  const ytdlpPath = getYtDlpPath();
  const ffmpegPath = getFfmpegPath();
  const ffmpegDir = path.dirname(ffmpegPath);

  const sessionDir = path.join(os.tmpdir(), 'mediafetch', crypto.randomUUID());
  fs.mkdirSync(sessionDir, { recursive: true });

  const outputPattern = path.join(sessionDir, '%(title).100B.%(ext)s');

  const args = [
    '--no-playlist',
    '--no-warnings',
    '--windows-filenames',
    '--merge-output-format',
    'mp4',
  ];

  if (fs.existsSync(ffmpegPath) || fs.existsSync(ffmpegDir)) {
    args.push('--ffmpeg-location', ffmpegDir);
  }

  if (targetHeight && targetHeight > 0) {
    args.push(
      '-f',
      `bestvideo[height<=?${targetHeight}]+bestaudio/best[height<=?${targetHeight}]/best`
    );
  } else {
    args.push('-f', 'bestvideo+bestaudio/best');
  }

  args.push('-o', outputPattern, validation.normalizedUrl);

  return new Promise((resolve, reject) => {
    const proc = spawn(ytdlpPath, args, { windowsHide: true });

    let stderr = '';
    proc.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    const timeout = setTimeout(() => {
      proc.kill('SIGKILL');
      try {
        fs.rmSync(sessionDir, { recursive: true, force: true });
      } catch {}
      reject(new Error('Download timed out after 120 seconds.'));
    }, 120000);

    proc.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } catch {}
        reject(new Error('Download failed. Media may be inaccessible or restricted.'));
        return;
      }

      const files = fs.readdirSync(sessionDir);
      const outputFile = files.find((f) => f.endsWith('.mp4')) || files[0];

      if (!outputFile) {
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } catch {}
        reject(new Error('No processed media file generated.'));
        return;
      }

      const fullPath = path.join(sessionDir, outputFile);
      resolve({
        filePath: fullPath,
        fileName: outputFile,
        cleanup: () => {
          try {
            fs.rmSync(sessionDir, { recursive: true, force: true });
          } catch {}
        },
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      try {
        fs.rmSync(sessionDir, { recursive: true, force: true });
      } catch {}
      reject(new Error(`Failed to execute download engine: ${err.message}`));
    });
  });
}

export async function prepareMp3Conversion(
  rawUrl: string,
  qualityBitrate?: string
): Promise<PreparedDownload> {
  const validation = validateMediaUrl(rawUrl);
  if (!validation.isValid || !validation.normalizedUrl) {
    throw new Error(validation.error || 'Invalid media URL.');
  }

  const ytdlpPath = getYtDlpPath();
  const ffmpegPath = getFfmpegPath();
  const ffmpegDir = path.dirname(ffmpegPath);

  const sessionDir = path.join(os.tmpdir(), 'mediafetch', crypto.randomUUID());
  fs.mkdirSync(sessionDir, { recursive: true });

  const outputPattern = path.join(sessionDir, '%(title).100B.%(ext)s');

  const args = [
    '--no-playlist',
    '--no-warnings',
    '--windows-filenames',
    '-x',
    '--audio-format',
    'mp3',
    '--audio-quality',
    '0', // Best VBR quality without false upscaling
  ];

  if (fs.existsSync(ffmpegPath) || fs.existsSync(ffmpegDir)) {
    args.push('--ffmpeg-location', ffmpegDir);
  }

  args.push('-o', outputPattern, validation.normalizedUrl);

  return new Promise((resolve, reject) => {
    const proc = spawn(ytdlpPath, args, { windowsHide: true });

    let stderr = '';
    proc.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    const timeout = setTimeout(() => {
      proc.kill('SIGKILL');
      try {
        fs.rmSync(sessionDir, { recursive: true, force: true });
      } catch {}
      reject(new Error('MP3 conversion timed out after 120 seconds.'));
    }, 120000);

    proc.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } catch {}
        reject(new Error('Audio conversion failed. Media may be inaccessible or restricted.'));
        return;
      }

      const files = fs.readdirSync(sessionDir);
      const outputFile = files.find((f) => f.endsWith('.mp3')) || files[0];

      if (!outputFile) {
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } catch {}
        reject(new Error('No converted MP3 file generated.'));
        return;
      }

      const fullPath = path.join(sessionDir, outputFile);
      resolve({
        filePath: fullPath,
        fileName: outputFile,
        cleanup: () => {
          try {
            fs.rmSync(sessionDir, { recursive: true, force: true });
          } catch {}
        },
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      try {
        fs.rmSync(sessionDir, { recursive: true, force: true });
      } catch {}
      reject(new Error(`Failed to execute audio conversion engine: ${err.message}`));
    });
  });
}
