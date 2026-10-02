import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 transition-colors mt-16 sm:mt-24">
      {/* Prominent Legal Notice Bar */}
      <div className="border-b border-neutral-200 dark:border-neutral-800/80 py-3 px-4 bg-neutral-100/50 dark:bg-neutral-900/50">
        <p className="max-w-5xl mx-auto text-center text-xs text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
          <strong>Notice:</strong> Download only content you own or have permission to download. Respect copyright and platform terms.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <Logo iconSize={22} textSize="text-sm" />
            <span>—</span>
            <span>Permitted Online Media Processing</span>
          </div>

          <nav className="flex items-center gap-4 text-xs">
            <Link href="/" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              Home
            </Link>
            <Link href="/youtube" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              YouTube
            </Link>
            <Link href="/youtube-to-mp3" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              MP3
            </Link>
            <Link href="/instagram" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
              Instagram
            </Link>
          </nav>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-200/60 dark:border-neutral-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-neutral-400 dark:text-neutral-500">
          <p>© {new Date().getFullYear()} MediaFetch. Fast, secure, server-side processing.</p>
          <p>Zero third-party trackers or telemetry.</p>
        </div>
      </div>
    </footer>
  );
}
