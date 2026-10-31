'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Aperture,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Download,
  FileJson,
  CheckCircle2,
  Layers,
  Cpu,
  Clock,
  Palette,
  Mic,
  Subtitles,
  Plus,
  Trash2,
  LogOut,
  ShieldCheck,
  Film,
  ExternalLink,
} from 'lucide-react';
import { StoryboardScene } from '../api/studio/generate-storyboard/route';

// Preset configurations
interface PresetOption {
  id: 'genetics' | 'kubernetes' | 'saraighat' | 'custom';
  title: string;
  category: string;
  accentColor: string;
  defaultVoice: string;
  defaultStyle: 'editorial' | 'karaoke';
  description: string;
  defaultTopic: string;
}

const PRESETS: PresetOption[] = [
  {
    id: 'genetics',
    title: 'Mendel Pea Cross (9:3:3:1)',
    category: 'Biology & Genetics',
    accentColor: '#10B981',
    defaultVoice: 'en-US-JennyNeural',
    defaultStyle: 'karaoke',
    description: 'Chromosome vectors, 16-cell Punnett combinatorics, and phenotypic ratio explosion.',
    defaultTopic: 'Gregor Mendel dihybrid pea plant cross and the discovery of independent assortment',
  },
  {
    id: 'kubernetes',
    title: 'The Kubernetes Container Lie',
    category: 'Cloud Architecture',
    accentColor: '#00F0FF',
    defaultVoice: 'en-US-BrianMultilingualNeural',
    defaultStyle: 'editorial',
    description: 'Linux cgroups, PID namespaces, and why Pods wrap containers with a zero-latency bridge.',
    defaultTopic: 'Why containers do not actually exist and how Kubernetes Pods wrap Linux cgroups & namespaces',
  },
  {
    id: 'saraighat',
    title: 'Battle of Saraighat 1671',
    category: 'Military Strategy',
    accentColor: '#F59E0B',
    defaultVoice: 'en-US-AndrewMultilingualNeural',
    defaultStyle: 'editorial',
    description: 'Brahmaputra 1km river gorge choke point, 4,000 Mughal galleys, and agile Bachari rivercraft.',
    defaultTopic: 'Lachit Borphukan naval defense at the Battle of Saraighat against the 4,000-vessel Mughal armada',
  },
  {
    id: 'custom',
    title: 'Custom Technical Concept',
    category: 'AI-Generated Storyboard',
    accentColor: '#8B5CF6',
    defaultVoice: 'en-US-BrianMultilingualNeural',
    defaultStyle: 'editorial',
    description: 'Provide any complex topic or technical architecture; Gemini Flash will draft the visual storyboard.',
    defaultTopic: 'How Redis in-memory cache handles sub-millisecond key-value lookups with asynchronous disk snapshots',
  },
];

const VOICES = [
  {
    id: 'en-US-BrianMultilingualNeural',
    name: 'Brian Multilingual',
    role: 'Deep, authoritative technical narrator',
    gender: 'Male',
    previewAudio: '/audio/reel_kubernetes.mp3',
  },
  {
    id: 'en-US-JennyNeural',
    name: 'Jenny Neural',
    role: 'Energetic, crisp documentary narrator',
    gender: 'Female',
    previewAudio: '/audio/reel_genetics.mp3',
  },
  {
    id: 'en-US-AndrewMultilingualNeural',
    name: 'Andrew Multilingual',
    role: 'Measured, analytical engineering voice',
    gender: 'Male',
    previewAudio: '/audio/reel_saraighat.mp3',
  },
  {
    id: 'en-US-SoniaNeural',
    name: 'Sonia Neural',
    role: 'Crisp, sophisticated editorial delivery',
    gender: 'Female',
    previewAudio: '/audio/spike_test.mp3',
  },
];

const PALETTES = [
  { name: 'Cyber Cyan', color: '#00F0FF' },
  { name: 'Bio Emerald', color: '#10B981' },
  { name: 'Imperial Brass', color: '#F59E0B' },
  { name: 'Neon Crimson', color: '#E11D48' },
  { name: 'Monolith Violet', color: '#8B5CF6' },
];

