import path from 'path';
import fs from 'fs';
import os from 'os';
import { execSync } from 'child_process';

let cachedYtDlpPath: string | null = null;
let cachedFfmpegPath: string | null = null;

function ensureExecutableOnLinux(srcPath: string, destName: string): string {
  if (process.platform === 'win32') return srcPath;

  const tmpPath = path.join(os.tmpdir(), destName);
  try {
    if (!fs.existsSync(tmpPath) || fs.statSync(tmpPath).size < 1000) {
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, tmpPath);
      }
    }
    if (fs.existsSync(tmpPath)) {
      try {
        fs.chmodSync(tmpPath, 0o755);
      } catch {}
      return tmpPath;
    }
  } catch (err) {
    console.warn(`[binary-manager] Error preparing ${destName} in /tmp:`, err);
  }
  return srcPath;
}

export function getYtDlpPath(): string {
  if (cachedYtDlpPath && fs.existsSync(cachedYtDlpPath)) {
    return cachedYtDlpPath;
  }

  // 1. Check environment override
  if (process.env.YTDLP_PATH && fs.existsSync(process.env.YTDLP_PATH)) {
    cachedYtDlpPath = process.env.YTDLP_PATH;
    return cachedYtDlpPath;
  }

  const binName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';

  // 2. On Linux/Serverless (e.g. Vercel), check /tmp first
  if (process.platform !== 'win32') {
    const tmpBin = path.join(os.tmpdir(), 'yt-dlp');
    if (fs.existsSync(tmpBin) && fs.statSync(tmpBin).size > 1000000) {
      cachedYtDlpPath = tmpBin;
      return cachedYtDlpPath;
    }
  }

  // 3. Check local project bin/ directory
  const projectBin = path.join(process.cwd(), 'bin', binName);
  if (fs.existsSync(projectBin)) {
    if (process.platform !== 'win32') {
      const readyPath = ensureExecutableOnLinux(projectBin, 'yt-dlp');
      cachedYtDlpPath = readyPath;
      return cachedYtDlpPath;
    }
    cachedYtDlpPath = projectBin;
    return cachedYtDlpPath;
  }

  // 4. Check system PATH
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

  // 5. On-demand fallback download for Linux Serverless (Vercel) if missing from bundle
  if (process.platform !== 'win32') {
    const tmpBin = path.join(os.tmpdir(), 'yt-dlp');
    try {
      console.log('[binary-manager] yt-dlp missing in serverless runtime, downloading to /tmp...');
      execSync(`curl -L -o "${tmpBin}" "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp"`, {
        timeout: 20000,
        stdio: 'ignore',
      });
      if (fs.existsSync(tmpBin) && fs.statSync(tmpBin).size > 1000000) {
        fs.chmodSync(tmpBin, 0o755);
        cachedYtDlpPath = tmpBin;
        return cachedYtDlpPath;
      }
    } catch (err) {
      console.warn('[binary-manager] Failed to download yt-dlp to /tmp on demand:', err);
    }
  }

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

  // 2. On Linux/Serverless, check /tmp
  if (process.platform !== 'win32') {
    const tmpBin = path.join(os.tmpdir(), 'ffmpeg');
    if (fs.existsSync(tmpBin)) {
      cachedFfmpegPath = tmpBin;
      return cachedFfmpegPath;
    }
  }

  // 3. Check local bin/
  const projectBin = path.join(process.cwd(), 'bin', binName);
  if (fs.existsSync(projectBin)) {
    if (process.platform !== 'win32') {
      cachedFfmpegPath = ensureExecutableOnLinux(projectBin, 'ffmpeg');
      return cachedFfmpegPath;
    }
    cachedFfmpegPath = projectBin;
    return cachedFfmpegPath;
  }

  // 4. Check node_modules/ffmpeg-static binary directly
  const staticModuleBin = path.join(process.cwd(), 'node_modules', 'ffmpeg-static', binName);
  if (fs.existsSync(staticModuleBin)) {
    if (process.platform !== 'win32') {
      cachedFfmpegPath = ensureExecutableOnLinux(staticModuleBin, 'ffmpeg');
      return cachedFfmpegPath;
    }
    cachedFfmpegPath = staticModuleBin;
    return cachedFfmpegPath;
  }

  // 5. Check ffmpeg-static package export
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ffmpegStatic = require('ffmpeg-static');
    if (ffmpegStatic && typeof ffmpegStatic === 'string' && fs.existsSync(ffmpegStatic)) {
      if (process.platform !== 'win32') {
        cachedFfmpegPath = ensureExecutableOnLinux(ffmpegStatic, 'ffmpeg');
        return cachedFfmpegPath;
      }
      cachedFfmpegPath = ffmpegStatic;
      return cachedFfmpegPath;
    }
  } catch {
    // ffmpeg-static not yet resolved
  }

  // 6. Check system PATH
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
