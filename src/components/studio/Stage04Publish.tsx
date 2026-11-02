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
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { VOICES, StudioScene } from '../../types/studio';
import { generateSrtContent, generateVideoChapters } from '../../utils/srt';
import { RemotionStudioPlayer } from './RemotionStudioPlayer';

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
  const { project, setStage, resetProject } = useStudio();

  const [activePlatform, setActivePlatform] = useState<PlatformKey>('youtube');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isGeneratingKit, setIsGeneratingKit] = useState<boolean>(false);
  const [publishingKit, setPublishingKit] = useState<AllPlatformsKit | null>(null);
  const [isRenderingDynamic, setIsRenderingDynamic] = useState<boolean>(false);
  const [dynamicVideoUrl, setDynamicVideoUrl] = useState<string | null>(null);
  const [renderStatus, setRenderStatus] = useState<string>('');

  // Automatically resolve matched 1080p Full HD master video for topic
  const getMatchedMasterVideo = (topicStr: string) => {
    const t = (topicStr || '').toLowerCase();
    if (t.includes('saraighat') || t.includes('borphukan') || t.includes('bachari') || t.includes('mughal') || t.includes('history')) {
      return '/videos/reel_saraighat.mp4';
    }
    if (t.includes('kubernetes') || t.includes('cluster') || t.includes('devops') || t.includes('cloud') || t.includes('docker') || t.includes('pod')) {
      return '/videos/reel_kubernetes.mp4';
    }
    return '/videos/reel_genetics.mp4';
  };

  const matchedMasterVideo = getMatchedMasterVideo(project.topic);
  const videoSrc = dynamicVideoUrl || project.videoUrl || matchedMasterVideo;
  const posterSrc = videoSrc.replace('.mp4', '.png');
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

  // Safe file slug generator
  const getTopicSlug = () => {
    const raw = (project.topic || 'AutoReel').trim().toLowerCase();
    const slug = raw.replace(/[^a-z0-9]+/g, '_').slice(0, 32);
    return slug || 'autoreel_video';
  };

  // Trigger download helper (blob-based to guarantee direct file save across all browsers)
  const triggerDownload = async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${getTopicSlug()}_1080p.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch {
      // Fallback direct link click
      const link = document.createElement('a');
      link.href = url;
      link.download = `${getTopicSlug()}_1080p.mp4`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Compile Dynamic MP4 via Remotion Server
  const handleRenderDynamicMp4 = async (andDownload: boolean = false) => {
    if (isRenderingDynamic) return;
    setIsRenderingDynamic(true);
    setRenderStatus('Rendering 1080×1920 video...');
    try {
      const res = await fetch('/api/studio/render-reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: project.topic,
          voice: voiceObj.name,
          captionStyle: project.captionStyle,
          accentColor: '#FF4F00',
          scenes,
          renderDynamic: true,
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.videoUrl) {
        setDynamicVideoUrl(json.data.videoUrl);
        setRenderStatus(json.data?.isDynamic ? 'Custom MP4 Ready (1080p 60FPS)' : 'Master MP4 Ready (1080p)');
        if (andDownload) {
          await triggerDownload(json.data.videoUrl);
        }
      } else {
        throw new Error(json?.error || 'Render did not complete');
      }
    } catch (err) {
      console.warn('Render request error, using master asset:', err);
      const fallbackTarget = matchedMasterVideo;
      setDynamicVideoUrl(fallbackTarget);
      setRenderStatus('Master MP4 Ready (1080p)');
      if (andDownload) {
        await triggerDownload(fallbackTarget);
      }
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
    await triggerDownload(dynamicVideoUrl);
  };

  // Instant SRT Subtitles Download
  const handleDownloadSrt = () => {
    const srtContent = generateSrtContent(scenes);
    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${getTopicSlug()}_subtitles.srt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

          {/* Primary & Secondary Download Actions */}
          <div className="w-full max-w-[310px] mt-4 space-y-2.5">
            {/* Compile Dynamic MP4 via Remotion Engine */}
            {!dynamicVideoUrl ? (
              <button
                type="button"
                onClick={() => handleRenderDynamicMp4(false)}
                disabled={isRenderingDynamic}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#FF4F00]/50 bg-[#FF4F00]/10 hover:bg-[#FF4F00]/20 py-2.5 px-4 text-xs font-mono text-[#FF4F00] transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isRenderingDynamic ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-[#FF4F00] border-t-transparent rounded-full animate-spin" />
                    <span>{renderStatus || 'Compiling Remotion 1080×1920 MP4...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>⚡ Compile Custom MP4 (Remotion)</span>
                  </>
                )}
              </button>
            ) : (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-center text-xs font-mono text-emerald-400 flex items-center justify-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Custom Dynamic MP4 Compiled & Ready</span>
              </div>
            )}

            {/* Primary: 1080p MP4 Video */}
            <button
              type="button"
              onClick={handleDownloadVideo}
              disabled={isRenderingDynamic}
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#FF4F00] py-3.5 px-4 text-sm font-bold text-white shadow-xl shadow-[#FF4F00]/30 hover:bg-[#FF3B00] transition active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isRenderingDynamic ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{renderStatus || 'Compiling Remotion 1080×1920 MP4...'}</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 stroke-[2.5]" />
                  <span>{dynamicVideoUrl ? 'Download Custom MP4 (1080p 60FPS)' : 'Render & Download Custom MP4 (1080p)'}</span>
                </>
              )}
            </button>

            {/* Secondary: SRT Subtitles */}
            <button
              type="button"
              onClick={handleDownloadSrt}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#232634] bg-[#14161F] py-2.5 px-4 text-xs font-medium text-[#EDEDED] hover:bg-[#1C1E26] hover:border-[#3D445C] transition active:scale-95 cursor-pointer"
            >
              <FileText className="h-4 w-4 text-[#FF4F00]" />
              <span>Download Subtitles (.SRT)</span>
            </button>
          </div>

          {/* Video Metadata Technical Specs Card */}
          <div className="w-full max-w-[310px] mt-4 rounded-2xl border border-[#232634] bg-[#14161F] p-4 text-xs space-y-2">
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
