import MediaFetcher from '@/components/MediaFetcher';

export const metadata = {
  title: 'Instagram Video Downloader — MediaFetch',
  description:
    'Download public Instagram Reels, videos, and post clips safely in their native quality.',
};

export default function InstagramPage() {
  return (
    <div className="py-10 sm:py-16 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Instagram Video Downloader
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
          Download publicly accessible Instagram Reels and video posts in native quality.
        </p>
      </div>

      <MediaFetcher
        initialMode="video"
        platformConstraint="instagram"
        placeholder="Paste public Instagram Reel or video link here..."
      />

      <div className="mt-8 p-3.5 rounded-xl bg-neutral-100/70 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
        <p className="font-semibold text-neutral-900 dark:text-neutral-100 mb-0.5">Public Content Only</p>
        <p className="leading-relaxed">
          MediaFetch respects platform privacy. Private accounts and stories requiring login cannot be accessed. Make sure the video is on a public profile.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
            Reels & Video Posts
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
            Paste links from Instagram Reels (`/reel/...`) or feed videos (`/p/...`) and download the original MP4 file.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
            Native Video & Audio
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
            Preserves 9:16 vertical video dimensions, crisp sound, and original frame rate without quality degradation.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
            Zero Login Required
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
            You will never be asked to log in or enter credentials. Your privacy is fully preserved.
          </p>
        </div>
      </div>
    </div>
  );
}
