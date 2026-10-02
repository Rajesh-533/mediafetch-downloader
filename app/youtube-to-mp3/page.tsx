import MediaFetcher from '@/components/MediaFetcher';

export const metadata = {
  title: 'YouTube to MP3 Converter — MediaFetch',
  description:
    'Convert permitted YouTube videos to MP3 audio files with true source bitrate and FFmpeg encoding.',
};

export default function YouTubeToMp3Page() {
  return (
    <div className="py-10 sm:py-16 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          YouTube to MP3 Converter
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
          Extract audio from permitted public YouTube videos into MP3 files at true source bitrates.
        </p>
      </div>

      <MediaFetcher
        initialMode="mp3"
        platformConstraint="youtube"
        placeholder="Paste YouTube link to convert to MP3..."
      />

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
            True Source Bitrate
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
            We extract the highest quality audio stream available from the source and encode it honestly without artificial padding or bitrate distortion.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
            Lossless FFmpeg LAME
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
            Processed via the industry-standard LAME MP3 codec configured for optimal Variable Bitrate (VBR) preserving acoustic dynamics.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
            Universal Compatibility
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
            Resulting MP3 files are compatible with every smartphone, audio player, car stereo, and desktop operating system.
          </p>
        </div>
      </div>
    </div>
  );
}
