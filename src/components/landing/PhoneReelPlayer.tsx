'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react';

interface PhoneReelPlayerProps {
  id: string;
  title: string;
  category: string;
  videoSrc: string;
  posterSrc: string;
  durationText: string;
  voiceName: string;
  accentColor: string;
  borderColor: string;
  badgeBg: string;
  description: string;
  isPrimary?: boolean;
}

export const PhoneReelPlayer: React.FC<PhoneReelPlayerProps> = ({
  title,
  category,
  videoSrc,
  posterSrc,
  durationText,
  voiceName,
  accentColor,
  borderColor,
  badgeBg,
  description,
  isPrimary = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      // Pause all other videos on the page
      document.querySelectorAll('video').forEach((v) => {
        if (v !== videoRef.current) v.pause();
      });
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const restartVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration || 1;
    setProgress((current / total) * 100);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div
      className={`group relative flex flex-col items-center transition-all duration-500 ${
        isPrimary ? 'scale-100 lg:-translate-y-4 z-20' : 'scale-95 z-10 hover:z-20 hover:scale-100'
      }`}
    >
      {/* Category Header Badge */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className="rounded-full px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider"
          style={{ backgroundColor: badgeBg, color: accentColor, border: `1px solid ${accentColor}44` }}
        >
          {category}
        </span>
        <span className="text-xs font-mono text-[#64748B]">{durationText}</span>
      </div>

      {/* 9:16 Phone Device Bezel */}
      <div
        onClick={togglePlay}
        className="relative w-[265px] xs:w-[285px] sm:w-[310px] h-[470px] xs:h-[505px] sm:h-[550px] rounded-[34px] sm:rounded-[38px] p-2 sm:p-2.5 cursor-pointer shadow-2xl transition-all duration-300"
        style={{
          backgroundColor: '#0F1117',
          border: `2px solid ${isPlaying ? accentColor : borderColor}`,
          boxShadow: isPlaying
            ? `0 20px 60px -15px ${accentColor}33, 0 0 35px ${accentColor}22`
            : '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
        }}
      >
        {/* Phone Notch / Speaker Bar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center gap-1.5 w-24 h-4 rounded-full bg-[#08090A]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#181B24]" />
          <div className="w-8 h-1 rounded-full bg-[#181B24]" />
        </div>

        {/* Video Canvas Container */}
        <div className="relative w-full h-full rounded-[30px] overflow-hidden bg-black">
          <video
            ref={videoRef}
            src={videoSrc}
            poster={posterSrc}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            className="w-full h-full object-cover"
          />

          {/* Top In-Video Status Overlay */}
          <div className="absolute top-6 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-mono text-white/90 border border-white/10">
              <span
                className={`w-2 h-2 rounded-full ${isPlaying ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: accentColor }}
              />
              {isPlaying ? 'PLAYING' : 'CLICK TO PLAY'}
            </div>
            <div className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-mono text-[#94A3B8] border border-white/10">
              {voiceName}
            </div>
          </div>

          {/* Big Center Play Icon (When Paused) */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition group-hover:bg-black/25">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full text-white shadow-2xl transition transform group-hover:scale-110 active:scale-95"
                style={{ backgroundColor: accentColor, boxShadow: `0 0 30px ${accentColor}88` }}
              >
                <Play className="h-7 w-7 fill-white translate-x-0.5" />
              </div>
            </div>
          )}

          {/* Bottom Video Controls & Scrubber */}
          <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-col gap-1.5 rounded-2xl bg-black/75 backdrop-blur-md p-2.5 border border-white/10">
            <div className="flex items-center justify-between text-xs text-white">
              <span className="font-semibold truncate max-w-[170px]">{title}</span>
              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  onClick={restartVideo}
                  title="Replay from start"
                  className="text-[#94A3B8] hover:text-white transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={toggleMute}
                  title={isMuted ? 'Unmute' : 'Mute'}
                  className="text-[#94A3B8] hover:text-white transition"
                >
                  {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Scrubber Track */}
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-100"
                style={{ width: `${progress}%`, backgroundColor: accentColor }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reel Description */}
      <p className="mt-3 text-center text-xs text-[#94A3B8] max-w-[280px] leading-relaxed">
        {description}
      </p>
    </div>
  );
};
