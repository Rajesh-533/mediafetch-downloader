import MediaFetcher from '@/components/MediaFetcher';

export const metadata = {
  title: 'YouTube Video Downloader — MediaFetch',
  description:
    'Download public YouTube videos in true HD, 1080p, 1440p, or 4K with audio merged cleanly via FFmpeg.',
};

export default function YouTubePage() {
  return (
    <div className="py-10 sm:py-16 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          YouTube Video Downloader
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
          Download permitted public YouTube videos in true resolutions up to 4K without fake upscaling.
        </p>
      </div>

      <MediaFetcher
        initialMode="video"
        platformConstraint="youtube"
        placeholder="Paste YouTube video or shorts link here..."
      />

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
            Genuine Resolutions
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
            Select from 360p, 480p, 720p HD, 1080p Full HD, 1440p 2K, and 2160p 4K based on the actual uploaded video.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
            FFmpeg Stream Merging
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
            YouTube delivers high resolutions as separate streams. MediaFetch automatically merges audio and video into clean MP4 files.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
            Public Content Only
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
            Works with publicly viewable regular videos and YouTube Shorts. Does not bypass private videos requiring account login.
          </p>
        </div>
      </div>
    </div>
  );
}
