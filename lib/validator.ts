export type Platform = 'youtube' | 'instagram';

export interface ValidationResult {
  isValid: boolean;
  platform?: Platform;
  normalizedUrl?: string;
  error?: string;
}

// Private IPv4 prefixes & patterns for SSRF prevention
const PRIVATE_IP_PATTERNS = [
  /^0\./,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^localhost$/i,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
];

const YOUTUBE_HOSTNAMES = [
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
];

const INSTAGRAM_HOSTNAMES = [
  'instagram.com',
  'www.instagram.com',
  'instagr.am',
];

export function validateMediaUrl(rawUrl: string): ValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, error: 'URL is required.' };
  }

  const trimmed = rawUrl.trim();
  if (trimmed.length < 8 || trimmed.length > 2048) {
    return { isValid: false, error: 'Invalid URL length.' };
  }

  let parsed: URL;
  try {
    // Add protocol if omitted
    const withProtocol = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;
    parsed = new URL(withProtocol);
  } catch {
    return { isValid: false, error: 'Malformed URL format.' };
  }

  // Enforce HTTPS or HTTP only
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return { isValid: false, error: 'Invalid URL protocol. Only HTTP and HTTPS are permitted.' };
  }

  const hostname = parsed.hostname.toLowerCase();

  // SSRF guard
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      return { isValid: false, error: 'Access to internal or loopback addresses is strictly forbidden.' };
    }
  }

  // Detect YouTube
  const isYouTube = YOUTUBE_HOSTNAMES.some(
    (h) => hostname === h || hostname.endsWith(`.${h}`)
  );

  if (isYouTube) {
    // Check if it has a video id or path
    if (hostname === 'youtu.be' && parsed.pathname.length > 1) {
      return {
        isValid: true,
        platform: 'youtube',
        normalizedUrl: parsed.toString(),
      };
    }

    if (
      parsed.pathname.includes('/watch') ||
      parsed.pathname.includes('/shorts/') ||
      parsed.pathname.includes('/live/') ||
      parsed.pathname.includes('/embed/') ||
      parsed.pathname.includes('/v/')
    ) {
      return {
        isValid: true,
        platform: 'youtube',
        normalizedUrl: parsed.toString(),
      };
    }

    return { isValid: false, error: 'Invalid YouTube video URL. Please provide a direct video, short, or live stream link.' };
  }

  // Detect Instagram
  const isInstagram = INSTAGRAM_HOSTNAMES.some(
    (h) => hostname === h || hostname.endsWith(`.${h}`)
  );

  if (isInstagram) {
    if (
      parsed.pathname.includes('/reel/') ||
      parsed.pathname.includes('/p/') ||
      parsed.pathname.includes('/tv/') ||
      parsed.pathname.includes('/share/')
    ) {
      return {
        isValid: true,
        platform: 'instagram',
        normalizedUrl: parsed.toString(),
      };
    }

    return {
      isValid: false,
      error: 'Invalid Instagram video URL. Please provide a public post, reel, or video URL.',
    };
  }

  return {
    isValid: false,
    error: 'Unsupported platform. MediaFetch currently supports permitted YouTube and Instagram videos.',
  };
}
