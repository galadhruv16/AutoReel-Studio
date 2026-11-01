'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  FileText,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Play,
  Pause,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Film,
  Sliders,
  Clock,
  Mic,
  Tag,
  Hash,
  ExternalLink,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { VOICES, StudioScene } from '../../types/studio';
import { generateSrtContent, generateVideoChapters } from '../../utils/srt';

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
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isGeneratingKit, setIsGeneratingKit] = useState<boolean>(false);
  const [publishingKit, setPublishingKit] = useState<AllPlatformsKit | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Pick suitable base video asset based on project topic
  const lowerTopic = (project.topic || '').toLowerCase();
  const videoSrc = lowerTopic.includes('crispr') || lowerTopic.includes('gene') || lowerTopic.includes('dna') || lowerTopic.includes('biology')
    ? '/videos/reel_genetics.mp4'
    : lowerTopic.includes('saraighat') || lowerTopic.includes('war') || lowerTopic.includes('history') || lowerTopic.includes('battle')
    ? '/videos/reel_saraighat.mp4'
    : '/videos/reel_kubernetes.mp4';

  const posterSrc = videoSrc.replace('.mp4', '.png').replace('/videos/reel_', '/videos/poster_');
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

  // Video play/pause toggle
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch((e) => console.warn(e));
    }
  };

  // Safe file slug generator
  const getTopicSlug = () => {
    const raw = (project.topic || 'AutoReel').trim().toLowerCase();
    const slug = raw.replace(/[^a-z0-9]+/g, '_').slice(0, 32);
    return slug || 'autoreel_video';
  };

  // Instant MP4 Download
  const handleDownloadVideo = () => {
    const link = document.createElement('a');
    link.href = videoSrc;
    link.download = `${getTopicSlug()}_1080p.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          {/* Vertical Reel Viewport Card */}
          <div className="relative w-full max-w-[310px] aspect-[9/16] rounded-3xl overflow-hidden border-2 border-[#232634] bg-[#000000] shadow-2xl shadow-black/80 flex flex-col justify-between group">
            {/* Top Reel Overlay */}
            <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-3.5 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md px-2.5 py-1 text-[11px] font-mono text-emerald-300 border border-emerald-500/30">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>RENDER MASTER</span>
              </div>
              <span className="rounded-full bg-[#14161F]/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono text-[#FF4F00] border border-[#FF4F00]/30">
                1080×1920 • 60FPS
              </span>
            </div>

            {/* Video Element */}
            <video
              ref={videoRef}
              src={videoSrc}
              poster={posterSrc}
              playsInline
              loop
              onClick={handlePlayPause}
              className="w-full h-full object-cover cursor-pointer"
            />

            {/* Overlay Play Trigger on Pause */}
            {!isPlaying && (
              <button
                type="button"
                onClick={handlePlayPause}
                className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition group-hover:bg-black/30"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF4F00] text-white shadow-xl shadow-[#FF4F00]/40 transition transform group-hover:scale-105 active:scale-95">
                  <Play className="h-7 w-7 translate-x-0.5" />
                </div>
              </button>
            )}

            {/* Bottom Duration Tag */}
            <div className="absolute bottom-3.5 left-3.5 right-3.5 z-30 flex items-center justify-between pointer-events-none text-xs font-mono text-white/90 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
              <span className="truncate max-w-[180px]">{project.topic || 'AutoReel Video'}</span>
              <span className="text-[#FF4F00] font-bold">{totalDuration.toFixed(1)}s</span>
            </div>
          </div>

          {/* Primary & Secondary Download Actions */}
          <div className="w-full max-w-[310px] mt-4 space-y-2.5">
            {/* Primary: 1080p MP4 Video */}
            <button
              type="button"
              onClick={handleDownloadVideo}
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#FF4F00] py-3.5 px-4 text-sm font-bold text-white shadow-xl shadow-[#FF4F00]/30 hover:bg-[#FF3B00] transition active:scale-95 cursor-pointer"
            >
              <Download className="h-4 w-4 stroke-[2.5]" />
              <span>Download MP4 Video (1080p 60FPS)</span>
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
