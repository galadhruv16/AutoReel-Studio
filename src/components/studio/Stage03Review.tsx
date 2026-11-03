'use client';

import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ArrowRight,
  ArrowLeft,
  Layers,
  Clock,
  Mic,
  Zap,
  CheckCircle2,
  Sliders,
  Type,
  RefreshCw,
  FastForward,
  Rewind,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { StudioScene, VOICES } from '../../types/studio';
import { RemotionStudioPlayer, RemotionStudioPlayerHandle } from './RemotionStudioPlayer';

export const Stage03Review: React.FC = () => {
  const { project, setStage, updateProject } = useStudio();

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(project.duration || 60);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number>(0);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthSuccess, setSynthSuccess] = useState<string | null>(null);
  const [voiceVolume, setVoiceVolume] = useState<number>(100);
  const [ambientVolume, setAmbientVolume] = useState<number>(25);

  const playerHandleRef = useRef<RemotionStudioPlayerHandle | null>(null);
  const sceneAudioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up any preview audio on unmount
  React.useEffect(() => {
    return () => {
      if (sceneAudioRef.current) {
        sceneAudioRef.current.pause();
        sceneAudioRef.current = null;
      }
    };
  }, []);

  // Master video asset (only populated when an actual MP4 render has been compiled)
  const videoSrc = project.videoUrl || undefined;
  const posterSrc = project.videoUrl ? project.videoUrl.replace('.mp4', '.png') : undefined;
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

  const selectedScene = scenes[selectedSceneIndex] || scenes[0];
  const totalDuration = scenes.reduce((acc, s) => acc + s.duration, 0) || project.duration;

  // Automatic Background Neural Voiceover Synthesis for all scenes
  React.useEffect(() => {
    let isCancelled = false;
    const unvoicedScenes = scenes.filter((s) => !s.audioUrl && s.narration);
    if (unvoicedScenes.length === 0) return;

    setIsSynthesizing(true);
    setSynthSuccess(`Synthesizing neural voice for ${unvoicedScenes.length} scenes...`);

    const synthesizeBatch = async () => {
      const updatedScenes = [...scenes];
      let synthCount = 0;

      const promises = updatedScenes.map(async (sc, i) => {
        if (!sc.audioUrl && sc.narration) {
          try {
            const res = await fetch('/api/studio/synthesize-scene', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: sc.narration,
                voice: project.voice,
                sceneIndex: sc.index,
                rate: '+12%',
              }),
            });
            const data = await res.json();
            if (data.success && data.data?.audioUrl) {
              const actualDur = data.data.duration;
              const sceneDur = Number((actualDur + 0.35).toFixed(2));
              updatedScenes[i] = {
                ...updatedScenes[i],
                audioUrl: data.data.audioUrl,
                audioDuration: actualDur,
                duration: Math.max(sceneDur, updatedScenes[i].duration || 3.0),
              };
              synthCount++;
            }
          } catch (err) {
            console.warn(`Failed to synthesize scene ${sc.index}`, err);
          }
        }
      });

      await Promise.all(promises);

      if (!isCancelled && synthCount > 0) {
        let curTime = 0;
        const reindexed = updatedScenes.map((s, idx) => {
          const dur = s.duration;
          const start = Number(curTime.toFixed(2));
          curTime += dur;
          const end = Number(curTime.toFixed(2));
          return {
            ...s,
            index: idx + 1,
            startTime: start,
            endTime: end,
            duration: dur,
          };
        });
        updateProject({ scenes: reindexed });
        setSynthSuccess(`All ${synthCount} scenes synchronized with neural voice.`);
      }
      if (!isCancelled) {
        setIsSynthesizing(false);
      }
    };

    synthesizeBatch();

    return () => {
      isCancelled = true;
    };
  }, [project.voice, scenes.length]);

  // Video time tracking
  const handleTimeUpdate = (cur: number) => {
    setCurrentTime(cur);

    // Sync active scene index based on playback time
    const activeIdx = scenes.findIndex((s) => cur >= s.startTime && cur < s.endTime);
    if (activeIdx !== -1 && activeIdx !== selectedSceneIndex) {
      setSelectedSceneIndex(activeIdx);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      playerHandleRef.current?.pause();
      setIsPlaying(false);
    } else {
      playerHandleRef.current?.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (newTime: number) => {
    const clamped = Math.max(0, Math.min(totalDuration, newTime));
    playerHandleRef.current?.seek(clamped);
    setCurrentTime(clamped);
  };

  const handleJumpToScene = (index: number) => {
    setSelectedSceneIndex(index);
    const targetScene = scenes[index];
    if (targetScene) {
      playerHandleRef.current?.seek(targetScene.startTime);
      setCurrentTime(targetScene.startTime);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    playerHandleRef.current?.setPlaybackRate(speed);
  };

  const handleToggleMute = () => {
    if (playerHandleRef.current) {
      const nextMuted = playerHandleRef.current.toggleMute();
      setIsMuted(nextMuted);
    } else {
      setIsMuted(!isMuted);
    }
  };

  const handleVoiceVolumeChange = (vol: number) => {
    setVoiceVolume(vol);
    playerHandleRef.current?.setVolume(vol / 100);
  };

  const handleUpdateSceneData = (updates: Partial<StudioScene>) => {
    const updated = [...project.scenes];
    updated[selectedSceneIndex] = {
      ...updated[selectedSceneIndex],
      ...updates,
    };
    updateProject({ scenes: updated });
  };

  // Real Edge TTS Single-Scene Re-synthesis
  const handleResynthesizeSceneVoice = async () => {
    setIsSynthesizing(true);
    setSynthSuccess(null);
    try {
      const res = await fetch('/api/studio/synthesize-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: selectedScene.narration,
          voice: project.voice,
          sceneIndex: selectedScene.index,
          rate: '+12%',
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const actualDur = data.data.duration;
        const newDur = Math.max(Number((actualDur + 0.35).toFixed(2)), 2.5);
        const updated = [...project.scenes];
        updated[selectedSceneIndex] = {
          ...updated[selectedSceneIndex],
          duration: newDur,
          audioDuration: actualDur,
          audioUrl: data.data.audioUrl,
        };

        // Re-index all scenes sequentially
        let curTime = 0;
        const reindexed = updated.map((s, idx) => {
          const dur = s.duration;
          const start = Number(curTime.toFixed(2));
          curTime += dur;
          const end = Number(curTime.toFixed(2));
          return {
            ...s,
            index: idx + 1,
            startTime: start,
            endTime: end,
            duration: dur,
          };
        });
        updateProject({ scenes: reindexed });

        setSynthSuccess(
          `Audio re-synthesized successfully (${actualDur}s)!`
        );

        // Preview the audio immediately
        if (data.data.audioUrl) {
          if (sceneAudioRef.current) {
            sceneAudioRef.current.pause();
            sceneAudioRef.current = null;
          }
          const previewAudio = new Audio(data.data.audioUrl);
          sceneAudioRef.current = previewAudio;
          previewAudio.play().catch(() => {});
        }
      }
    } catch (e: any) {
      console.warn('Synthesis error', e);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Eyebrow & Stepper Context */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#232634] bg-[#14161F] px-3 py-1 text-xs font-mono text-[#EDEDED]">
          <span className="h-2 w-2 rounded-full bg-[#FF4F00] animate-pulse" />
          <span>STAGE 03 // VIDEO REVIEW &amp; SURGICAL REVISION</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8] bg-[#14161F] px-3 py-1 rounded-full border border-[#232634]">
          <Clock className="h-3.5 w-3.5 text-[#FF4F00]" />
          <span>Duration: <strong className="text-white">{totalDuration.toFixed(1)}s</strong></span>
          <span className="text-[#64748B]">•</span>
          <span>Scenes: <strong className="text-white">{scenes.length}</strong></span>
          <span className="text-[#64748B]">•</span>
          <span>Voice: <strong className="text-white">{voiceObj.name}</strong></span>
        </div>
      </div>

      {/* Main Title */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
          Video Review &amp; Surgical Revision
        </h1>
        <p className="mt-1 text-sm sm:text-base text-[#94A3B8] max-w-2xl leading-relaxed">
          Preview your vertical reel with frame-accurate timing. Modify spoken lines, re-voice phonemes with Edge TTS, or adjust caption styling.
        </p>
      </div>

      {/* Workspace Grid (Two Columns: Video Player on Left, Surgical Inspector on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================
            LEFT COLUMN: 9:16 VERTICAL VIDEO PLAYER & TRANSPORT DECK
           ======================================================== */}
        <div className="lg:col-span-5 flex flex-col items-center">
          {/* Remotion 9:16 Vertical Studio Viewport */}
          <RemotionStudioPlayer
            ref={playerHandleRef}
            topic={project.topic}
            scenes={scenes}
            captionStyle={project.captionStyle}
            accentColor="#FF4F00"
            musicUrl={ambientVolume > 0 ? (project.musicTrack?.url || 'audio/music/ambient_tension.wav') : null}
            enableSfx={project.enableSfx !== false}
            enableMusicDucking={project.enableMusicDucking !== false}
            fallbackVideoSrc={videoSrc}
            posterSrc={posterSrc}
            onTimeUpdate={handleTimeUpdate}
            onSceneIndexChange={(idx) => setSelectedSceneIndex(idx)}
            onPlayStateChange={(playing) => setIsPlaying(playing)}
          />

          {/* Transport Controls Deck */}
          <div className="w-full max-w-[310px] mt-4 rounded-2xl border border-[#232634] bg-[#14161F] p-3.5 space-y-3">
            {/* Scrubber Progress Bar */}
            <div className="relative">
              <input
                type="range"
                min="0"
                max={totalDuration || 60}
                step="0.1"
                value={currentTime}
                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#08090A] rounded-lg appearance-none cursor-pointer accent-[#FF4F00]"
              />
            </div>

            {/* Transport Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSeek(currentTime - 5)}
                  title="Rewind 5s"
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1C1E26] transition"
                >
                  <Rewind className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={handlePlayPause}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF4F00] text-white shadow-md shadow-[#FF4F00]/25 hover:bg-[#FF3B00] transition active:scale-95"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-0.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleSeek(currentTime + 5)}
                  title="Skip 5s"
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1C1E26] transition"
                >
                  <FastForward className="h-4 w-4" />
                </button>
              </div>

              {/* Timecode Readout */}
              <span className="text-xs font-mono text-[#EDEDED]">
                {formatTime(currentTime)} / {formatTime(totalDuration)}
              </span>

              {/* Mute and Speed */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1C1E26] transition"
                >
                  {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleSpeedChange(playbackSpeed === 1.0 ? 1.2 : playbackSpeed === 1.2 ? 0.8 : 1.0)}
                  className="px-2 py-1 rounded text-[11px] font-mono text-[#FF4F00] bg-[#FF4F00]/10 border border-[#FF4F00]/30 hover:bg-[#FF4F00]/20 transition"
                >
                  {playbackSpeed}x
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Multi-Scene Timeline Ruler */}
          <div className="w-full max-w-[310px] mt-3">
            <p className="text-[11px] font-mono uppercase text-[#94A3B8] mb-1.5">
              Interactive Timeline Scenes:
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {scenes.map((s, idx) => {
                const isSelected = idx === selectedSceneIndex;
                return (
                  <button
                    key={s.id || idx}
                    type="button"
                    onClick={() => handleJumpToScene(idx)}
                    className={`py-1 px-1.5 rounded-lg text-[10px] font-mono transition text-center truncate ${
                      isSelected
                        ? 'bg-[#FF4F00] text-white shadow-sm font-semibold'
                        : 'bg-[#14161F] text-[#94A3B8] border border-[#232634] hover:text-white'
                    }`}
                  >
                    S0{idx + 1} ({s.duration.toFixed(0)}s)
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: SURGICAL REVISION INSPECTOR PANEL
           ======================================================== */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Scene Indicator Header */}
          <div className="rounded-2xl border border-[#232634] bg-[#14161F] p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#FF4F00] text-xs font-bold text-white shadow-md shadow-[#FF4F00]/25">
                {selectedScene.index}
              </span>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Editing Scene {selectedScene.index}</span>
                  <span className="text-xs font-mono text-[#94A3B8]">
                    ({selectedScene.startTime.toFixed(1)}s – {selectedScene.endTime.toFixed(1)}s)
                  </span>
                </h3>
                <span className="text-[11px] text-[#94A3B8] font-mono uppercase">
                  Archetype: {selectedScene.visualType.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Jump Scene Dropdown */}
            <select
              value={selectedSceneIndex}
              onChange={(e) => handleJumpToScene(parseInt(e.target.value, 10))}
              className="rounded-xl border border-[#232634] bg-[#08090A] px-3 py-1.5 text-xs text-[#EDEDED] focus:border-[#FF4F00] focus:outline-none transition"
            >
              {scenes.map((s, idx) => (
                <option key={s.id || idx} value={idx}>
                  Scene 0{idx + 1} ({s.duration.toFixed(1)}s)
                </option>
              ))}
            </select>
          </div>

          {/* Control Card 1: Narration Script & Edge TTS Resynthesis */}
          <div className="rounded-2xl border border-[#232634] bg-[#14161F] p-5 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#EDEDED] flex items-center gap-2">
                <Mic className="h-3.5 w-3.5 text-[#FF4F00]" />
                <span>Scene Narration &amp; Speech Synthesis</span>
              </label>
              <span className="text-[11px] font-mono text-[#94A3B8]">
                Voice: {voiceObj.name} (Edge TTS)
              </span>
            </div>

            <textarea
              rows={3}
              value={selectedScene.narration}
              onChange={(e) => handleUpdateSceneData({ narration: e.target.value })}
              className="w-full rounded-xl border border-[#232634] bg-[#08090A] px-4 py-3 text-sm text-[#EDEDED] font-medium leading-relaxed focus:border-[#FF4F00] focus:outline-none focus:ring-1 focus:ring-[#FF4F00] transition"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <p className="text-xs text-[#94A3B8]">
                Editing script adjusts phrase timing. Re-synthesize to refresh audio waveform.
              </p>

              <button
                type="button"
                onClick={handleResynthesizeSceneVoice}
                disabled={isSynthesizing || !selectedScene.narration.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C1E26] border border-[#FF4F00]/50 px-4 py-2 text-xs font-semibold text-white hover:bg-[#232634] hover:border-[#FF4F00] transition active:scale-95 disabled:opacity-50 shadow-sm"
              >
                <Zap className={`h-3.5 w-3.5 text-[#FF4F00] ${isSynthesizing ? 'animate-bounce' : ''}`} />
                <span>{isSynthesizing ? 'Synthesizing Audio...' : '⚡ Re-synthesize Voice (Edge TTS)'}</span>
              </button>
            </div>

            {synthSuccess && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{synthSuccess}</span>
              </div>
            )}
          </div>

          {/* Control Card 2: Visual Composition & Motion Direction */}
          <div className="rounded-2xl border border-[#232634] bg-[#14161F] p-5 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#EDEDED] flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-[#FF4F00]" />
                <span>Visual Composition &amp; Micro-Animation</span>
              </label>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-[#94A3B8] font-mono block mb-1">
                  Artistic Visual Prompt
                </label>
                <input
                  type="text"
                  value={selectedScene.visualDirection}
                  onChange={(e) => handleUpdateSceneData({ visualDirection: e.target.value })}
                  className="w-full rounded-xl border border-[#232634] bg-[#08090A] px-4 py-2.5 text-xs sm:text-sm text-[#EDEDED] focus:border-[#FF4F00] focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#94A3B8] font-mono block mb-1">
                    Motion Archetype
                  </label>
                  <select
                    value={selectedScene.visualType}
                    onChange={(e) => handleUpdateSceneData({ visualType: e.target.value as any })}
                    className="w-full rounded-xl border border-[#232634] bg-[#08090A] px-3.5 py-2 text-xs text-[#EDEDED] focus:border-[#FF4F00] focus:outline-none transition"
                  >
                    <option value="kinetic_text">Kinetic Typography</option>
                    <option value="vector_schematic">Vector Schematic</option>
                    <option value="crosshair_target">Crosshair Target</option>
                    <option value="split_comparison">Split Comparison</option>
                    <option value="process_flow">Process Flow</option>
                    <option value="dynamic_chart">Dynamic Metric Chart</option>
                    <option value="timeline">Chronological Timeline</option>
                    <option value="step_sequence">Step Sequence Takeaways</option>
                    <option value="code_terminal">Code & Terminal Explainer</option>
                    <option value="investigative_dossier">Investigative Dossier & Paper</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateSceneData({
                        visualDirection: `Regenerated cinematic motion: High-focus dynamic sequence for ${selectedScene.visualType.replace('_', ' ')}.`,
                      });
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#232634] bg-[#08090A] px-4 py-2 text-xs font-medium text-[#EDEDED] hover:bg-[#1C1E26] hover:border-[#3D445C] transition active:scale-95"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-[#FF4F00]" />
                    <span>Regenerate Visual</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Control Card 3: Subtitle Styling Presets */}
          <div className="rounded-2xl border border-[#232634] bg-[#14161F] p-5 space-y-3 shadow-xl">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#EDEDED] flex items-center gap-2">
              <Type className="h-3.5 w-3.5 text-[#FF4F00]" />
              <span>Subtitle Staging &amp; Caption Style</span>
            </label>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'kinetic', label: 'Kinetic Highlight', desc: 'Word-by-word yellow glow pop' },
                { id: 'minimal', label: 'Clean Minimal', desc: 'Subtle white bottom subtitle' },
                { id: 'bold', label: 'Editorial Bold', desc: 'Centered high-contrast block' },
              ].map((style) => {
                const isSelected = project.captionStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => updateProject({ captionStyle: style.id as any })}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition text-center ${
                      isSelected
                        ? 'border-[#FF4F00] bg-[#FF4F00]/10 text-white shadow-md shadow-[#FF4F00]/20'
                        : 'border-[#232634] bg-[#08090A] text-[#94A3B8] hover:border-[#3D445C] hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-bold">{style.label}</span>
                    <span className="text-[10px] text-[#94A3B8] mt-1 leading-tight">
                      {style.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Control Card 4: Audio Mixer & Pacing */}
          <div className="rounded-2xl border border-[#232634] bg-[#14161F] p-5 space-y-3.5 shadow-xl">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#EDEDED] flex items-center gap-2">
              <Sliders className="h-3.5 w-3.5 text-[#FF4F00]" />
              <span>Audio Levels &amp; Pacing</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#94A3B8]">Voiceover Volume</span>
                  <span className="font-mono text-white">{voiceVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={voiceVolume}
                  onChange={(e) => handleVoiceVolumeChange(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-[#08090A] rounded-lg appearance-none cursor-pointer accent-[#FF4F00]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#94A3B8]">Ambient Sub-Bed</span>
                  <span className="font-mono text-white">{ambientVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ambientVolume}
                  onChange={(e) => setAmbientVolume(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-[#08090A] rounded-lg appearance-none cursor-pointer accent-[#FF4F00]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Dock */}
      <div className="mt-10 rounded-2xl border border-[#232634] bg-[#0F1015] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setStage(2)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#232634] bg-[#14161F] px-5 py-3 text-xs font-medium text-[#EDEDED] hover:bg-[#1C1E26] transition active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 text-[#FF4F00]" />
          <span>← Back to Storyboard</span>
        </button>

        <div className="w-full sm:w-auto flex items-center justify-end">
          <button
            type="button"
            onClick={() => setStage(4)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF4F00] px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-[#FF4F00]/25 transition hover:bg-[#FF3B00] active:scale-95 cursor-pointer"
          >
            <span>Approve &amp; Go to Export</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
