'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Plus,
  Trash2,
  Split,
  Clock,
  Layers,
  Wand2,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { StudioScene, DURATION_CONFIGS, VOICES } from '../../types/studio';

export const Stage02Storyboard: React.FC = () => {
  const {
    project,
    setStage,
    updateProject,
    setScriptMode,
    setCustomScript,
  } = useStudio();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSynthesizingVoices, setIsSynthesizingVoices] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ai_generate' | 'own_script'>(
    project.scriptMode || 'ai_generate'
  );

  const durationMeta = DURATION_CONFIGS[project.duration];
  const voiceObj = VOICES.find((v) => v.id === project.voice) || VOICES[0];

  // Auto-generate scenes if none exist yet for this topic
  useEffect(() => {
    if (project.scenes.length === 0 && !isLoading && project.topic.trim().length >= 4) {
      handleGenerateStoryboard();
    }
  }, [project.topic]);

  const handleGenerateStoryboard = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/studio/generate-storyboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: project.topic || 'Explainer Video',
          duration: project.duration,
          tone: project.tone,
          voice: project.voice,
          scriptMode: activeTab,
          customScript: activeTab === 'own_script' ? project.customScript : '',
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.scenes) {
        setSuccessMsg(
          `Synthesizing neural voices and phrase-locking ${data.data.scenes.length} beats...`
        );
        // Synchronously synthesize and calibrate exact audio durations in parallel
        const synchronizedScenes = await syncScenesAudio(data.data.scenes);
        updateProject({
          scenes: synchronizedScenes,
          scriptMode: activeTab,
        });
        const totalDur = synchronizedScenes.reduce((acc, s) => acc + s.duration, 0);
        setSuccessMsg(
          `Generated & voice-synchronized ${synchronizedScenes.length} beats for "${project.topic}" (${totalDur.toFixed(1)}s)`
        );
      } else {
        setError(data.error || 'Failed to generate storyboard.');
      }
    } catch (e: any) {
      setError(e.message || 'Network error while contacting storyboard generator.');
    } finally {
      setIsLoading(false);
    }
  };

  const syncScenesAudio = async (inputScenes: StudioScene[]): Promise<StudioScene[]> => {
    setIsSynthesizingVoices(true);
    try {
      const updatedScenes = [...inputScenes];
      const synthesisPromises = updatedScenes.map(async (sc, i) => {
        if (!sc.narration) return;
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
            // Pad 350ms so voiceover has natural acoustic release and zero cutoff
            const sceneDur = Number((actualDur + 0.35).toFixed(2));
            updatedScenes[i] = {
              ...updatedScenes[i],
              audioUrl: data.data.audioUrl,
              audioDuration: actualDur,
              duration: Math.max(sceneDur, updatedScenes[i].duration || 3.0),
            };
          }
        } catch (e) {
          console.warn(`Could not synthesize scene ${sc.index}:`, e);
        }
      });

      await Promise.all(synthesisPromises);

      // Re-index timing sequentially across all scenes
      let curTime = 0;
      const reindexed = updatedScenes.map((s, idx) => {
        const dur = s.duration;
        const start = Number(curTime.toFixed(2));
        curTime += dur;
        const end = Number(curTime.toFixed(2));
        const cueRatio = (s.cueFrame && s.duration) ? (s.cueFrame / (s.duration * 30)) : 0.25;
        const cueFrame = Math.max(4, Math.floor(cueRatio * dur * 30));
        return {
          ...s,
          index: idx + 1,
          duration: dur,
          startTime: start,
          endTime: end,
          cueFrame,
        };
      });

      return reindexed;
    } finally {
      setIsSynthesizingVoices(false);
    }
  };

  const handleUpdateScene = (index: number, updates: Partial<StudioScene>) => {
    const updatedScenes = [...project.scenes];
    const prevNarration = updatedScenes[index].narration;
    const narrationChanged = updates.narration !== undefined && updates.narration !== prevNarration;

    updatedScenes[index] = {
      ...updatedScenes[index],
      ...updates,
      ...(narrationChanged ? { audioUrl: undefined, audioDuration: undefined } : {}),
    };
    // Recalculate duration if narration word count changes noticeably
    if (narrationChanged && updates.narration !== undefined) {
      const words = updates.narration.trim().split(/\s+/).length;
      const estimatedDur = Number(Math.max(2.5, Math.min(8.0, words / 2.5)).toFixed(1));
      updatedScenes[index].duration = estimatedDur;
    }

    // Re-index timing
    let curTime = 0;
    const reindexed = updatedScenes.map((s, idx) => {
      const start = Number(curTime.toFixed(2));
      curTime += s.duration;
      const end = Number(curTime.toFixed(2));
      return {
        ...s,
        index: idx + 1,
        startTime: start,
        endTime: end,
      };
    });

    updateProject({ scenes: reindexed });
  };

  const handleDeleteScene = (index: number) => {
    if (project.scenes.length <= 1) return;
    const remaining = project.scenes.filter((_, i) => i !== index);
    let curTime = 0;
    const reindexed = remaining.map((s, idx) => {
      const start = Number(curTime.toFixed(2));
      curTime += s.duration;
      const end = Number(curTime.toFixed(2));
      return {
        ...s,
        index: idx + 1,
        startTime: start,
        endTime: end,
      };
    });
    updateProject({ scenes: reindexed });
  };

  const handleSplitScene = (index: number) => {
    const target = project.scenes[index];
    const words = target.narration.trim().split(/\s+/);
    if (words.length < 4) return;

    const mid = Math.ceil(words.length / 2);
    const part1 = words.slice(0, mid).join(' ');
    const part2 = words.slice(mid).join(' ');

    const dur1 = Number(Math.max(2.0, target.duration / 2).toFixed(1));
    const dur2 = Number(Math.max(2.0, target.duration / 2).toFixed(1));

    const newScenes = [...project.scenes];
    const scene1: StudioScene = {
      ...target,
      id: `scene_${Date.now()}_a`,
      narration: part1,
      duration: dur1,
    };
    const scene2: StudioScene = {
      ...target,
      id: `scene_${Date.now()}_b`,
      narration: part2,
      duration: dur2,
      visualDirection: `Follow-up sequence: Transitioning to the second phase of ${target.visualType.replace('_', ' ')}.`,
    };

    newScenes.splice(index, 1, scene1, scene2);

    let curTime = 0;
    const reindexed = newScenes.map((s, idx) => {
      const start = Number(curTime.toFixed(2));
      curTime += s.duration;
      const end = Number(curTime.toFixed(2));
      return {
        ...s,
        index: idx + 1,
        startTime: start,
        endTime: end,
      };
    });
    updateProject({ scenes: reindexed });
  };

  const handleAddScene = () => {
    const lastScene = project.scenes[project.scenes.length - 1];
    const start = lastScene ? lastScene.endTime : 0;
    const newScene: StudioScene = {
      id: `scene_${Date.now()}`,
      index: project.scenes.length + 1,
      startTime: start,
      endTime: Number((start + 3.5).toFixed(2)),
      duration: 3.5,
      narration: 'New spoken phrase introducing the next critical concept.',
      cue: 'critical concept',
      cueFrame: 15,
      visualDirection: 'Dynamic visual sequence: Kinetic focal reveal matching narration.',
      visualType: 'kinetic_text',
      highlightWords: ['critical concept'],
      graphicData: {
        badge: 'NEW CONCEPT BEAT',
        headline: 'CRITICAL CONCEPT',
        subtext: 'New spoken phrase introducing the next critical concept.',
      },
    };
    updateProject({ scenes: [...project.scenes, newScene] });
  };

  const totalCalculatedDuration = Number(
    project.scenes.reduce((acc, s) => acc + s.duration, 0).toFixed(1)
  );
  const totalWords = project.scenes.reduce(
    (acc, s) => acc + s.narration.trim().split(/\s+/).filter(Boolean).length,
    0
  );

  const durationDiff = Math.abs(totalCalculatedDuration - project.duration);
  const isPacingOptimal = durationDiff <= 1.5;

  const handleAutoAlignDuration = () => {
    if (project.scenes.length === 0) return;
    const rawTotal = project.scenes.reduce((acc, s) => acc + s.duration, 0) || project.duration;
    const factor = project.duration / rawTotal;
    let currentTime = 0;
    const updatedScenes = project.scenes.map((s, idx) => {
      // Audio safety floor: never compress a scene below its spoken audio duration!
      const minDur = s.audioDuration ? Number((s.audioDuration + 0.3).toFixed(2)) : 2.5;
      let dur = Number((s.duration * factor).toFixed(2));
      dur = Math.max(minDur, dur);

      if (idx === project.scenes.length - 1 && factor >= 1.0) {
        dur = Number(Math.max(minDur, (project.duration - currentTime)).toFixed(2));
      }
      const start = Number(currentTime.toFixed(2));
      currentTime += dur;
      const end = Number(currentTime.toFixed(2));
      const cueRatio = (s.cueFrame && s.duration) ? (s.cueFrame / (s.duration * 30)) : 0.25;
      const cueFrame = Math.max(4, Math.floor(cueRatio * dur * 30));

      return {
        ...s,
        duration: dur,
        startTime: start,
        endTime: end,
        cueFrame,
      };
    });
    updateProject({ scenes: updatedScenes });
  };

  const handleProceedToReview = async () => {
    const unvoiced = project.scenes.filter((s) => !s.audioUrl && s.narration);
    if (unvoiced.length > 0) {
      const synchronized = await syncScenesAudio(project.scenes);
      updateProject({ scenes: synchronized });
    }
    setStage(3);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Eyebrow & Stepper Context */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#232634] bg-[#14161F] px-3 py-1 text-xs font-mono text-[#EDEDED]">
          <span className="h-2 w-2 rounded-full bg-[#FF4F00] animate-pulse" />
          <span>STAGE 02 // DYNAMIC PHRASE-SYNC STORYBOARD</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8] bg-[#14161F] px-3 py-1 rounded-full border border-[#232634]">
          <Clock className="h-3.5 w-3.5 text-[#FF4F00]" />
          <span>
            Target: <strong className="text-white">{project.duration}s</strong> (~{durationMeta.targetWords} words)
          </span>
          <span className="text-[#64748B]">•</span>
          <span>Voice: <strong className="text-white">{voiceObj.name}</strong></span>
        </div>
      </div>

      {/* Main Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Storyboard &amp; Script Director
          </h1>
          <p className="mt-1 text-sm sm:text-base text-[#94A3B8] max-w-2xl leading-relaxed">
            Craft and review your phrase-synced visual flow. Each animation and graphic stays on screen only while its specific phrase is spoken.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleGenerateStoryboard}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-[#232634] bg-[#14161F] px-4 py-2.5 text-xs font-medium text-[#EDEDED] hover:bg-[#1C1E26] hover:border-[#3D445C] transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#FF4F00] ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Synthesizing...' : 'Regenerate Draft'}</span>
          </button>
        </div>
      </div>

      {/* Script Source Mode Segmented Control */}
      <div className="mt-8 rounded-2xl border border-[#232634] bg-[#14161F] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[#1C1E26] pb-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setActiveTab('ai_generate');
                setScriptMode('ai_generate');
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'ai_generate'
                  ? 'bg-[#FF4F00] text-white shadow-md shadow-[#FF4F00]/25'
                  : 'bg-[#08090A] text-[#94A3B8] border border-[#232634] hover:text-white'
              }`}
            >
              <Wand2 className="h-3.5 w-3.5" />
              <span>Generate Script with AI</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('own_script');
                setScriptMode('own_script');
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === 'own_script'
                  ? 'bg-[#FF4F00] text-white shadow-md shadow-[#FF4F00]/25'
                  : 'bg-[#08090A] text-[#94A3B8] border border-[#232634] hover:text-white'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>I Have My Own Script</span>
            </button>
          </div>

          <span className="text-xs text-[#94A3B8]">
            {activeTab === 'ai_generate'
              ? 'AI crafts script from your Topic prompt'
              : 'Paste your script and AI will polish & segment it'}
          </span>
        </div>

        {/* Tab 1: AI Prompt Brief View */}
        {activeTab === 'ai_generate' && (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-[#232634] bg-[#08090A] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-[#FF4F00] uppercase tracking-wider block">
                  Active Video Topic
                </span>
                <p className="text-sm font-semibold text-white leading-snug">
                  {project.topic || 'No topic brief specified.'}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#94A3B8] font-mono mt-1">
                  <span>Target: {project.duration}s (~{durationMeta.targetWords} words)</span>
                  <span>•</span>
                  <span>Voice: {voiceObj.name}</span>
                  <span>•</span>
                  <span>Tone: {project.tone}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStage(1)}
                className="text-xs text-[#94A3B8] hover:text-[#FF4F00] flex items-center gap-1 shrink-0 transition"
              >
                <span>Edit Topic</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <p className="text-xs text-[#94A3B8] max-w-lg leading-relaxed">
                Sends your specific topic to Gemini 3.5 AI to research real facts, write spoken narration lines, and choreograph 9:16 visual scenes.
              </p>

              <button
                type="button"
                onClick={handleGenerateStoryboard}
                disabled={isLoading || !project.topic.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#FF4F00] px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#FF4F00]/30 hover:bg-[#FF3B00] transition active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
              >
                <Sparkles className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>
                  {isLoading
                    ? 'Researching & Writing Script...'
                    : project.scenes.length > 0
                    ? '⚡ Regenerate AI Storyboard'
                    : '⚡ Generate AI Storyboard & Visual Script'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Custom Script Input View */}
        {activeTab === 'own_script' && (
          <div className="mt-5 space-y-3">
            <textarea
              rows={4}
              value={project.customScript}
              onChange={(e) => setCustomScript(e.target.value)}
              placeholder="Paste your voiceover script here. Gemini 3.5 AI will balance speech cadence, word pacing, and generate phrase-synchronized animation beats."
              className="w-full rounded-xl border border-[#232634] bg-[#08090A] px-4 py-3 text-sm text-[#EDEDED] placeholder-[#64748B] focus:border-[#FF4F00] focus:outline-none focus:ring-1 focus:ring-[#FF4F00] transition"
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-mono text-[#94A3B8]">
                {project.customScript.trim().split(/\s+/).filter(Boolean).length} words
                (Target: ~{durationMeta.targetWords} words)
              </span>
              <button
                type="button"
                onClick={handleGenerateStoryboard}
                disabled={isLoading || project.customScript.trim().length < 10}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF4F00] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#FF4F00]/25 hover:bg-[#FF3B00] transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Polishing Script...' : '✨ Polish & Segment into Scenes (Gemini AI)'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {successMsg && !isLoading && (
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>
              <strong>Success:</strong> {successMsg}
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            AI Synchronized
          </span>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300 flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-2xl border border-[#232634] bg-[#14161F] p-6 animate-pulse space-y-3"
            >
              <div className="h-4 w-1/4 bg-[#232634] rounded" />
              <div className="h-10 w-full bg-[#0F1015] rounded-xl" />
              <div className="h-6 w-3/4 bg-[#232634] rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Dynamic Phrase-Synced Scene Cards Feed */}
      {!isLoading && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-mono uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#FF4F00]" />
              <span>Dynamic Visual Scenes ({project.scenes.length} Phrase Beats)</span>
            </h2>
            <span className="text-xs text-[#94A3B8]">
              Click any text to edit inline • Re-times automatically
            </span>
          </div>

          {project.scenes.map((scene, idx) => (
            <div
              key={scene.id || idx}
              className="group rounded-2xl border border-[#232634] bg-[#14161F] p-5 sm:p-6 transition hover:border-[#3D445C] hover:bg-[#161822] shadow-lg relative"
            >
              {/* Scene Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1C1E26] pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FF4F00] text-xs font-bold text-white shadow-sm shadow-[#FF4F00]/25">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    Scene 0{idx + 1}
                  </span>

                  {/* Timecode Range */}
                  <span className="rounded-md border border-[#232634] bg-[#08090A] px-2.5 py-0.5 text-xs font-mono text-[#94A3B8]">
                    {scene.startTime.toFixed(1)}s – {scene.endTime.toFixed(1)}s ({scene.duration.toFixed(1)}s)
                  </span>

                  {/* Visual Type Badge */}
                  <span className="hidden sm:inline-flex text-[11px] font-mono uppercase text-[#FF4F00] bg-[#FF4F00]/10 px-2 py-0.5 rounded border border-[#FF4F00]/20">
                    {scene.visualType.replace('_', ' ')}
                  </span>
                </div>

                {/* Micro Actions */}
                <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
                  <button
                    type="button"
                    onClick={() => handleSplitScene(idx)}
                    title="Split into two phrase scenes"
                    className="flex items-center gap-1 rounded-lg border border-[#232634] bg-[#08090A] px-2.5 py-1 text-xs text-[#94A3B8] hover:text-white hover:bg-[#1C1E26] transition"
                  >
                    <Split className="h-3 w-3 text-[#FF4F00]" />
                    <span className="hidden sm:inline">Split</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteScene(idx)}
                    disabled={project.scenes.length <= 1}
                    title="Delete scene"
                    className="flex items-center justify-center h-7 w-7 rounded-lg border border-[#232634] bg-[#08090A] text-[#94A3B8] hover:text-rose-400 hover:border-rose-500/30 transition disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Editable Narration Box */}
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] block mb-1">
                  Spoken Voiceover Phrase
                </label>
                <textarea
                  rows={2}
                  value={scene.narration}
                  onChange={(e) => handleUpdateScene(idx, { narration: e.target.value })}
                  className="w-full rounded-xl border border-[#232634] bg-[#08090A] px-3.5 py-2.5 text-sm sm:text-base text-[#EDEDED] font-medium leading-relaxed focus:border-[#FF4F00] focus:outline-none focus:ring-1 focus:ring-[#FF4F00] transition resize-y"
                />
              </div>

              {/* Visual Composition / Motion Direction Box */}
              <div className="mt-3.5 grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-[#1C1E26]">
                <div className="md:col-span-2">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Visual Direction &amp; Micro-Animation
                  </label>
                  <input
                    type="text"
                    value={scene.visualDirection}
                    onChange={(e) =>
                      handleUpdateScene(idx, { visualDirection: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#232634] bg-[#0F1015] px-3 py-2 text-xs sm:text-sm text-[#EDEDED] focus:border-[#FF4F00] focus:outline-none focus:ring-1 focus:ring-[#FF4F00] transition"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] block mb-1">
                    Motion Archetype
                  </label>
                  <select
                    value={scene.visualType}
                    onChange={(e) =>
                      handleUpdateScene(idx, {
                        visualType: e.target.value as any,
                      })
                    }
                    className="w-full rounded-xl border border-[#232634] bg-[#0F1015] px-3 py-2 text-xs text-[#EDEDED] focus:border-[#FF4F00] focus:outline-none transition cursor-pointer"
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
              </div>

              {/* Animation Cue Trigger Row */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 bg-[#08090A] p-2.5 rounded-xl border border-[#1C1E26]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase text-[#FF4F00] bg-[#FF4F00]/15 px-2 py-0.5 rounded border border-[#FF4F00]/30 font-bold">
                    Animation Cue
                  </span>
                  <span className="text-xs text-[#EDEDED] font-mono">
                    "{scene.cue || scene.highlightWords?.[0] || 'Direct Reveal'}"
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#94A3B8]">
                  <span>Triggers at: <strong className="text-white">Frame {scene.cueFrame || 6}</strong> (~{((scene.cueFrame || 6) / 30).toFixed(1)}s)</span>
                </div>
              </div>

              {/* Highlight Words Chips */}
              {scene.highlightWords && scene.highlightWords.length > 0 && (
                <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono text-[#64748B] uppercase">Keywords:</span>
                  {scene.highlightWords.map((kw, kwIdx) => (
                    <span
                      key={kwIdx}
                      className="rounded bg-[#FF4F00]/10 border border-[#FF4F00]/25 px-2 py-0.5 text-[11px] font-mono text-[#FF4F00]"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Add Scene Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleAddScene}
              className="w-full rounded-2xl border-2 border-dashed border-[#232634] bg-[#0F1015] py-4 text-xs font-semibold text-[#94A3B8] hover:border-[#FF4F00] hover:text-white transition flex items-center justify-center gap-2 group active:scale-98"
            >
              <Plus className="h-4 w-4 text-[#FF4F00] transition group-hover:scale-110" />
              <span>+ Add Scene Beat</span>
            </button>
          </div>
        </div>
      )}

      {/* Persistent Pacing & Runtime Progress Bar */}
      <div className="mt-10 rounded-2xl border border-[#232634] bg-[#14161F] p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#08090A] border border-[#232634] text-[#FF4F00]">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <span>Total Runtime: {totalCalculatedDuration}s</span>
                <span className="text-xs font-mono text-[#94A3B8]">/ {project.duration}s target</span>
              </p>
              <p className="text-xs text-[#94A3B8]">
                {totalWords} words • {project.scenes.length} scenes • Average {project.scenes.length ? (totalCalculatedDuration / project.scenes.length).toFixed(1) : 0}s per phrase
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {isPacingOptimal ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-mono">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Exact Target Pacing ({totalCalculatedDuration}s)</span>
              </span>
            ) : (
              <>
                <span className="inline-flex items-center gap-1.5 text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 font-mono">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Differs by {durationDiff.toFixed(1)}s</span>
                </span>
                <button
                  type="button"
                  onClick={handleAutoAlignDuration}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF4F00] text-white text-xs font-semibold shadow-md shadow-[#FF4F00]/25 hover:bg-[#FF3B00] transition active:scale-95 cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>⚡ Auto-Align to {project.duration}s</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-[#08090A] h-2.5 rounded-full overflow-hidden border border-[#232634] relative">
          <div
            className={`h-full transition-all duration-300 ${
              isPacingOptimal ? 'bg-[#FF4F00]' : 'bg-amber-400'
            }`}
            style={{
              width: `${Math.min(100, (totalCalculatedDuration / project.duration) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Bottom Navigation Dock */}
      <div className="mt-8 rounded-2xl border border-[#232634] bg-[#0F1015] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setStage(1)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#232634] bg-[#14161F] px-5 py-3 text-xs font-medium text-[#EDEDED] hover:bg-[#1C1E26] transition active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 text-[#FF4F00]" />
          <span>← Back to Topic Formulation</span>
        </button>

        <div className="w-full sm:w-auto flex items-center justify-end">
          <button
            type="button"
            onClick={handleProceedToReview}
            disabled={project.scenes.length === 0 || isSynthesizingVoices}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF4F00] px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-[#FF4F00]/25 transition hover:bg-[#FF3B00] active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSynthesizingVoices ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-white" />
                <span>Synthesizing Voiceovers (Edge TTS)...</span>
              </>
            ) : (
              <>
                <span>Proceed to Video Review</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