export default function StudioPage() {
  const router = useRouter();

  // Authentication & User State
  const [userEmail, setUserEmail] = useState<string>('galadhruv1611@gmail.com');
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Stepper State: 1 | 2 | 3
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Config
  const [selectedPreset, setSelectedPreset] = useState<PresetOption['id']>('kubernetes');
  const [topic, setTopic] = useState<string>(PRESETS[1].defaultTopic);
  const [targetDuration, setTargetDuration] = useState<30 | 45 | 60>(30);
  const [accentColor, setAccentColor] = useState<string>('#00F0FF');
  const [selectedVoice, setSelectedVoice] = useState<string>('en-US-BrianMultilingualNeural');
  const [captionStyle, setCaptionStyle] = useState<'editorial' | 'karaoke'>('editorial');

  // Voice Preview Audio
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);

  // Step 2: Storyboard Timeline
  const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState<boolean>(false);
  const [scenes, setScenes] = useState<StoryboardScene[]>([]);

  // Step 3: Generation & Player
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<number>(0);
  const [renderStage, setRenderStage] = useState<string>('');
  const [renderedReel, setRenderedReel] = useState<{
    videoUrl: string;
    posterUrl: string;
    audioUrl: string;
    totalDurationSec: number;
    telemetry: any[];
  } | null>(null);

  // Video Player Controls
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(30);
  const [showSafeZone, setShowSafeZone] = useState<boolean>(false);

  // Check auth session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.email) {
            setUserEmail(data.email);
          }
        } else {
          router.push('/login?redirect=%2Fstudio');
        }
      } catch {
        router.push('/login?redirect=%2Fstudio');
      } finally {
        setIsAuthChecking(false);
      }
    }
    checkAuth();
  }, [router]);

  // Handle Preset Select
  const handleSelectPreset = (preset: PresetOption) => {
    setSelectedPreset(preset.id);
    setTopic(preset.defaultTopic);
    setAccentColor(preset.accentColor);
    setSelectedVoice(preset.defaultVoice);
    setCaptionStyle(preset.defaultStyle);
  };

  // Voice Preview toggle
  const toggleVoicePreview = (voiceId: string, audioUrl: string) => {
    if (playingVoiceId === voiceId) {
      voiceAudioRef.current?.pause();
      setPlayingVoiceId(null);
    } else {
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      voiceAudioRef.current = audio;
      audio.onended = () => setPlayingVoiceId(null);
      audio.play().catch(() => {});
      setPlayingVoiceId(voiceId);
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/login');
    }
  };

  // Step 1 -> Step 2: Generate Storyboard
  const handleGenerateStoryboard = async () => {
    setIsGeneratingStoryboard(true);
    try {
      const res = await fetch('/api/studio/generate-storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presetId: selectedPreset,
          topic: topic.trim(),
          durationSec: targetDuration,
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.scenes) {
        setScenes(data.data.scenes);
        setCurrentStep(2);
      } else {
        alert(data.error || 'Failed to generate storyboard. Please try again.');
      }
    } catch (err: any) {
      alert(err.message || 'Error communicating with studio storyboard service.');
    } finally {
      setIsGeneratingStoryboard(false);
    }
  };

  // Scene editing in Step 2
  const handleUpdateScene = (index: number, updatedFields: Partial<StoryboardScene>) => {
    setScenes((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updatedFields };
      return copy;
    });
  };

  const handleAddScene = () => {
    const newScene: StoryboardScene = {
      id: scenes.length + 1,
      title: `Scene 0${scenes.length + 1} Point`,
      badge: `// STEP ${scenes.length + 1}`,
      durationSec: 5.5,
      archetype: 'pipeline',
      headline: 'Next Core Technical Principle',
      subheadline: 'Supporting functional details',
      calloutPoints: ['Key Metric', 'Core Invariant', 'Production Rule'],
      narration: 'And this crucial mechanism ensures complete system consistency and zero latency.',
    };
    setScenes([...scenes, newScene]);
  };

  const handleDeleteScene = (index: number) => {
    if (scenes.length <= 2) {
      alert('A reel requires at least 2 scenes.');
      return;
    }
    setScenes((prev) => prev.filter((_, i) => i !== index));
  };

  // Step 2 -> Step 3: Trigger Video Generation
  const handleGenerateVideo = async () => {
    setCurrentStep(3);
    setIsRendering(true);
    setRenderProgress(10);
    setRenderStage('Synthesizing Microsoft Edge Neural TTS audio...');

    try {
      // Simulate realistic telemetry progression
      const t1 = setTimeout(() => {
        setRenderProgress(35);
        setRenderStage('Extracting word-level millisecond timestamps...');
      }, 700);

      const t2 = setTimeout(() => {
        setRenderProgress(65);
        setRenderStage('Compiling SVG vector motion archetypes...');
      }, 1400);

      const t3 = setTimeout(() => {
        setRenderProgress(85);
        setRenderStage('Bundling Remotion composition @ 1080x1920 (30fps)...');
      }, 2100);

      const res = await fetch('/api/studio/render-reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presetId: selectedPreset,
          topic: topic.trim(),
          voice: selectedVoice,
          captionStyle,
          accentColor,
          scenes,
        }),
      });

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);

      const data = await res.json();
      if (data.success && data.data) {
        setRenderProgress(100);
        setRenderStage('Reel generation complete!');
        setRenderedReel(data.data);
      } else {
        alert(data.error || 'Failed to render reel');
      }
    } catch (err: any) {
      alert(err.message || 'Error during reel rendering.');
    } finally {
      setTimeout(() => {
        setIsRendering(false);
      }, 400);
    }
  };

  // Video playback listeners
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const restartVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {});
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 30);
    }
  };

  const handleDownloadJSON = () => {
    if (!renderedReel) return;
    const payload = {
      project: 'AutoReel Studio',
      topic,
      voice: selectedVoice,
      captionStyle,
      accentColor,
      totalDurationSec: renderedReel.totalDurationSec,
      scenes,
      generatedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storyboard_${selectedPreset}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#08090A] flex flex-col items-center justify-center text-white">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF4F00] animate-pulse">
          <Aperture className="h-6 w-6 text-white" />
        </div>
        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-[#94A3B8]">
          Verifying Insider Session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090A] text-[#EDEDED] font-sans antialiased selection:bg-[#FF4F00]/20 selection:text-[#FF4F00]">
      {/* ========================================================
          STUDIO TOP NAVIGATION BAR
         ======================================================== */}
      <header className="sticky top-0 z-50 w-full border-b border-[#1C1E26] bg-[#08090A]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-3 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF4F00] text-white shadow-lg shadow-[#FF4F00]/25 transition group-hover:scale-105">
                <Aperture className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  AutoReel <span className="text-[#94A3B8] font-medium">Studio</span>
                </span>
                <span className="text-[10px] font-mono text-[#FF4F00] tracking-wider uppercase">
                  Creation Suite v2.0
                </span>
              </div>
            </a>
          </div>

          {/* Stepper Progress Indicator */}
          <div className="hidden md:flex items-center gap-2 bg-[#10121A] border border-[#1F2333] rounded-full px-3 py-1 text-xs font-mono">
            <button
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition ${
                currentStep === 1
                  ? 'bg-[#FF4F00] text-white font-semibold shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <span>01</span>
              <span>Concept & Style</span>
            </button>
            <span className="text-[#33384B]">→</span>
            <button
              onClick={() => scenes.length > 0 && setCurrentStep(2)}
              disabled={scenes.length === 0}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition ${
                currentStep === 2
                  ? 'bg-[#FF4F00] text-white font-semibold shadow-sm'
                  : scenes.length > 0
                  ? 'text-[#94A3B8] hover:text-white'
                  : 'text-[#444A61] cursor-not-allowed'
              }`}
            >
              <span>02</span>
              <span>Storyboard Timeline</span>
            </button>
            <span className="text-[#33384B]">→</span>
            <button
              onClick={() => renderedReel && setCurrentStep(3)}
              disabled={!renderedReel}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition ${
                currentStep === 3
                  ? 'bg-[#FF4F00] text-white font-semibold shadow-sm'
                  : renderedReel
                  ? 'text-[#94A3B8] hover:text-white'
                  : 'text-[#444A61] cursor-not-allowed'
              }`}
            >
              <span>03</span>
              <span>Video & Player</span>
            </button>
          </div>

          {/* User Email & Sign Out */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="max-w-[140px] truncate">{userEmail}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#262B3D] bg-[#11131C] px-3 py-1.5 text-xs font-medium text-[#94A3B8] hover:bg-[#1A1D2B] hover:text-white transition"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5 text-[#FF4F00]" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* ========================================================
            STEP 1: CONCEPT & CONFIGURATION
           ======================================================== */}
        {currentStep === 1 && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            {/* Header info */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FF4F00]/30 bg-[#FF4F00]/10 px-3 py-1 text-xs font-mono text-[#FF4F00] mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                <span>STEP 01 // ARCHITECT YOUR REEL</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Concept, Voice & Visual Direction
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#94A3B8]">
                Select a high-impact starter archetype or write a custom topic. The Gemini Flash AI director will compile a scene-by-scene kinetic storyboard.
              </p>
            </div>

            {/* 1-Click Starter Presets */}
            <div className="space-y-3">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center justify-between">
                <span>1-Click Starter Presets</span>
                <span className="text-[#FF4F00] font-normal">Deterministic Showcase Compositions</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {PRESETS.map((preset) => {
                  const isSelected = selectedPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`relative text-left p-4 rounded-xl border transition-all duration-200 ${
                        isSelected
                          ? 'border-[#FF4F00] bg-[#171A24] shadow-lg shadow-[#FF4F00]/10 ring-1 ring-[#FF4F00]'
                          : 'border-[#1E2230] bg-[#0E1017] hover:border-[#2D3349] hover:bg-[#131620]'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span
                          className="inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: `${preset.accentColor}20`,
                            color: preset.accentColor,
                            border: `1px solid ${preset.accentColor}40`,
                          }}
                        >
                          {preset.category}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-[#FF4F00] shrink-0" />
                        )}
                      </div>
                      <h3 className="mt-2 text-sm sm:text-base font-bold text-white">
                        {preset.title}
                      </h3>
                      <p className="mt-1 text-xs text-[#94A3B8] leading-relaxed line-clamp-2">
                        {preset.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Topic Input Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#94A3B8]">
                Explainer Topic & Architectural Brief
              </label>
              <textarea
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  if (selectedPreset !== 'custom') {
                    setSelectedPreset('custom');
                  }
                }}
                rows={3}
                placeholder="E.g., Explain how Redis handles in-memory key-value caching with asynchronous disk snapshots..."
                className="w-full rounded-xl border border-[#222738] bg-[#0D0F16] px-4 py-3 text-sm text-white placeholder-[#525B75] focus:border-[#FF4F00] focus:outline-none focus:ring-1 focus:ring-[#FF4F00] transition"
              />
            </div>

            {/* Config Grid: Duration, Color, Caption Style */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              {/* Target Duration */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#FF4F00]" />
                  Target Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[30, 45, 60].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setTargetDuration(sec as any)}
                      className={`py-2 text-xs font-mono rounded-lg border transition ${
                        targetDuration === sec
                          ? 'border-[#FF4F00] bg-[#FF4F00]/15 text-[#FF4F00] font-bold'
                          : 'border-[#222738] bg-[#0D0F16] text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Accent Theme */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-[#FF4F00]" />
                  Vector Accent
                </label>
                <div className="flex items-center gap-2.5 pt-1">
                  {PALETTES.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setAccentColor(p.color)}
                      style={{ backgroundColor: p.color }}
                      className={`h-7 w-7 rounded-full transition-transform ${
                        accentColor === p.color
                          ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#08090A]'
                          : 'opacity-70 hover:opacity-100 hover:scale-110'
                      }`}
                      title={p.name}
                    />
                  ))}
                </div>
              </div>

              {/* Caption Kinetic Style */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                  <Subtitles className="h-3.5 w-3.5 text-[#FF4F00]" />
                  Caption Motion
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCaptionStyle('editorial')}
                    className={`py-2 px-2 text-xs font-mono rounded-lg border transition ${
                      captionStyle === 'editorial'
                        ? 'border-[#FF4F00] bg-[#FF4F00]/15 text-[#FF4F00] font-bold'
                        : 'border-[#222738] bg-[#0D0F16] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    Vox Editorial
                  </button>
                  <button
                    type="button"
                    onClick={() => setCaptionStyle('karaoke')}
                    className={`py-2 px-2 text-xs font-mono rounded-lg border transition ${
                      captionStyle === 'karaoke'
                        ? 'border-[#FF4F00] bg-[#FF4F00]/15 text-[#FF4F00] font-bold'
                        : 'border-[#222738] bg-[#0D0F16] text-[#94A3B8] hover:text-white'
                    }`}
                  >
                    Opus Karaoke
                  </button>
                </div>
              </div>
            </div>

            {/* Neural Voiceover Selector */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mic className="h-3.5 w-3.5 text-[#FF4F00]" />
                  Microsoft Edge Neural Voice ($0.00 Cost)
                </span>
                <span className="text-[#10B981] font-normal">Click play to audition audio sample</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {VOICES.map((v) => {
                  const isSelected = selectedVoice === v.id;
                  const isAudioPlaying = playingVoiceId === v.id;

                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVoice(v.id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? 'border-[#FF4F00] bg-[#161924] shadow-sm'
                          : 'border-[#1E2230] bg-[#0D0F16] hover:border-[#2C3247]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            isSelected ? 'bg-[#FF4F00] text-white' : 'bg-[#1C2030] text-[#94A3B8]'
                          }`}
                        >
                          <Mic className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{v.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1D2132] text-[#94A3B8]">
                              {v.gender}
                            </span>
                          </div>
                          <p className="text-xs text-[#94A3B8] mt-0.5">{v.role}</p>
                        </div>
                      </div>

                      {/* Audition Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVoicePreview(v.id, v.previewAudio);
                        }}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                          isAudioPlaying
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 animate-pulse'
                            : 'border-[#2D334A] bg-[#141722] text-[#94A3B8] hover:text-white hover:border-[#3D4563]'
                        }`}
                        title="Audition voice"
                      >
                        {isAudioPlaying ? (
                          <Pause className="h-3.5 w-3.5" />
                        ) : (
                          <Play className="h-3.5 w-3.5 ml-0.5" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next Action Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleGenerateStoryboard}
                disabled={isGeneratingStoryboard || !topic.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#FF4F00] px-8 py-4 text-base font-semibold text-white shadow-xl shadow-[#FF4F00]/30 transition hover:bg-[#FF3B00] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingStoryboard ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Compiling Storyboard with Gemini Flash...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Storyboard Timeline</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 2: STORYBOARD TIMELINE
           ======================================================== */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header with metrics */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1E2230] pb-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#FF4F00]/30 bg-[#FF4F00]/10 px-3 py-1 text-xs font-mono text-[#FF4F00] mb-2">
                  <Layers className="h-3.5 w-3.5" />
                  <span>STEP 02 // VISUAL TIMELINE DIRECTOR</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Storyboard Scene Timeline
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-[#94A3B8]">
                  Review, edit, or customize scene headlines, visual archetypes, and voiceover scripts before generating.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#222738] bg-[#0E1017] px-4 py-2.5 text-xs font-medium text-[#94A3B8] hover:bg-[#161924] hover:text-white transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Edit Setup
                </button>
                <button
                  type="button"
                  onClick={handleAddScene}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#222738] bg-[#0E1017] px-4 py-2.5 text-xs font-medium text-[#94A3B8] hover:bg-[#161924] hover:text-white transition"
                >
                  <Plus className="h-4 w-4 text-[#FF4F00]" />
                  Add Scene
                </button>
                <button
                  type="button"
                  onClick={handleGenerateVideo}
                  disabled={isRendering || scenes.length === 0}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FF4F00] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#FF4F00]/25 transition hover:bg-[#FF3B00] active:scale-95 disabled:opacity-50"
                >
                  <Film className="h-4 w-4" />
                  Generate Video 🎬
                </button>
              </div>
            </div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl border border-[#1E2230] bg-[#0D0F16]">
              <div>
                <span className="text-[11px] font-mono text-[#94A3B8] uppercase">Total Duration</span>
                <p className="text-xl font-bold font-mono text-white mt-0.5">
                  {scenes.reduce((acc, s) => acc + (s.durationSec || 6), 0).toFixed(1)}s
                </p>
              </div>
              <div>
                <span className="text-[11px] font-mono text-[#94A3B8] uppercase">Scene Count</span>
                <p className="text-xl font-bold font-mono text-white mt-0.5">
                  {scenes.length} Scenes
                </p>
              </div>
              <div>
                <span className="text-[11px] font-mono text-[#94A3B8] uppercase">Voiceover Words</span>
                <p className="text-xl font-bold font-mono text-white mt-0.5">
                  {scenes.reduce((acc, s) => acc + s.narration.split(' ').length, 0)} Words
                </p>
              </div>
              <div>
                <span className="text-[11px] font-mono text-[#94A3B8] uppercase">Pacing Retention</span>
                <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                  155 WPM (Optimal)
                </p>
              </div>
            </div>

            {/* Editable Scene Cards */}
            <div className="space-y-4">
              {scenes.map((scene, idx) => (
                <div
                  key={scene.id || idx}
                  className="p-5 rounded-2xl border border-[#1E2230] bg-[#0E1017] hover:border-[#2D3349] transition space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF4F00]/15 text-xs font-mono font-bold text-[#FF4F00] border border-[#FF4F00]/30">
                        0{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={scene.title}
                        onChange={(e) => handleUpdateScene(idx, { title: e.target.value })}
                        className="text-base font-bold text-white bg-transparent border-b border-transparent hover:border-[#2D3349] focus:border-[#FF4F00] focus:outline-none transition"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Archetype Selector */}
                      <select
                        value={scene.archetype}
                        onChange={(e) => handleUpdateScene(idx, { archetype: e.target.value as any })}
                        className="rounded-lg border border-[#222738] bg-[#121520] px-2.5 py-1 text-xs font-mono text-[#94A3B8] focus:border-[#FF4F00] focus:outline-none"
                      >
                        <option value="hook">Hook Archetype</option>
                        <option value="anatomy">Anatomy Archetype</option>
                        <option value="pipeline">Pipeline Archetype</option>
                        <option value="telemetry">Telemetry Archetype</option>
                        <option value="matrix">Matrix Archetype</option>
                      </select>

                      {/* Duration Pill */}
                      <div className="flex items-center gap-1 text-xs font-mono text-[#94A3B8] bg-[#121520] px-2.5 py-1 rounded-lg border border-[#222738]">
                        <span>{scene.durationSec}s</span>
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteScene(idx)}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-red-400 hover:bg-red-500/10 transition"
                        title="Delete Scene"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Headline & Subheadline Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-mono uppercase text-[#94A3B8]">
                        Kinetic Vector Headline
                      </label>
                      <input
                        type="text"
                        value={scene.headline}
                        onChange={(e) => handleUpdateScene(idx, { headline: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-[#222738] bg-[#121520] px-3 py-2 text-sm text-white focus:border-[#FF4F00] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono uppercase text-[#94A3B8]">
                        Supporting Technical Subtitle
                      </label>
                      <input
                        type="text"
                        value={scene.subheadline}
                        onChange={(e) => handleUpdateScene(idx, { subheadline: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-[#222738] bg-[#121520] px-3 py-2 text-sm text-[#94A3B8] focus:border-[#FF4F00] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Narration Script */}
                  <div>
                    <label className="text-[11px] font-mono uppercase text-[#94A3B8] flex items-center justify-between">
                      <span>Neural Voiceover Narration Script</span>
                      <span className="text-[#FF4F00]">{scene.narration.split(' ').length} words</span>
                    </label>
                    <textarea
                      value={scene.narration}
                      onChange={(e) => handleUpdateScene(idx, { narration: e.target.value })}
                      rows={2}
                      className="mt-1 w-full rounded-lg border border-[#222738] bg-[#121520] px-3 py-2 text-sm text-white focus:border-[#FF4F00] focus:outline-none"
                    />
                  </div>

                  {/* Callout Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-mono text-[#525B75]">Key Callouts:</span>
                    {scene.calloutPoints.map((pt, pIdx) => (
                      <span
                        key={pIdx}
                        className="inline-flex items-center gap-1 rounded-md border border-[#262B3D] bg-[#141722] px-2 py-0.5 text-xs font-mono text-[#94A3B8]"
                      >
                        {pt}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Generate Action */}
            <div className="pt-4 flex justify-between items-center border-t border-[#1E2230]">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-2 text-xs font-mono text-[#94A3B8] hover:text-white transition"
              >
                <ArrowLeft className="h-4 w-4" />
                Change Topic or Presets
              </button>

              <button
                type="button"
                onClick={handleGenerateVideo}
                disabled={isRendering || scenes.length === 0}
                className="inline-flex items-center gap-2.5 rounded-xl bg-[#FF4F00] px-8 py-4 text-base font-semibold text-white shadow-xl shadow-[#FF4F00]/30 transition hover:bg-[#FF3B00] active:scale-95 disabled:opacity-50"
              >
                <Film className="h-5 w-5" />
                <span>Launch Video Generation Pipeline</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 3: GENERATION ENGINE & VIDEO PLAYER
           ======================================================== */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2230] pb-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-400 mb-2">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>STEP 03 // REMOTION COMPILER & PLAYER</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Deterministic Reel Output
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-[#94A3B8]">
                  Rendered at 1080x1920 (9:16 vertical) with zero stock video fluff and synchronized progressive motion.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#222738] bg-[#0E1017] px-4 py-2.5 text-xs font-medium text-[#94A3B8] hover:bg-[#161924] hover:text-white transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Storyboard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    setRenderedReel(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#222738] bg-[#0E1017] px-4 py-2.5 text-xs font-medium text-[#94A3B8] hover:bg-[#161924] hover:text-white transition"
                >
                  <RotateCcw className="h-4 w-4 text-[#FF4F00]" />
                  Create Another Reel
                </button>
              </div>
            </div>

            {/* Rendering Progress Telemetry Overlay (if rendering) */}
            {isRendering && (
              <div className="p-6 rounded-2xl border border-[#FF4F00]/30 bg-[#12141D] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#FF4F00] border-t-transparent" />
                    <span className="text-sm font-mono font-bold text-white">
                      AUTOREEL REMOTION PIPELINE EXECUTING
                    </span>
                  </div>
                  <span className="text-sm font-mono text-[#FF4F00] font-bold">
                    {renderProgress}%
                  </span>
                </div>

                <div className="w-full bg-[#1C2030] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#FF4F00] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${renderProgress}%` }}
                  />
                </div>

                <p className="text-xs font-mono text-[#94A3B8]">
                  &gt; {renderStage}
                </p>
              </div>
            )}

            {/* Player & Scene Inspector Grid */}
            {renderedReel && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: 9:16 Vertical Phone Reel Player (5 cols) */}
                <div className="lg:col-span-5 flex flex-col items-center">
                  <div className="relative w-[300px] xs:w-[320px] sm:w-[340px] aspect-[9/16] rounded-[36px] p-3 bg-gradient-to-b from-[#252836] to-[#12141C] shadow-2xl shadow-black/80 border border-[#2D3142]">
                    {/* Dynamic Phone Speaker & Notch */}
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#0A0B10] rounded-full z-30 flex items-center justify-center">
                      <div className="w-8 h-1 bg-[#202433] rounded-full" />
                    </div>

                    {/* Safe Zone Overlay */}
                    {showSafeZone && (
                      <div className="absolute inset-3 rounded-[28px] pointer-events-none z-20 border border-dashed border-red-500/60 p-4 flex flex-col justify-between">
                        <div className="text-[10px] font-mono text-red-400 bg-black/60 px-2 py-0.5 rounded self-start">
                          Top Nav (140px safe zone)
                        </div>
                        <div className="text-[10px] font-mono text-red-400 bg-black/60 px-2 py-0.5 rounded self-end">
                          Right UI / Captions (380px safe zone)
                        </div>
                      </div>
                    )}

                    {/* Video Screen */}
                    <div className="relative w-full h-full rounded-[28px] overflow-hidden bg-black flex items-center justify-center">
                      <video
                        ref={videoRef}
                        src={renderedReel.videoUrl}
                        poster={renderedReel.posterUrl}
                        playsInline
                        loop
                        onTimeUpdate={handleTimeUpdate}
                        className="w-full h-full object-cover"
                        onClick={togglePlayPause}
                      />

                      {/* Play/Pause Center Overlay */}
                      {!isPlaying && (
                        <button
                          type="button"
                          onClick={togglePlayPause}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition hover:bg-black/30"
                        >
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF4F00] text-white shadow-xl shadow-[#FF4F00]/50 transition transform hover:scale-110">
                            <Play className="h-7 w-7 ml-1 fill-white" />
                          </div>
                        </button>
                      )}

                      {/* Bottom Floating Scrubber Bar */}
                      <div className="absolute bottom-3 inset-x-3 bg-[#0C0E14]/85 backdrop-blur-md rounded-xl p-2.5 flex items-center justify-between z-30 border border-[#1E2230]">
                        <button
                          type="button"
                          onClick={togglePlayPause}
                          className="p-1 text-white hover:text-[#FF4F00] transition"
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </button>

                        {/* Scrubber Line */}
                        <div className="flex-1 mx-3 flex items-center">
                          <input
                            type="range"
                            min={0}
                            max={duration || 30}
                            step={0.1}
                            value={currentTime}
                            onChange={(e) => {
                              const newTime = parseFloat(e.target.value);
                              if (videoRef.current) {
                                videoRef.current.currentTime = newTime;
                                setCurrentTime(newTime);
                              }
                            }}
                            className="w-full h-1 bg-[#222738] rounded-lg appearance-none cursor-pointer accent-[#FF4F00]"
                          />
                        </div>

                        <span className="text-[10px] font-mono text-[#94A3B8]">
                          {currentTime.toFixed(0)}s / {renderedReel.totalDurationSec}s
                        </span>

                        <button
                          type="button"
                          onClick={toggleMute}
                          className="p-1 ml-2 text-white hover:text-[#FF4F00] transition"
                        >
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Player Quick Toggles */}
                  <div className="flex items-center gap-3 mt-4 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setShowSafeZone(!showSafeZone)}
                      className={`px-3 py-1.5 rounded-lg border transition ${
                        showSafeZone
                          ? 'border-red-500 bg-red-500/15 text-red-400 font-bold'
                          : 'border-[#222738] bg-[#0E1017] text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      Safe Zone Overlay: {showSafeZone ? 'ON' : 'OFF'}
                    </button>
                    <button
                      type="button"
                      onClick={restartVideo}
                      className="px-3 py-1.5 rounded-lg border border-[#222738] bg-[#0E1017] text-[#94A3B8] hover:text-white transition flex items-center gap-1.5"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Restart
                    </button>
                  </div>
                </div>

                {/* Right: Technical Telemetry & Storyboard Breakdown (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Download & Export Card */}
                  <div className="p-5 rounded-2xl border border-[#1E2230] bg-[#0E1017] space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
                        Production Assets Ready
                      </span>
                      <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        1080x1920 (30 FPS)
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href={renderedReel.videoUrl}
                        download={`autoreel_${selectedPreset}.mp4`}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#FF4F00] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF4F00]/25 transition hover:bg-[#FF3B00] active:scale-95"
                      >
                        <Download className="h-4 w-4" />
                        Download 1080x1920 MP4
                      </a>
                      <button
                        type="button"
                        onClick={handleDownloadJSON}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#262B3D] bg-[#121520] px-5 py-3 text-sm font-medium text-[#EDEDED] hover:bg-[#1A1E2C] transition"
                      >
                        <FileJson className="h-4 w-4 text-[#FF4F00]" />
                        Export Storyboard JSON
                      </button>
                    </div>
                  </div>

                  {/* Render Telemetry Log */}
                  <div className="p-5 rounded-2xl border border-[#1E2230] bg-[#0E1017] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                        <Cpu className="h-3.5 w-3.5 text-[#FF4F00]" />
                        Compilation Telemetry
                      </span>
                      <span className="text-[10px] font-mono text-[#525B75]">
                        DETERMINISTIC VECTOR GRAPHICS
                      </span>
                    </div>

                    <div className="space-y-2 font-mono text-xs">
                      {renderedReel.telemetry?.map((log: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-2 rounded-lg bg-[#121520] border border-[#1C2030]"
                        >
                          <span className="text-emerald-400 font-bold shrink-0">[{log.status}]</span>
                          <span className="text-white font-semibold shrink-0">{log.step}:</span>
                          <span className="text-[#94A3B8] break-all">{log.detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Storyboard Scenes List */}
                  <div className="space-y-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8]">
                      Scene-by-Scene Breakdown
                    </span>
                    <div className="space-y-2.5">
                      {scenes.map((scene, idx) => (
                        <div
                          key={scene.id || idx}
                          className="p-3.5 rounded-xl border border-[#1C2030] bg-[#0E1017] flex items-start justify-between gap-4"
                        >
                          <div className="flex items-start gap-3">
                            <span className="flex h-6 w-6 items-center justify-center rounded bg-[#FF4F00]/15 text-xs font-mono font-bold text-[#FF4F00]">
                              0{idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-white">{scene.title}</h4>
                                <span className="text-[10px] font-mono text-[#94A3B8] bg-[#141722] px-1.5 py-0.5 rounded">
                                  {scene.archetype.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-xs text-[#94A3B8] mt-1 italic">
                                &quot;{scene.narration}&quot;
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-mono text-[#94A3B8] shrink-0">
                            {scene.durationSec}s
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
