'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  FileText,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Tag,
  Hash,
  Volume2,
  AlertTriangle,
  FileCode,
  PackageCheck,
  Loader2,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { VOICES, StudioScene } from '../../types/studio';
import { generateSrtContent, generateVideoChapters } from '../../utils/srt';
import { RemotionStudioPlayer } from './RemotionStudioPlayer';
import {
  getTopicSlug,
  downloadFileFromUrl,
  downloadSubtitlesSrt,
  downloadVoiceoverMp3,
  downloadStoryboardJson,
  requestReelRender,
} from '../../utils/exportAssets';

type PlatformKey = 'youtube' | 'instagram' | 'tiktok' | 'linkedin';

interface PlatformContent {
  title: string;
  description: string;
  hashtags: string[];
}

interface AllPlatformsKit {
  youtube: PlatformContent;
  instagram: PlatformContent;
  tiktok: PlatformContent;
  linkedin: PlatformContent;
}

export const Stage04Publish: React.FC = () => {
  const { project, setStage, resetProject, updateProject } = useStudio();

  const [activePlatform, setActivePlatform] = useState<PlatformKey>('youtube');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isGeneratingKit, setIsGeneratingKit] = useState<boolean>(false);
  const [publishingKit, setPublishingKit] = useState<AllPlatformsKit | null>(null);
  const [isRenderingDynamic, setIsRenderingDynamic] = useState<boolean>(false);
  const [dynamicVideoUrl, setDynamicVideoUrl] = useState<string | null>(project.videoUrl || null);
  const [renderStatus, setRenderStatus] = useState<string>('');
  const [renderElapsed, setRenderElapsed] = useState<number>(0);
  const [showServerlessNotice, setShowServerlessNotice] = useState<boolean>(false);
  const [audioSuccess, setAudioSuccess] = useState<boolean>(false);
  const [srtSuccess, setSrtSuccess] = useState<boolean>(false);
  const [jsonSuccess, setJsonSuccess] = useState<boolean>(false);
  const [isBatchDownloading, setIsBatchDownloading] = useState<boolean>(false);

  // Track render elapsed time
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRenderingDynamic) {
      setRenderElapsed(0);
      timer = setInterval(() => {
        setRenderElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRenderingDynamic]);

  // Keep video URL synced
  useEffect(() => {
    if (project.videoUrl && !dynamicVideoUrl) {
      setDynamicVideoUrl(project.videoUrl);
    }
  }, [project.videoUrl, dynamicVideoUrl]);

  const videoSrc = dynamicVideoUrl || project.videoUrl || undefined;
  const posterSrc = videoSrc ? videoSrc.replace('.mp4', '.png') : undefined;
  const voiceObj = VOICES.find((v) => v.id === project.voice) || VOICES[0];

  const scenes = project.scenes.length > 0 ? project.scenes : [
    {
      id: 'default_1',
      index: 1,
      startTime: 0,
      endTime: 3.5,
      duration: 3.5,
      narration: project.topic || 'Exploring core concepts with dynamic motion graphics.',
      visualDirection: 'Kinetic bold typography punch with rapid zoom-in.',
      visualType: 'kinetic_text' as const,
      highlightWords: ['core concepts', 'motion graphics'],
    },
  ];

  const totalDuration = scenes.reduce((acc, s) => acc + s.duration, 0) || project.duration;
  const totalWords = scenes.reduce((acc, s) => acc + s.narration.trim().split(/\s+/).filter(Boolean).length, 0);

  // Generate or fetch publishing copy
  useEffect(() => {
    let isMounted = true;

    async function loadPublishingKit() {
      setIsGeneratingKit(true);
      try {
        const res = await fetch('/api/studio/generate-publishing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: project.topic,
            scenes: project.scenes,
            duration: totalDuration,
            tone: project.tone,
          }),
        });

        const json = await res.json();
        if (isMounted && json.success && json.data) {
          setPublishingKit(json.data);
        }
      } catch (err) {
        console.warn('Failed to fetch publishing kit, using fallback:', err);
      } finally {
        if (isMounted) setIsGeneratingKit(false);
      }
    }

    loadPublishingKit();

    return () => {
      isMounted = false;
    };
  }, [project.topic, project.scenes, totalDuration, project.tone]);

  // Compile Dynamic MP4 via Remotion Server
  const handleRenderDynamicMp4 = async (andDownload: boolean = false) => {
    if (isRenderingDynamic) return;
    setIsRenderingDynamic(true);
    setShowServerlessNotice(false);
    setRenderStatus('Initializing Remotion 1080×1920 canvas...');

    setTimeout(() => setRenderStatus('Rendering 60FPS video frames via Remotion...'), 3000);

    try {
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
        setDynamicVideoUrl(result.videoUrl);
        updateProject({ videoUrl: result.videoUrl });
        setRenderStatus('Custom MP4 Master Ready (1080p 60FPS)');
        if (andDownload) {
          await downloadFileFromUrl(result.videoUrl, `${getTopicSlug(project.topic)}_1080p.mp4`);
        }
      } else {
        setShowServerlessNotice(true);
        setRenderStatus('Export via Local Host Ready');
      }
    } catch (err) {
      console.warn('Render request error:', err);
      setShowServerlessNotice(true);
      setRenderStatus('Export via Local Host Ready');
    } finally {
      setIsRenderingDynamic(false);
    }
  };

  // Download MP4 Video - renders custom Remotion 1080p MP4 if not already compiled, then downloads
  const handleDownloadVideo = async () => {
    if (!dynamicVideoUrl) {
      await handleRenderDynamicMp4(true);
      return;
    }
    await downloadFileFromUrl(dynamicVideoUrl, `${getTopicSlug(project.topic)}_1080p.mp4`);
  };

  // Download Full Spoken Voiceover MP3 (merges all scene MP3 segments)
  const handleDownloadAudio = async () => {
    const res = await downloadVoiceoverMp3(scenes, project.topic);
    if (res.success) {
      setAudioSuccess(true);
      setTimeout(() => setAudioSuccess(false), 3000);
    } else {
      alert(res.error || 'Voiceover audio is not yet generated. Visit Stage 03 to synthesize scenes.');
    }
  };

  // Instant SRT Subtitles Download
  const handleDownloadSrt = () => {
    downloadSubtitlesSrt(scenes, project.topic);
    setSrtSuccess(true);
    setTimeout(() => setSrtSuccess(false), 3000);
  };

  // Storyboard JSON Download
  const handleDownloadJson = () => {
    downloadStoryboardJson(project, publishingKit);
    setJsonSuccess(true);
    setTimeout(() => setJsonSuccess(false), 3000);
  };

  // Download All Assets Batch
  const handleDownloadAll = async () => {
    setIsBatchDownloading(true);
    try {
      handleDownloadSrt();
      await new Promise((r) => setTimeout(r, 600));

      handleDownloadJson();
      await new Promise((r) => setTimeout(r, 600));

      const voicedScenes = scenes.filter((s) => s.audioUrl);
      if (voicedScenes.length > 0) {
        await handleDownloadAudio();
        await new Promise((r) => setTimeout(r, 600));
      }

      if (dynamicVideoUrl) {
        await downloadFileFromUrl(dynamicVideoUrl, `${getTopicSlug(project.topic)}_1080p.mp4`);
      }
    } finally {
      setIsBatchDownloading(false);
    }
  };

  // Copy to clipboard helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  // Active platform kit data fallback
  const currentKit: PlatformContent = publishingKit?.[activePlatform] || {
    title: `${project.topic || 'Explainer'} in ${totalDuration.toFixed(0)}s`,
    description: `Full breakdown of ${project.topic || 'the topic'}.\n\nCHAPTERS:\n${generateVideoChapters(scenes)}\n\nFollow for more daily explainers!`,
    hashtags: ['#Education', '#Explainer', '#VisualLearning', '#AutoReel'],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Eyebrow & Stepper Context */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>STAGE 04 // PUBLISHING &amp; MULTI-PLATFORM EXPORT</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8] bg-[#14161F] px-3 py-1 rounded-full border border-[#232634]">
          <Clock className="h-3.5 w-3.5 text-[#FF4F00]" />
          <span>Final Runtime: <strong className="text-white">{totalDuration.toFixed(1)}s</strong></span>
          <span className="text-[#64748B]">•</span>
          <span>Scenes: <strong className="text-white">{scenes.length}</strong></span>
          <span className="text-[#64748B]">•</span>
          <span>Resolution: <strong className="text-white">1080×1920 (9:16)</strong></span>
        </div>
      </div>

      {/* Main Title */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
          Publishing &amp; Multi-Platform Export
        </h1>
        <p className="mt-1 text-sm sm:text-base text-[#94A3B8] max-w-2xl leading-relaxed">
          Your vertical reel is rendered and ready for distribution. Download the Full HD master, export synced SRT subtitles, or copy platform-optimized metadata.
        </p>
      </div>

      {/* Workspace Grid (Left Column: Video Player & Downloads, Right Column: Publishing Kit) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================
            LEFT COLUMN: FINAL 9:16 VIDEO PLAYER & DOWNLOAD ACTIONS
           ======================================================== */}
        <div className="lg:col-span-5 flex flex-col items-center">
          {/* Remotion 9:16 Vertical Master Viewport */}
          <RemotionStudioPlayer
            topic={project.topic}
            scenes={scenes}
            captionStyle={project.captionStyle}
            accentColor="#FF4F00"
            fallbackVideoSrc={dynamicVideoUrl || videoSrc}
            posterSrc={posterSrc}
          />

          {/* Reel Export & Download Center */}
          <div className="w-full max-w-[320px] mt-4 space-y-3">
            {/* Primary Action Card: 1080p MP4 */}
            <div className="rounded-2xl border border-[#FF4F00]/40 bg-gradient-to-b from-[#FF4F00]/10 to-[#14161F] p-4 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#FF4F00]" />
                  <span>Master Reel (.mp4)</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FF4F00]/20 text-[#FF4F00] font-bold">
                  1080×1920 • 60FPS
                </span>
              </div>

              {dynamicVideoUrl && (
                <div className="mb-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <Check className="h-3 w-3" />
                  <span>1080p Master Compiled &amp; Ready</span>
                </div>
              )}

              {isRenderingDynamic && (
                <div className="mb-2.5 rounded-lg bg-[#08090A] border border-[#232634] p-2 text-xs font-mono text-[#EDEDED] flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 text-[#FF4F00] animate-spin" />
                    <span className="text-[11px] truncate max-w-[190px]">{renderStatus || 'Compiling MP4...'}</span>
                  </div>
                  <span className="text-[#FF4F00] text-[11px] font-bold">{renderElapsed}s</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleDownloadVideo}
                disabled={isRenderingDynamic}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF4F00] py-3 px-4 text-xs font-bold text-white shadow-xl shadow-[#FF4F00]/30 hover:bg-[#FF3B00] transition active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isRenderingDynamic ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Rendering ({renderElapsed}s)...</span>
                  </>
                ) : dynamicVideoUrl ? (
                  <>
                    <Download className="h-4 w-4 stroke-[2.5]" />
                    <span>Download 1080p Master MP4</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 stroke-[2.5]" />
                    <span>Render &amp; Download 1080p MP4</span>
                  </>
                )}
              </button>

              {!dynamicVideoUrl && !isRenderingDynamic && (
                <button
                  type="button"
                  onClick={() => handleRenderDynamicMp4(false)}
                  className="w-full mt-2 text-center text-[10px] font-mono text-[#94A3B8] hover:text-white transition cursor-pointer"
                >
                  Or compile in background without downloading
                </button>
              )}
            </div>

            {/* Media Asset Quick Downloads */}
            <div className="grid grid-cols-1 gap-2">
              {/* Spoken Voiceover Narration (.MP3) */}
              <button
                type="button"
                onClick={handleDownloadAudio}
                className="w-full inline-flex items-center justify-between rounded-xl border border-[#232634] bg-[#14161F] p-2.5 px-3.5 text-xs text-left hover:bg-[#1C1E26] hover:border-emerald-500/40 transition active:scale-95 cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white block leading-tight">Spoken Voiceover (.mp3)</span>
                    <span className="text-[10px] text-[#94A3B8] font-mono">{voiceObj.name} • {scenes.filter((s) => s.audioUrl).length}/{scenes.length} Scenes</span>
                  </div>
                </div>
                {audioSuccess ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Download className="h-4 w-4 text-[#94A3B8] group-hover:text-emerald-400 transition" />
                )}
              </button>

              {/* Subtitles (.SRT) */}
              <button
                type="button"
                onClick={handleDownloadSrt}
                className="w-full inline-flex items-center justify-between rounded-xl border border-[#232634] bg-[#14161F] p-2.5 px-3.5 text-xs text-left hover:bg-[#1C1E26] hover:border-cyan-500/40 transition active:scale-95 cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white block leading-tight">Subtitles (.srt)</span>
                    <span className="text-[10px] text-[#94A3B8] font-mono">Word-accurate SubRip captions</span>
                  </div>
                </div>
                {srtSuccess ? (
                  <Check className="h-4 w-4 text-cyan-400" />
                ) : (
                  <Download className="h-4 w-4 text-[#94A3B8] group-hover:text-cyan-400 transition" />
                )}
              </button>

              {/* Storyboard JSON */}
              <button
                type="button"
                onClick={handleDownloadJson}
                className="w-full inline-flex items-center justify-between rounded-xl border border-[#232634] bg-[#14161F] p-2.5 px-3.5 text-xs text-left hover:bg-[#1C1E26] hover:border-amber-500/40 transition active:scale-95 cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white block leading-tight">Storyboard &amp; Metadata (.json)</span>
                    <span className="text-[10px] text-[#94A3B8] font-mono">Full prompt &amp; multi-platform kit</span>
                  </div>
                </div>
                {jsonSuccess ? (
                  <Check className="h-4 w-4 text-amber-400" />
                ) : (
                  <Download className="h-4 w-4 text-[#94A3B8] group-hover:text-amber-400 transition" />
                )}
              </button>

              {/* Download All Available Bundle */}
              <button
                type="button"
                onClick={handleDownloadAll}
                disabled={isBatchDownloading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#232634] bg-[#1A1D27] p-2.5 px-3 text-xs font-mono font-semibold text-[#EDEDED] hover:bg-[#252938] hover:text-white transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <PackageCheck className="h-3.5 w-3.5 text-[#FF4F00]" />
                <span>{isBatchDownloading ? 'Downloading All Assets...' : 'Download Complete Asset Bundle'}</span>
              </button>
            </div>

            {/* Cloud Serverless Notice */}
            {showServerlessNotice && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>Cloud Serverless Render Notice</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#CBD5E1]">
                  Your vertical reel is running at full 60FPS on the live canvas. Serverless cloud functions cannot run headless Chromium. To render physical 1080p MP4 files, launch AutoReel locally (<code className="text-[#FF4F00] font-mono">npm run dev</code>). Your full voiceover (.mp3), subtitles (.srt), and storyboard (.json) are ready to download above!
                </p>
              </div>
            )}

            {/* Video Metadata Technical Specs Card */}
            <div className="rounded-2xl border border-[#232634] bg-[#14161F] p-4 text-xs space-y-2">
              <span className="text-[10px] font-mono uppercase text-[#94A3B8] block mb-2 font-semibold">
                Asset Technical Specifications:
              </span>

              <div className="flex justify-between items-center py-1 border-b border-[#232634]/50">
                <span className="text-[#94A3B8]">Resolution</span>
                <span className="font-mono text-white font-medium">1080 × 1920 (9:16)</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#232634]/50">
                <span className="text-[#94A3B8]">Frame Rate</span>
                <span className="font-mono text-white font-medium">60.0 FPS</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#232634]/50">
                <span className="text-[#94A3B8]">Encoding</span>
                <span className="font-mono text-white font-medium">H.264 / AAC 48kHz</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-[#232634]/50">
                <span className="text-[#94A3B8]">Speech Synthesis</span>
                <span className="font-mono text-white font-medium">{voiceObj.name} (Edge TTS)</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-[#94A3B8]">Word Count</span>
                <span className="font-mono text-white font-medium">{totalWords} spoken words</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: AI MULTI-PLATFORM PUBLISHING KIT
           ======================================================== */}
        <div className="lg:col-span-7 space-y-5">
          {/* Header Card with Platform Tabs */}
          <div className="rounded-2xl border border-[#232634] bg-[#14161F] p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#FF4F00]" />
                  <span>AI Multi-Platform Publishing Kit</span>
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Pre-formatted titles, timestamped descriptions, and hashtags tailored for each platform.
                </p>
              </div>

              {isGeneratingKit && (
                <span className="text-[11px] font-mono text-[#FF4F00] bg-[#FF4F00]/10 px-2.5 py-1 rounded-full border border-[#FF4F00]/30 animate-pulse">
                  Formatting AI Copy...
                </span>
              )}
            </div>

            {/* Platform Selection Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'youtube' as PlatformKey, label: 'YouTube Shorts', tag: 'Shorts' },
                { id: 'instagram' as PlatformKey, label: 'Instagram Reels', tag: 'Reels' },
                { id: 'tiktok' as PlatformKey, label: 'TikTok', tag: 'Viral' },
                { id: 'linkedin' as PlatformKey, label: 'LinkedIn', tag: 'Insight' },
              ].map((p) => {
                const isActive = activePlatform === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActivePlatform(p.id)}
                    className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-xl border text-xs font-semibold transition ${
                      isActive
                        ? 'border-[#FF4F00] bg-[#FF4F00]/15 text-white shadow-md shadow-[#FF4F00]/20'
                        : 'border-[#232634] bg-[#08090A] text-[#94A3B8] hover:border-[#3D445C] hover:text-white'
                    }`}
                  >
                    <span>{p.label}</span>
                    <span className="text-[10px] font-mono text-[#FF4F00] mt-0.5">{p.tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 1: Hook Title */}
          <div className="rounded-2xl border border-[#232634] bg-[#14161F] p-5 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#EDEDED] flex items-center gap-2">
                <Tag className="h-3.5 w-3.5 text-[#FF4F00]" />
                <span>Hook Title</span>
              </label>

              <button
                type="button"
                onClick={() => handleCopy(currentKit.title, 'title')}
                className="inline-flex items-center gap-1.5 text-xs text-[#FF4F00] hover:text-[#FF3B00] transition font-medium"
              >
                {copiedKey === 'title' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Title</span>
                  </>
                )}
              </button>
            </div>

            <div className="rounded-xl border border-[#232634] bg-[#08090A] p-3 text-sm text-white font-medium">
              {currentKit.title}
            </div>
          </div>

          {/* Section 2: Description / Caption with Chapters */}
          <div className="rounded-2xl border border-[#232634] bg-[#14161F] p-5 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#EDEDED] flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-[#FF4F00]" />
                <span>Caption &amp; Timestamped Chapters</span>
              </label>

              <button
                type="button"
                onClick={() => handleCopy(currentKit.description, 'description')}
                className="inline-flex items-center gap-1.5 text-xs text-[#FF4F00] hover:text-[#FF3B00] transition font-medium"
              >
                {copiedKey === 'description' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Description</span>
                  </>
                )}
              </button>
            </div>

            <div className="rounded-xl border border-[#232634] bg-[#08090A] p-3 text-xs sm:text-sm text-[#EDEDED] font-mono whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
              {currentKit.description}
            </div>
          </div>

          {/* Section 3: Curated Hashtags */}
          <div className="rounded-2xl border border-[#232634] bg-[#14161F] p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#EDEDED] flex items-center gap-2">
                <Hash className="h-3.5 w-3.5 text-[#FF4F00]" />
                <span>Curated Hashtags ({currentKit.hashtags?.length || 0})</span>
              </label>

              <button
                type="button"
                onClick={() => handleCopy((currentKit.hashtags || []).join(' '), 'hashtags')}
                className="inline-flex items-center gap-1.5 text-xs text-[#FF4F00] hover:text-[#FF3B00] transition font-medium"
              >
                {copiedKey === 'hashtags' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied All!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy All Tags</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {(currentKit.hashtags || []).map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleCopy(tag, `tag_${idx}`)}
                  title="Click to copy single tag"
                  className="inline-flex items-center gap-1 rounded-lg border border-[#232634] bg-[#08090A] px-2.5 py-1 text-xs font-mono text-[#94A3B8] hover:border-[#FF4F00]/50 hover:text-white transition cursor-pointer"
                >
                  <span>{tag}</span>
                  {copiedKey === `tag_${idx}` && <Check className="h-3 w-3 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* 1-Click Complete Post Copy */}
          <div className="rounded-2xl border border-[#232634] bg-[#14161F] p-4 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-white block">Copy Entire Post Bundle</span>
              <span className="text-[11px] text-[#94A3B8]">
                Copies title, full description with timestamps, and hashtags into a single ready-to-paste text block.
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                const combined = `${currentKit.title}\n\n${currentKit.description}\n\n${(currentKit.hashtags || []).join(' ')}`;
                handleCopy(combined, 'bundle');
              }}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#1C1E26] border border-[#232634] px-4 py-2 text-xs font-semibold text-white hover:bg-[#232634] hover:border-[#FF4F00]/50 transition active:scale-95"
            >
              {copiedKey === 'bundle' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Bundle Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-[#FF4F00]" />
                  <span>Copy Complete Post</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Action Dock */}
      <div className="mt-10 rounded-2xl border border-[#232634] bg-[#0F1015] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setStage(3)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#232634] bg-[#14161F] px-5 py-3 text-xs font-medium text-[#EDEDED] hover:bg-[#1C1E26] transition active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-[#FF4F00]" />
          <span>← Back to Review &amp; Edit</span>
        </button>

        <div className="w-full sm:w-auto flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              resetProject();
              setStage(1);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF4F00] px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-[#FF4F00]/25 transition hover:bg-[#FF3B00] active:scale-95 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4 stroke-[2.5]" />
            <span>+ Create Another Video</span>
          </button>
        </div>
      </div>
    </div>
  );
};
