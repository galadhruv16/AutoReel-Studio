'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  FileText,
  Volume2,
  FileCode,
  Sparkles,
  Check,
  X,
  AlertTriangle,
  ExternalLink,
  Layers,
  ArrowRight,
  PackageCheck,
  Loader2,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { VOICES } from '../../types/studio';
import {
  getTopicSlug,
  downloadFileFromUrl,
  downloadSubtitlesSrt,
  downloadVoiceoverMp3,
  downloadStoryboardJson,
  requestReelRender,
} from '../../utils/exportAssets';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToPublish?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onGoToPublish,
}) => {
  const { project, updateProject } = useStudio();
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderStatus, setRenderStatus] = useState<string>('');
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(project.videoUrl || null);
  const [renderElapsed, setRenderElapsed] = useState<number>(0);
  const [showServerlessNotice, setShowServerlessNotice] = useState<boolean>(false);
  const [audioSuccess, setAudioSuccess] = useState<boolean>(false);
  const [srtSuccess, setSrtSuccess] = useState<boolean>(false);
  const [jsonSuccess, setJsonSuccess] = useState<boolean>(false);
  const [isBatchDownloading, setIsBatchDownloading] = useState<boolean>(false);

  const voiceObj = VOICES.find((v) => v.id === project.voice) || VOICES[0];
  const scenes = project.scenes || [];
  const totalDuration = scenes.reduce((acc, s) => acc + (s.duration || 4), 0) || project.duration || 30;
  const voicedScenesCount = scenes.filter((s) => s.audioUrl).length;

  // Track elapsed time during rendering
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRendering) {
      setRenderElapsed(0);
      timer = setInterval(() => {
        setRenderElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRendering]);

  // Keep renderedVideoUrl in sync with project.videoUrl
  useEffect(() => {
    if (project.videoUrl) {
      setRenderedVideoUrl(project.videoUrl);
    }
  }, [project.videoUrl]);

  if (!isOpen) return null;

  // 1. Render & Download MP4 Video
  const handleRenderAndDownloadVideo = async () => {
    if (renderedVideoUrl) {
      await downloadFileFromUrl(renderedVideoUrl, `${getTopicSlug(project.topic)}_1080p.mp4`);
      return;
    }

    setIsRendering(true);
    setShowServerlessNotice(false);
    setRenderStatus('Initializing Remotion 1080×1920 canvas...');

    try {
      // Step update
      setTimeout(() => setRenderStatus('Compiling dynamic SVG vector archetypes...'), 2000);
      setTimeout(() => setRenderStatus('Rendering 60FPS video frames via Remotion...'), 5000);

      const result = await requestReelRender({
        topic: project.topic,
        voice: voiceObj.name,
        captionStyle: project.captionStyle,
        accentColor: '#FF4F00',
        scenes,
        musicUrl: project.musicTrack?.enabled !== false ? (project.musicTrack?.url || 'audio/music/ambient_tension.wav') : null,
        enableSfx: project.enableSfx !== false,
        enableMusicDucking: project.enableMusicDucking !== false,
      });

      if (result.success && result.videoUrl) {
        setRenderedVideoUrl(result.videoUrl);
        updateProject({ videoUrl: result.videoUrl });
        setRenderStatus('Finalizing MP4 file...');
        await downloadFileFromUrl(result.videoUrl, `${getTopicSlug(project.topic)}_1080p.mp4`);
      } else {
        setShowServerlessNotice(true);
      }
    } catch (err) {
      console.warn('Render failed:', err);
      setShowServerlessNotice(true);
    } finally {
      setIsRendering(false);
    }
  };

  // 2. Download Spoken Voiceover Narration (.MP3)
  const handleDownloadAudio = async () => {
    const res = await downloadVoiceoverMp3(scenes, project.topic);
    if (res.success) {
      setAudioSuccess(true);
      setTimeout(() => setAudioSuccess(false), 3000);
    } else {
      alert(res.error || 'Failed to download audio narration');
    }
  };

  // 3. Download Synchronized Subtitles (.SRT)
  const handleDownloadSrt = () => {
    downloadSubtitlesSrt(scenes, project.topic);
    setSrtSuccess(true);
    setTimeout(() => setSrtSuccess(false), 3000);
  };

  // 4. Download Storyboard JSON
  const handleDownloadJson = () => {
    downloadStoryboardJson(project);
    setJsonSuccess(true);
    setTimeout(() => setJsonSuccess(false), 3000);
  };

  // 5. Download All Available Assets (Batch)
  const handleDownloadAll = async () => {
    setIsBatchDownloading(true);
    try {
      // 1. Subtitles (instant)
      handleDownloadSrt();
      await new Promise((r) => setTimeout(r, 600));

      // 2. Storyboard JSON (instant)
      handleDownloadJson();
      await new Promise((r) => setTimeout(r, 600));

      // 3. Audio Narration (.mp3)
      if (voicedScenesCount > 0) {
        await handleDownloadAudio();
        await new Promise((r) => setTimeout(r, 600));
      }

      // 4. Video if available
      if (renderedVideoUrl) {
        await downloadFileFromUrl(renderedVideoUrl, `${getTopicSlug(project.topic)}_1080p.mp4`);
      }
    } finally {
      setIsBatchDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl border border-[#232634] bg-[#0E1017] p-6 sm:p-8 shadow-2xl text-left overflow-hidden">
        {/* Glowing Ambient Top Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-3/4 bg-gradient-to-r from-transparent via-[#FF4F00] to-transparent opacity-80" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#232634]/60 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF4F00]/30 bg-[#FF4F00]/10 px-3 py-0.5 text-[11px] font-mono text-[#FF4F00] mb-2">
              <Download className="h-3 w-3" />
              <span>EXPORT &amp; DOWNLOAD ASSETS</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Download Reel &amp; Media Assets
            </h2>
            <p className="mt-1 text-xs text-[#94A3B8]">
              Topic: <span className="font-semibold text-white">&quot;{project.topic}&quot;</span> • {scenes.length} Scenes • {totalDuration.toFixed(1)}s Runtime
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#232634] p-2 text-[#94A3B8] hover:bg-[#1A1D27] hover:text-white transition cursor-pointer"
            aria-label="Close export dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main Asset Cards Grid */}
        <div className="mt-6 space-y-3.5">
          {/* Card 1: 1080p 60FPS Video (.MP4) */}
          <div className="rounded-2xl border border-[#FF4F00]/30 bg-[#FF4F00]/5 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:border-[#FF4F00]/60">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Full HD 1080p Video (.mp4)</span>
                <span className="rounded-md bg-[#FF4F00]/20 px-2 py-0.5 text-[10px] font-mono font-bold text-[#FF4F00]">
                  1080×1920 • 60FPS
                </span>
                {renderedVideoUrl && (
                  <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Ready
                  </span>
                )}
              </div>
              <p className="text-xs text-[#94A3B8]">
                Deterministic vector graphics, dynamic kinetic captions, sound effects, and music.
              </p>
            </div>

            {renderedVideoUrl ? (
              <a
                href={`/api/studio/download?file=${encodeURIComponent(renderedVideoUrl.replace(/^\/+/,''))}&name=${encodeURIComponent(`${getTopicSlug(project.topic)}_1080p.mp4`)}`}
                download={`${getTopicSlug(project.topic)}_1080p.mp4`}
                className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-400 transition active:scale-95 cursor-pointer text-center no-underline"
              >
                <Download className="h-4 w-4 stroke-[2.5]" />
                <span>Save Master MP4</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={handleRenderAndDownloadVideo}
                disabled={isRendering}
                className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF4F00] px-5 py-3 text-xs font-bold text-white shadow-lg shadow-[#FF4F00]/25 hover:bg-[#FF3B00] transition active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isRendering ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Rendering ({renderElapsed}s)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Render &amp; Download MP4</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Active Rendering Status Display */}
          {isRendering && (
            <div className="rounded-xl border border-[#232634] bg-[#14161F] p-3 text-xs text-[#94A3B8] flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2.5">
                <div className="h-3.5 w-3.5 rounded-full border-2 border-[#FF4F00] border-t-transparent animate-spin" />
                <span className="font-mono text-white">{renderStatus || 'Compiling video frames...'}</span>
              </div>
              <span className="font-mono text-[#FF4F00]">{renderElapsed}s</span>
            </div>
          )}

          {/* Card 2: Voiceover Narration Track (.MP3) */}
          <div className="rounded-2xl border border-[#232634] bg-[#14161F] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:border-[#3D445C]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-sm text-white">Spoken Voiceover Narration (.mp3)</span>
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                  {voiceObj.name} • {voicedScenesCount}/{scenes.length} Scenes
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Merged high-fidelity voiceover track across all scenes with zero background music.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadAudio}
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl border border-[#232634] bg-[#1C1E29] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#252938] hover:border-emerald-500/40 transition active:scale-95 cursor-pointer"
            >
              {audioSuccess ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Downloaded</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 text-emerald-400" />
                  <span>Download MP3</span>
                </>
              )}
            </button>
          </div>

          {/* Card 3: Synchronized Subtitles (.SRT) */}
          <div className="rounded-2xl border border-[#232634] bg-[#14161F] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:border-[#3D445C]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-cyan-400" />
                <span className="font-bold text-sm text-white">Synchronized Subtitles (.srt)</span>
                <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono text-cyan-400">
                  SubRip Timed
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Word-accurate captions ready for YouTube Shorts, Instagram Reels, and TikTok.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadSrt}
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl border border-[#232634] bg-[#1C1E29] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#252938] hover:border-cyan-500/40 transition active:scale-95 cursor-pointer"
            >
              {srtSuccess ? (
                <>
                  <Check className="h-4 w-4 text-cyan-400" />
                  <span className="text-cyan-400">Downloaded</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 text-cyan-400" />
                  <span>Download SRT</span>
                </>
              )}
            </button>
          </div>

          {/* Card 4: Storyboard & Metadata Bundle (.JSON) */}
          <div className="rounded-2xl border border-[#232634] bg-[#14161F] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:border-[#3D445C]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-amber-400" />
                <span className="font-bold text-sm text-white">Storyboard &amp; Metadata Bundle (.json)</span>
                <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono text-amber-400">
                  JSON v2.0
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Full scene directions, keywords, audio timings, and YouTube/Instagram publishing kit copy.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl border border-[#232634] bg-[#1C1E29] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#252938] hover:border-amber-500/40 transition active:scale-95 cursor-pointer"
            >
              {jsonSuccess ? (
                <>
                  <Check className="h-4 w-4 text-amber-400" />
                  <span className="text-amber-400">Downloaded</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 text-amber-400" />
                  <span>Download JSON</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Serverless Cloud Notice if Headless Chromium is Unavailable */}
        {showServerlessNotice && (
          <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Serverless Cloud Rendering Limitation</span>
            </div>
            <p className="leading-relaxed text-[#CBD5E1]">
              Cloud serverless instances (like Vercel) cannot run headless Chromium/FFMPEG due to container isolation.
              Your full voiceover (.mp3), subtitles (.srt), and storyboard (.json) are downloaded above!
            </p>
            <div className="rounded-xl bg-[#08090A] border border-[#232634] p-2.5 font-mono text-[11px] text-[#EDEDED] flex items-center justify-between">
              <span>npx remotion render src/remotion/index.ts DynamicStoryReel output.mp4</span>
            </div>
          </div>
        )}

        {/* Modal Footer Dock */}
        <div className="mt-6 pt-5 border-t border-[#232634]/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDownloadAll}
            disabled={isBatchDownloading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#232634] bg-[#14161F] px-4 py-2.5 text-xs font-medium text-[#EDEDED] hover:bg-[#1C1E26] hover:text-white transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <PackageCheck className="h-4 w-4 text-[#FF4F00]" />
            <span>{isBatchDownloading ? 'Downloading bundle...' : 'Download All Available Assets'}</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onGoToPublish && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGoToPublish();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C1E29] hover:bg-[#252938] border border-[#232634] px-4 py-2.5 text-xs font-semibold text-white transition active:scale-95 cursor-pointer"
              >
                <span>Publishing Hub</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-[#232634] bg-[#14161F] px-4 py-2.5 text-xs font-medium text-[#94A3B8] hover:text-white transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
