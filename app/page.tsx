import Link from 'next/link';
import {
  Download,
  Music,
  Video,
  Sparkles,
  ShieldCheck,
  Zap,
  HelpCircle,
} from 'lucide-react';
import MediaFetcher from '@/components/MediaFetcher';
import Logo from '@/components/Logo';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Hero Section */}
      <section className="w-full pt-10 sm:pt-16 pb-8 sm:pb-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-6 sm:mb-8 flex flex-col items-center">
          <Logo iconSize={52} showText={false} className="mb-1" />
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center justify-center">
            <span>Media</span>
            <span className="text-[#2563eb]">Fetch</span>
          </h1>
          <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 font-normal leading-relaxed text-balance">
            Download your permitted media in the best available quality.
          </p>
        </div>

        {/* Minimalist Media Fetcher Widget */}
        <MediaFetcher initialMode="universal" placeholder="Paste video URL here..." />
      </section>

      {/* Tool Navigation Cards: 1 Col on Phone, 3 Cols on Desktop */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/youtube"
            className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors shadow-sm flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                YouTube Video Downloader
              </span>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                Save public videos in genuine 1080p, 1440p, or 4K with audio merged via FFmpeg.
              </p>
            </div>
            <span className="mt-3 text-xs font-medium text-neutral-900 dark:text-neutral-100">
              Open Tool →
            </span>
          </Link>

          <Link
            href="/youtube-to-mp3"
            className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors shadow-sm flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                YouTube to MP3 Converter
              </span>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                Extract high-fidelity MP3 audio at the true source bitrate without artificial padding.
              </p>
            </div>
            <span className="mt-3 text-xs font-medium text-neutral-900 dark:text-neutral-100">
              Open Tool →
            </span>
          </Link>

          <Link
            href="/instagram"
            className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors shadow-sm flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                Instagram Video Downloader
              </span>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                Download publicly accessible Instagram Reels and video posts in native quality.
              </p>
            </div>
            <span className="mt-3 text-xs font-medium text-neutral-900 dark:text-neutral-100">
              Open Tool →
            </span>
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 border-t border-neutral-200 dark:border-neutral-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              True Resolutions
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              If the source is 1080p, we show 1080p. If it is 4K, we show 2160p. Zero false upscaling.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              FFmpeg Audio Engine
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Audio is converted on the server using industry-standard FFmpeg at actual stream bitrates.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              Server-Side Processing
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Video and audio streams are processed on the server and delivered directly as clean files.
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
              Security & Privacy
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Protected with SSRF guards, rate limiting, and automated temporary file cleanup.
            </p>
          </div>
        </div>
      </section>

      {/* Minimal FAQs */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 border-t border-neutral-200 dark:border-neutral-800">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              What media can I download with MediaFetch?
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              You can download permitted, publicly accessible videos and audio that you own or have explicit permission to access. MediaFetch does not bypass logins, DRM, or private accounts.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              Why isn't 4K shown for every video?
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              MediaFetch only presents formats that actually exist in the source file. If a video was uploaded in 1080p, we show "Best Quality — 1080p" rather than misleadingly advertising fake 4K.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
