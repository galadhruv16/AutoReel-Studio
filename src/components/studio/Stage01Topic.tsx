'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Play,
  Pause,
  Clock,
  Mic,
  Sliders,
  Check,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import {
  StudioDuration,
  StudioTone,
  VoiceId,
  VOICES,
  TONES,
  DURATION_CONFIGS,
} from '../../types/studio';

const SUGGESTION_PROMPTS = [
  {
    category: 'Biology',
    title: 'CRISPR Gene Editing',
    prompt:
      'Explain how the CRISPR-Cas9 system targets and edits faulty DNA sequences in living human cells, and why guide RNA is crucial.',
  },
  {
    category: 'History',
    title: 'Battle of Saraighat 1671',
    prompt:
      'How Lachit Borphukan used the narrow 1km river gorge of the Brahmaputra and agile Bachari rivercraft to defeat the massive Mughal armada.',
  },
  {
    category: 'Economics',
    title: '1929 Wall Street Crash',
    prompt:
      'What triggered Black Tuesday in October 1929: margin trading bubbles, unregulated leverage, and the cascading banking collapse that led to the Great Depression.',
  },
  {
    category: 'Computer Science',
    title: 'Quantum Computing Qubits',
    prompt:
      'How quantum superposition and entanglement allow qubits to evaluate exponentially more states simultaneously than classical binary bits.',
  },
];

