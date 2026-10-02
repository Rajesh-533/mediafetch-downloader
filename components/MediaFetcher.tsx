'use client';

import { useState, useEffect } from 'react';
import {
  Download,
  Music,
  Video,
  Loader2,
  AlertCircle,
  Clock,
  User,
  Clipboard,
  X,
  FileVideo,
  Radio,
  Check,
} from 'lucide-react';
import type { MediaAnalysis, MediaResolution } from '@/lib/media-service';

type ProcessingState =
  | 'idle'
  | 'analyzing'
  | 'ready'
  | 'preparing'
  | 'processing'
  | 'downloading'
  | 'error';

interface MediaFetcherProps {
  initialMode?: 'universal' | 'video' | 'mp3';
  platformConstraint?: 'youtube' | 'instagram';
  title?: string;
  subtitle?: string;
  placeholder?: string;
}

export default function MediaFetcher({
  initialMode = 'universal',
  platformConstraint,
  title,
  subtitle,
  placeholder = 'Paste video link here...',
}: MediaFetcherProps) {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState<'universal' | 'video' | 'mp3'>(initialMode);
  const [state, setState] = useState<ProcessingState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mediaData, setMediaData] = useState<MediaAnalysis | null>(null);
  const [selectedHeight, setSelectedHeight] = useState<number | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setErrorMsg(null);
      }
    } catch {
      // Clipboard access denied or unsupported
    }
  };

  const handleClear = () => {
    setUrl('');
    setMediaData(null);
    setState('idle');
    setErrorMsg(null);
    setSelectedHeight(null);
  };

  const handleAnalyze = async (targetMode?: 'video' | 'mp3') => {
    if (!url.trim()) {
      setErrorMsg('Please enter a media URL.');
      return;
    }

    if (targetMode) {
      setMode(targetMode);
    }

    setErrorMsg(null);
    setState('analyzing');
    setMediaData(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to analyze URL.');
      }

      const data: MediaAnalysis = json.data;

      if (platformConstraint && data.platform !== platformConstraint) {
        throw new Error(`This tool only accepts ${platformConstraint === 'youtube' ? 'YouTube' : 'Instagram'} links.`);
      }

      setMediaData(data);
      if (data.resolutions && data.resolutions.length > 0) {
        setSelectedHeight(data.resolutions[0].height);
      }
      setState('ready');
    } catch (err: any) {
      setState('error');
      setErrorMsg(err.message || 'An error occurred while analyzing the link.');
    }
  };

  const triggerDownload = (downloadUrl: string) => {
    setState('preparing');
    setTimeout(() => {
      setState('processing');
    }, 1200);

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setState('downloading');
      setTimeout(() => {
        setState('ready');
      }, 3500);
    }, 2500);
  };

  const handleDownloadVideo = () => {
    if (!mediaData) return;
    const downloadEndpoint = `/api/download?url=${encodeURIComponent(url.trim())}${
      selectedHeight ? `&height=${selectedHeight}` : ''
    }`;
    triggerDownload(downloadEndpoint);
  };

  const handleConvertToMp3 = () => {
    if (!mediaData) return;
    const convertEndpoint = `/api/convert?url=${encodeURIComponent(url.trim())}`;
    triggerDownload(convertEndpoint);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Optional Title */}
      {title && (
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Main Minimalist Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm transition-all">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAnalyze();
          }}
          className="space-y-3"
        >
          {/* URL Input Bar */}
          <div className="relative flex items-center">
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder={placeholder}
              aria-label="Media URL input"
              className="w-full pl-3.5 sm:pl-4 pr-20 sm:pr-24 py-3 sm:py-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 focus:border-neutral-400 dark:focus:border-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 text-sm transition-all"
            />

            {/* Clear / Paste Buttons */}
            <div className="absolute right-2 flex items-center gap-1">
              {url ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePaste}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-200/60 dark:bg-neutral-800 text-[11px] font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  title="Paste from clipboard"
                >
                  <Clipboard className="w-3 h-3" />
                  <span>Paste</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons: Stacked on Mobile, Inline on Desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {initialMode === 'mp3' ? (
              <button
                type="button"
                disabled={state === 'analyzing' || state === 'preparing' || state === 'processing'}
                onClick={() => handleAnalyze('mp3')}
                className="w-full sm:col-span-2 h-11 flex items-center justify-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-white dark:text-neutral-950 font-medium text-sm transition-all disabled:opacity-50 active:scale-[0.99]"
              >
                {state === 'analyzing' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Music className="w-4 h-4" />
                    <span>Convert to MP3</span>
                  </>
                )}
              </button>
            ) : initialMode === 'video' ? (
              <button
                type="button"
                disabled={state === 'analyzing' || state === 'preparing' || state === 'processing'}
                onClick={() => handleAnalyze('video')}
                className="w-full sm:col-span-2 h-11 flex items-center justify-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-white dark:text-neutral-950 font-medium text-sm transition-all disabled:opacity-50 active:scale-[0.99]"
              >
                {state === 'analyzing' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4" />
                    <span>Download Video</span>
                  </>
                )}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={state === 'analyzing' || state === 'preparing' || state === 'processing'}
                  onClick={() => handleAnalyze('video')}
                  className="h-11 flex items-center justify-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-white dark:text-neutral-950 font-medium text-sm transition-all disabled:opacity-50 active:scale-[0.99]"
                >
                  {state === 'analyzing' && mode === 'video' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4" />
                      <span>Download Video</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={state === 'analyzing' || state === 'preparing' || state === 'processing'}
                  onClick={() => handleAnalyze('mp3')}
                  className="h-11 flex items-center justify-center gap-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 font-medium text-sm transition-all disabled:opacity-50 active:scale-[0.99] border border-neutral-200 dark:border-neutral-700"
                >
                  {state === 'analyzing' && mode === 'mp3' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Music className="w-4 h-4 text-neutral-500" />
                      <span>Convert to MP3</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </form>

        {/* Minimal Progress / Status Indicator */}
        {(state === 'analyzing' || state === 'preparing' || state === 'processing' || state === 'downloading') && (
          <div className="mt-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-2 font-medium">
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-900 dark:text-neutral-100" />
                <span>
                  {state === 'analyzing' && 'Analyzing media formats...'}
                  {state === 'preparing' && 'Preparing session...'}
                  {state === 'processing' && 'Processing media with FFmpeg...'}
                  {state === 'downloading' && 'Starting browser download...'}
                </span>
              </div>
              <span className="text-[11px] font-mono uppercase text-neutral-500 dark:text-neutral-400">
                {state}
              </span>
            </div>
            <div className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full bg-neutral-900 dark:bg-neutral-100 transition-all duration-300 ${
                  state === 'analyzing'
                    ? 'w-1/3'
                    : state === 'preparing'
                    ? 'w-2/3'
                    : state === 'processing'
                    ? 'w-5/6'
                    : 'w-full'
                }`}
              />
            </div>
          </div>
        )}

        {/* Error Alert Box */}
        {state === 'error' && errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold">Unable to process video</p>
              <p className="text-red-600 dark:text-red-400/90">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Media Results Preview */}
        {mediaData && (
          <div className="mt-5 pt-5 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
            {/* Metadata Preview: Stacked on Phone, Side-by-side on Tablet/Desktop */}
            <div className="flex flex-col sm:flex-row gap-3.5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800/80">
              {mediaData.thumbnail ? (
                <div className="relative w-full sm:w-40 aspect-video sm:aspect-auto sm:h-24 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mediaData.thumbnail}
                    alt={mediaData.title}
                    className="w-full h-full object-cover"
                  />
                  {mediaData.duration > 0 && (
                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono font-medium">
                      {mediaData.durationFormatted}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full sm:w-40 h-24 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 text-neutral-400">
                  <FileVideo className="w-6 h-6" />
                </div>
              )}

              <div className="flex flex-col justify-between space-y-1.5 flex-grow min-w-0">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {mediaData.platform}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium tracking-wide bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900">
                      {mediaData.bestResolutionLabel}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2 leading-snug">
                    {mediaData.title}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                  {mediaData.author && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-neutral-400" />
                      <span className="truncate max-w-[140px]">{mediaData.author}</span>
                    </div>
                  )}
                  {mediaData.duration > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      <span>{mediaData.durationFormatted}</span>
                    </div>
                  )}
                  {mediaData.audioBitrateKbps && (
                    <div className="flex items-center gap-1">
                      <Radio className="w-3 h-3 text-neutral-400" />
                      <span>{mediaData.audioBitrateKbps} kbps</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Video Resolution Selection */}
            {mode !== 'mp3' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    Select Resolution
                  </label>
                  <span className="text-[11px] text-neutral-400">
                    True formats only
                  </span>
                </div>

                {/* Mobile Friendly Grid: 2 columns on phones */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {mediaData.resolutions.map((res) => {
                    const isSelected = selectedHeight === res.height;
                    return (
                      <button
                        key={res.height}
                        type="button"
                        onClick={() => setSelectedHeight(res.height)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold'
                            : 'border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span>{res.label}</span>
                          {res.isBest && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 font-medium">
                              BEST
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                          MP4 {res.fps ? `• ${res.fps}fps` : ''} {res.filesizeApprox ? `• ${(res.filesizeApprox / (1024 * 1024)).toFixed(1)}MB` : ''}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Final Download Button */}
                <button
                  type="button"
                  disabled={state === 'preparing' || state === 'processing'}
                  onClick={handleDownloadVideo}
                  className="w-full h-12 mt-2 flex items-center justify-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-white dark:text-neutral-950 font-medium text-sm transition-all disabled:opacity-50 active:scale-[0.99]"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    Download Video ({selectedHeight ? `${selectedHeight}p` : 'Best Quality'})
                  </span>
                </button>
              </div>
            )}

            {/* MP3 Conversion Panel */}
            {mode === 'mp3' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    Audio Settings
                  </label>
                  <span className="text-[11px] text-neutral-400">
                    Lossless FFmpeg
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      Source Audio Track
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Original quality (~{mediaData.audioBitrateKbps || 160} kbps) without false upscaling.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-neutral-700 dark:text-neutral-300 font-medium">
                    MP3
                  </span>
                </div>

                {/* Final MP3 Download Button */}
                <button
                  type="button"
                  disabled={state === 'preparing' || state === 'processing'}
                  onClick={handleConvertToMp3}
                  className="w-full h-12 mt-2 flex items-center justify-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-white dark:text-neutral-950 font-medium text-sm transition-all disabled:opacity-50 active:scale-[0.99]"
                >
                  <Music className="w-4 h-4" />
                  <span>Convert & Download MP3</span>
                </button>
              </div>
            )}

            {/* Switch Mode on Universal Screen */}
            {initialMode === 'universal' && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500 pt-1">
                <span>Looking for {mode === 'video' ? 'audio only' : 'video'}?</span>
                <button
                  type="button"
                  onClick={() => setMode(mode === 'video' ? 'mp3' : 'video')}
                  className="text-neutral-900 dark:text-neutral-100 font-medium hover:underline"
                >
                  {mode === 'video' ? 'Switch to MP3 Converter' : 'Switch to Video Downloader'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Discreet Legal & Permitted Content Notice */}
      <p className="mt-3 text-center text-[11px] text-neutral-400 dark:text-neutral-500">
        Download only content you own or have permission to download.
      </p>
    </div>
  );
}
