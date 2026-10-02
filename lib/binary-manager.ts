import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

let cachedYtDlpPath: string | null = null;
let cachedFfmpegPath: string | null = null;

export function getYtDlpPath(): string {
  if (cachedYtDlpPath && fs.existsSync(cachedYtDlpPath)) {
    return cachedYtDlpPath;
  }

  // 1. Check environment override
  if (process.env.YTDLP_PATH && fs.existsSync(process.env.YTDLP_PATH)) {
    cachedYtDlpPath = process.env.YTDLP_PATH;
    return cachedYtDlpPath;
  }

  // 2. Check local project bin/ directory
  const binName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
  const projectBin = path.join(process.cwd(), 'bin', binName);
  if (fs.existsSync(projectBin)) {
    cachedYtDlpPath = projectBin;
    return cachedYtDlpPath;
  }

  // 3. Check system PATH
  try {
    const cmd = process.platform === 'win32' ? 'where.exe yt-dlp' : 'which yt-dlp';
    const found = execSync(cmd, { encoding: 'utf-8' }).trim().split('\n')[0].trim();
    if (found && fs.existsSync(found)) {
      cachedYtDlpPath = found;
      return cachedYtDlpPath;
    }
  } catch {
    // Not in PATH
  }

  // If missing, return expected project bin path (will fail gracefully with descriptive error)
  return projectBin;
}

export function getFfmpegPath(): string {
  if (cachedFfmpegPath && fs.existsSync(cachedFfmpegPath)) {
    return cachedFfmpegPath;
  }

  // 1. Check environment override
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    cachedFfmpegPath = process.env.FFMPEG_PATH;
    return cachedFfmpegPath;
  }

  const binName = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';

  // 2. Check local bin/
  const projectBin = path.join(process.cwd(), 'bin', binName);
  if (fs.existsSync(projectBin)) {
    cachedFfmpegPath = projectBin;
    return cachedFfmpegPath;
  }

  // 3. Check node_modules/ffmpeg-static binary directly
  const staticModuleBin = path.join(process.cwd(), 'node_modules', 'ffmpeg-static', binName);
  if (fs.existsSync(staticModuleBin)) {
    cachedFfmpegPath = staticModuleBin;
    return cachedFfmpegPath;
  }

  // 4. Check ffmpeg-static package export
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ffmpegStatic = require('ffmpeg-static');
    if (ffmpegStatic && typeof ffmpegStatic === 'string' && fs.existsSync(ffmpegStatic)) {
      cachedFfmpegPath = ffmpegStatic;
      return cachedFfmpegPath;
    }
  } catch {
    // ffmpeg-static not yet resolved
  }

  // 4. Check system PATH
  try {
    const cmd = process.platform === 'win32' ? 'where.exe ffmpeg' : 'which ffmpeg';
    const found = execSync(cmd, { encoding: 'utf-8' }).trim().split('\n')[0].trim();
    if (found && fs.existsSync(found)) {
      cachedFfmpegPath = found;
      return cachedFfmpegPath;
    }
  } catch {
    // Not in PATH
  }

  return 'ffmpeg';
}

export function getBinaryStatus(): { ytdlp: boolean; ytdlpPath: string; ffmpeg: boolean; ffmpegPath: string } {
  const yPath = getYtDlpPath();
  const fPath = getFfmpegPath();
  const yExists = fs.existsSync(yPath);
  let fExists = false;

  try {
    if (fs.existsSync(fPath)) {
      fExists = true;
    } else {
      execSync(`${fPath} -version`, { stdio: 'ignore' });
      fExists = true;
    }
  } catch {
    fExists = false;
  }

  return {
    ytdlp: yExists,
    ytdlpPath: yPath,
    ffmpeg: fExists,
    ffmpegPath: fPath,
  };
}