export const Stage01Topic: React.FC = () => {
  const { project, setTopic, setDuration, setTone, setVoice, setStage } = useStudio();
  const [playingVoice, setPlayingVoice] = useState<VoiceId | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up any playing audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const durationMeta = DURATION_CONFIGS[project.duration];

  const handlePlayVoice = (voiceId: VoiceId, sampleUrl: string) => {
    if (playingVoice === voiceId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingVoice(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    try {
      const audio = new Audio(sampleUrl);
      audioRef.current = audio;
      setPlayingVoice(voiceId);
      setAudioError(null);

      audio.play().catch((err) => {
        console.warn('Audio playback error', err);
        setAudioError('Preview audio unavailable locally');
        setPlayingVoice(null);
      });

      audio.onended = () => {
        setPlayingVoice(null);
      };
    } catch (e) {
      setAudioError('Audio preview not supported in this browser');
      setPlayingVoice(null);
    }
  };

  const isTopicValid = project.topic.trim().length >= 5;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Header Eyebrow */}
      <div className="mb-3 flex items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#232634] bg-[#14161F] px-3 py-1 text-xs font-mono text-[#EDEDED]">
          <span className="h-2 w-2 rounded-full bg-[#FF4F00] animate-pulse" />
          <span>STAGE 01 // TOPIC &amp; CONCEPT FORMULATION</span>
        </div>
      </div>

      {/* Main Heading */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
        What do you want to create today?
      </h1>
      <p className="mt-2 text-sm sm:text-base text-[#94A3B8] max-w-2xl leading-relaxed">
        Enter any subject, thesis, or research brief. AutoReel transforms it into phrase-synced kinetic explainer reels with zero stock video fluff.
      </p>

      {/* Primary Input Card */}
      <div className="mt-8 rounded-2xl border border-[#232634] bg-[#14161F] p-5 sm:p-7 shadow-xl">
        <div className="flex items-center justify-between">
          <label htmlFor="topic-input" className="text-xs font-mono font-semibold uppercase tracking-wider text-[#EDEDED] flex items-center gap-2">
            <span>Topic or Concept Brief</span>
            <span className="text-[11px] text-[#94A3B8] font-normal normal-case">(Plain text, outline, or thesis)</span>
          </label>
          <span className="text-xs font-mono text-[#94A3B8]">
            {project.topic.length} characters
          </span>
        </div>

        {/* Text Area */}
        <div className="mt-3 relative">
          <textarea
            id="topic-input"
            rows={4}
            value={project.topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Explain how mRNA vaccines work in the human immune system... OR The geopolitical impact of the 1973 oil embargo... OR How database write-ahead logging guarantees zero data loss."
            className="w-full rounded-xl border border-[#232634] bg-[#08090A] px-4 py-3.5 text-sm sm:text-base text-[#EDEDED] placeholder-[#64748B] focus:border-[#FF4F00] focus:outline-none focus:ring-1 focus:ring-[#FF4F00] transition resize-y min-h-[110px]"
          />
        </div>

        {/* Suggestion Chips */}
        <div className="mt-4 pt-4 border-t border-[#1C1E26]">
          <p className="text-xs font-medium text-[#94A3B8] mb-2.5">
            Or select an example across diverse domains:
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTION_PROMPTS.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setTopic(item.prompt)}
                className={`group flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition active:scale-95 ${
                  project.topic === item.prompt
                    ? 'border-[#FF4F00] bg-[#FF4F00]/10 text-white font-medium'
                    : 'border-[#232634] bg-[#0F1015] text-[#94A3B8] hover:border-[#3D445C] hover:text-[#EDEDED]'
                }`}
              >
                <span className="text-[10px] font-mono uppercase text-[#FF4F00] bg-[#FF4F00]/10 px-1.5 py-0.5 rounded">
                  {item.category}
                </span>
                <span>{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Production Parameters Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Duration Selector */}
        <div className="rounded-2xl border border-[#232634] bg-[#14161F] p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#EDEDED] flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-[#FF4F00]" />
              <span>Target Duration</span>
            </label>
            <span className="text-xs font-mono text-[#FF4F00]">
              ~{durationMeta.targetWords} words
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {([30, 60, 90] as StudioDuration[]).map((dur) => {
              const isSelected = project.duration === dur;
              const meta = DURATION_CONFIGS[dur];
              return (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setDuration(dur)}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 transition text-center ${
                    isSelected
                      ? 'border-[#FF4F00] bg-[#FF4F00]/10 text-white shadow-md shadow-[#FF4F00]/20'
                      : 'border-[#232634] bg-[#08090A] text-[#94A3B8] hover:border-[#3D445C] hover:text-white'
                  }`}
                >
                  <span className="text-lg font-bold">{dur}s</span>
                  <span className="text-[11px] text-[#94A3B8] mt-0.5">
                    ~{meta.targetWords} words
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-xs text-[#94A3B8] leading-relaxed">
            {durationMeta.description}. Enforced strictly throughout generation and playback.
          </p>
        </div>

        {/* Tone Selector */}
        <div className="rounded-2xl border border-[#232634] bg-[#14161F] p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="tone-select" className="text-xs font-mono font-semibold uppercase tracking-wider text-[#EDEDED] flex items-center gap-2">
              <Sliders className="h-3.5 w-3.5 text-[#FF4F00]" />
              <span>Audience &amp; Tone</span>
            </label>
          </div>

          <div className="relative">
            <select
              id="tone-select"
              value={project.tone}
              onChange={(e) => setTone(e.target.value as StudioTone)}
              className="w-full rounded-xl border border-[#232634] bg-[#08090A] px-4 py-3 text-sm text-[#EDEDED] focus:border-[#FF4F00] focus:outline-none focus:ring-1 focus:ring-[#FF4F00] transition appearance-none cursor-pointer"
            >
              {TONES.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#14161F] text-white">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <p className="mt-3 text-xs text-[#94A3B8] leading-relaxed">
            {TONES.find((t) => t.id === project.tone)?.description}
          </p>
        </div>
      </div>

      {/* Neural Voice Selector */}
      <div className="mt-8 rounded-2xl border border-[#232634] bg-[#14161F] p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-[#EDEDED] flex items-center gap-2">
              <Mic className="h-3.5 w-3.5 text-[#FF4F00]" />
              <span>Neural Voice (Edge TTS)</span>
            </label>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Natural phrase cadence synthesized with millisecond phoneme boundary alignment.
            </p>
          </div>
          {audioError && (
            <span className="text-xs text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20">
              {audioError}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {VOICES.map((v) => {
            const isSelected = project.voice === v.id;
            const isPlaying = playingVoice === v.id;

            return (
              <div
                key={v.id}
                onClick={() => setVoice(v.id)}
                className={`relative flex flex-col justify-between rounded-xl border p-4 transition cursor-pointer ${
                  isSelected
                    ? 'border-[#FF4F00] bg-[#FF4F00]/10 text-white shadow-md shadow-[#FF4F00]/20'
                    : 'border-[#232634] bg-[#08090A] text-[#94A3B8] hover:border-[#3D445C] hover:text-[#EDEDED]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      {v.name}
                      <span className="text-[10px] font-mono text-[#94A3B8] font-normal">
                        ({v.gender})
                      </span>
                    </span>
                    {isSelected && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FF4F00] text-white">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-[#94A3B8] leading-snug">
                    {v.description}
                  </p>
                </div>

                {/* Sample Audio Trigger */}
                <div className="mt-4 pt-3 border-t border-[#1C1E26] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayVoice(v.id, v.sampleAudio);
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      isPlaying
                        ? 'bg-[#FF4F00] text-white shadow-sm'
                        : 'bg-[#14161F] text-[#EDEDED] border border-[#232634] hover:bg-[#1C1E26]'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-3 w-3" />
                        <span>Playing</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 text-[#FF4F00]" />
                        <span>Sample</span>
                      </>
                    )}
                  </button>

                  {isPlaying && (
                    <div className="flex items-center gap-0.5">
                      <span className="h-3 w-0.5 bg-[#FF4F00] animate-pulse" />
                      <span className="h-4 w-0.5 bg-[#FF4F00] animate-pulse delay-75" />
                      <span className="h-2 w-0.5 bg-[#FF4F00] animate-pulse delay-150" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Dock */}
      <div className="mt-10 rounded-2xl border border-[#232634] bg-[#0F1015] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-[#94A3B8]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#14161F] border border-[#232634] text-[#FF4F00]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-[#EDEDED]">
              Estimated Script Output: ~{durationMeta.targetWords} words / {durationMeta.sceneCount}
            </p>
            <p className="text-[11px] text-[#94A3B8]">
              Dynamic phrase-synchronized scenes • Voice: {VOICES.find((v) => v.id === project.voice)?.name}
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              if (isTopicValid) {
                setStage(2);
              }
            }}
            disabled={!isTopicValid}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-xl transition active:scale-95 ${
              isTopicValid
                ? 'bg-[#FF4F00] shadow-[#FF4F00]/25 hover:bg-[#FF3B00] cursor-pointer'
                : 'bg-[#232634] text-[#64748B] cursor-not-allowed opacity-60'
            }`}
          >
            <span>Continue to Storyboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isTopicValid && project.topic.length > 0 && (
        <p className="mt-2 text-center text-xs text-amber-400">
          Please enter at least 5 characters to describe your concept.
        </p>
      )}
    </div>
  );
};
