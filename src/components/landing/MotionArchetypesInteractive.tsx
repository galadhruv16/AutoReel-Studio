'use client';

import React, { useState } from 'react';
import { RotateCcw, Layers, GitBranch, LineChart, LayoutGrid } from 'lucide-react';

export const MotionArchetypesInteractive: React.FC = () => {
  // Replay keys for triggering re-animation
  const [replayKeys, setReplayKeys] = useState<{ [key: string]: number }>({
    exploded: 0,
    pipeline: 0,
    telemetry: 0,
    matrix: 0,
  });

  const triggerReplay = (key: string) => {
    setReplayKeys((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  };

  return (
    <section className="py-24 border-t border-[#1C1F2B] bg-[#08090A]" id="archetypes">
      {/* Inline styles for dedicated keyframe animations */}
      <style>{`
        @keyframes drawSvgPath {
          from { stroke-dashoffset: 600; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes drawLeaderLine {
          from { stroke-dashoffset: 150; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes popUp {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes explodeTop {
          0% { transform: translateY(0); }
          100% { transform: translateY(-38px); }
        }
        @keyframes explodeBottom {
          0% { transform: translateY(0); }
          100% { transform: translateY(38px); }
        }
        @keyframes packetTravel {
          0% { left: 16%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 84%; opacity: 0; }
        }
        @keyframes pulseNode1 {
          0%, 20% { border-color: rgba(16, 185, 129, 0.4); box-shadow: none; }
          25%, 45% { border-color: #10B981; box-shadow: 0 0 20px #10B981; }
          50%, 100% { border-color: rgba(16, 185, 129, 0.8); }
        }
        @keyframes pulseNode2 {
          0%, 50% { border-color: rgba(56, 189, 248, 0.4); box-shadow: none; }
          55%, 75% { border-color: #38BDF8; box-shadow: 0 0 20px #38BDF8; }
          80%, 100% { border-color: rgba(56, 189, 248, 0.8); }
        }
        @keyframes pulseNode3 {
          0%, 80% { border-color: rgba(245, 158, 11, 0.4); box-shadow: none; }
          85%, 98% { border-color: #F59E0B; box-shadow: 0 0 20px #F59E0B; }
          100% { border-color: rgba(245, 158, 11, 0.8); }
        }
        @keyframes chartPointA {
          0%, 25% { transform: scale(0); opacity: 0; }
          35%, 100% { transform: scale(1); opacity: 1; }
        }
        @keyframes chartPointB {
          0%, 55% { transform: scale(0); opacity: 0; }
          65%, 100% { transform: scale(1); opacity: 1; }
        }
        @keyframes chartPointC {
          0%, 80% { transform: scale(0); opacity: 0; }
          90%, 100% { transform: scale(1); opacity: 1; }
        }
        @keyframes matrixCell1 {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes matrixCell2 {
          0%, 20% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes matrixCell3 {
          0%, 40% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes matrixCell4 {
          0%, 60% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2B3040] bg-[#12141C] px-3.5 py-1 text-[11px] sm:text-xs font-mono font-bold text-[#F59E0B] mb-4">
            <span>ENGINE ARCHITECTURE • 4 CORE MOTION ARCHETYPES</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Code-Driven Visual Archetypes
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-[#94A3B8]">
            AutoReel renders concepts through mathematically timed visual paradigms. Click <span className="font-mono text-white font-semibold">Replay ↺</span> to test each live animation.
          </p>
        </div>

        {/* 4 Interactive Animated Pattern Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {/* ========================================================
              ARCHETYPE 1: EXPLODED ISOMETRIC ANATOMY
             ======================================================== */}
          <div className="rounded-2xl border border-[#232736] bg-[#0E1017] p-4 sm:p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] shrink-0">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-xs font-mono text-[#38BDF8] uppercase tracking-wider font-semibold block">
                      Archetype 01
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-tight truncate">Exploded Isometric Anatomy</h3>
                  </div>
                </div>
                <button
                  onClick={() => triggerReplay('exploded')}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-[#181B26] border border-[#2A2F42] text-[11px] sm:text-xs font-mono text-[#E2E8F0] hover:bg-[#23283B] hover:text-white transition active:scale-95 shrink-0"
                >
                  <RotateCcw className="h-3 w-3 text-[#38BDF8]" />
                  Replay ↺
                </button>
              </div>

              {/* Animated Interactive Canvas */}
              <div
                key={replayKeys.exploded}
                className="relative h-60 sm:h-64 rounded-xl bg-[#090C14] border border-[#1C2030] flex items-center justify-center overflow-hidden px-2 xs:px-4 sm:px-6"
              >
                {/* Isometric 3-Layer Stack */}
                <div className="relative w-32 xs:w-36 sm:w-44 h-32 sm:h-36 flex flex-col items-center justify-center shrink-0">
                  {/* Top Layer: Application Runtime */}
                  <div
                    style={{ animation: 'explodeTop 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
                    className="absolute z-30 w-28 xs:w-32 sm:w-36 h-9 sm:h-11 rounded-lg border-2 border-[#38BDF8] bg-[#38BDF8]/20 shadow-lg shadow-[#38BDF8]/30 flex items-center justify-center font-mono text-[10px] sm:text-xs font-bold text-[#E0F2FE]"
                  >
                    User Service
                  </div>

                  {/* Middle Layer: Virtual Boundary */}
                  <div className="absolute z-20 w-32 xs:w-36 sm:w-40 h-9 sm:h-11 rounded-lg border-2 border-[#10B981] bg-[#10B981]/15 shadow-lg shadow-[#10B981]/25 flex items-center justify-center font-mono text-[10px] sm:text-xs font-bold text-[#D1FAE5]">
                    Virtual Namespace
                  </div>

                  {/* Bottom Layer: Kernel & Hardware */}
                  <div
                    style={{ animation: 'explodeBottom 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
                    className="absolute z-10 w-34 xs:w-38 sm:w-44 h-9 sm:h-11 rounded-lg border-2 border-[#F59E0B] bg-[#F59E0B]/20 shadow-lg shadow-[#F59E0B]/30 flex items-center justify-center font-mono text-[10px] sm:text-xs font-bold text-[#FEF3C7]"
                  >
                    Host Kernel
                  </div>
                </div>

                {/* Leader Labels pinned on the right */}
                <div className="ml-3 xs:ml-4 sm:ml-7 space-y-2.5 sm:space-y-4 z-20 shrink-0">
                  <div
                    style={{ animation: 'popUp 0.8s 0.3s cubic-bezier(0.16, 1, 0.3, 1) both' }}
                    className="flex items-center gap-1.5 sm:gap-2"
                  >
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#38BDF8] animate-ping shrink-0" />
                    <span className="text-[10px] sm:text-xs font-mono text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded border border-[#38BDF8]/30 whitespace-nowrap">
                      L3 • App Logic
                    </span>
                  </div>
                  <div
                    style={{ animation: 'popUp 0.8s 0.6s cubic-bezier(0.16, 1, 0.3, 1) both' }}
                    className="flex items-center gap-1.5 sm:gap-2"
                  >
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#10B981] shrink-0" />
                    <span className="text-[10px] sm:text-xs font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded border border-[#10B981]/30 whitespace-nowrap">
                      L2 • Isolation
                    </span>
                  </div>
                  <div
                    style={{ animation: 'popUp 0.8s 0.9s cubic-bezier(0.16, 1, 0.3, 1) both' }}
                    className="flex items-center gap-1.5 sm:gap-2"
                  >
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#F59E0B] shrink-0" />
                    <span className="text-[10px] sm:text-xs font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded border border-[#F59E0B]/30 whitespace-nowrap">
                      L1 • CPU / RAM
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-3 sm:mt-4 text-xs text-[#94A3B8]">
              Deconstructs complex architectures into vertically separated 3D layers with pinned telemetry pins.
            </p>
          </div>

          {/* ========================================================
              ARCHETYPE 2: MULTI-STAGE TRANSFORMATION PIPELINE
             ======================================================== */}
          <div className="rounded-2xl border border-[#232736] bg-[#0E1017] p-4 sm:p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-[#10B981]/10 text-[#10B981] shrink-0">
                    <GitBranch className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-xs font-mono text-[#10B981] uppercase tracking-wider font-semibold block">
                      Archetype 02
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-tight truncate">Sequential Flow Pipeline</h3>
                  </div>
                </div>
                <button
                  onClick={() => triggerReplay('pipeline')}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-[#181B26] border border-[#2A2F42] text-[11px] sm:text-xs font-mono text-[#E2E8F0] hover:bg-[#23283B] hover:text-white transition active:scale-95 shrink-0"
                >
                  <RotateCcw className="h-3 w-3 text-[#10B981]" />
                  Replay ↺
                </button>
              </div>

              {/* Animated Interactive Canvas */}
              <div
                key={replayKeys.pipeline}
                className="relative h-60 sm:h-64 rounded-xl bg-[#090C14] border border-[#1C2030] flex items-center justify-between px-3 xs:px-5 sm:px-8 overflow-hidden"
              >
                {/* Connecting Rail */}
                <div className="absolute left-8 right-8 sm:left-14 sm:right-14 top-1/2 -translate-y-1/2 h-1 bg-[#1C2233] z-0">
                  <div className="h-full bg-gradient-to-r from-[#10B981] via-[#38BDF8] to-[#F59E0B] w-full opacity-60" />
                </div>

                {/* Traveling Energy Packet */}
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(50% - 8px)',
                    animation: 'packetTravel 2.4s ease-in-out infinite',
                  }}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white shadow-[0_0_15px_#38BDF8] z-20 pointer-events-none"
                />

                {/* Node 1: Ingest */}
                <div
                  style={{ animation: 'pulseNode1 2.4s infinite' }}
                  className="relative z-10 w-20 xs:w-22 sm:w-24 h-20 xs:h-22 sm:h-24 rounded-xl sm:rounded-2xl bg-[#0C121A] border-2 border-[#10B981]/40 flex flex-col items-center justify-center text-center p-1 sm:p-2 shadow-lg"
                >
                  <span className="text-lg sm:text-xl">📥</span>
                  <span className="text-[11px] sm:text-xs font-mono font-bold text-white mt-0.5 sm:mt-1 truncate max-w-full">Prompt</span>
                  <span className="text-[8px] sm:text-[10px] font-mono text-[#10B981]">01 • INGEST</span>
                </div>

                {/* Node 2: Neural Storyboard */}
                <div
                  style={{ animation: 'pulseNode2 2.4s infinite' }}
                  className="relative z-10 w-20 xs:w-22 sm:w-24 h-20 xs:h-22 sm:h-24 rounded-xl sm:rounded-2xl bg-[#0C121A] border-2 border-[#38BDF8]/40 flex flex-col items-center justify-center text-center p-1 sm:p-2 shadow-lg"
                >
                  <span className="text-lg sm:text-xl">🧠</span>
                  <span className="text-[11px] sm:text-xs font-mono font-bold text-white mt-0.5 sm:mt-1 truncate max-w-full">Parse</span>
                  <span className="text-[8px] sm:text-[10px] font-mono text-[#38BDF8]">02 • PARSE</span>
                </div>

                {/* Node 3: Render Engine */}
                <div
                  style={{ animation: 'pulseNode3 2.4s infinite' }}
                  className="relative z-10 w-20 xs:w-22 sm:w-24 h-20 xs:h-22 sm:h-24 rounded-xl sm:rounded-2xl bg-[#0C121A] border-2 border-[#F59E0B]/40 flex flex-col items-center justify-center text-center p-1 sm:p-2 shadow-lg"
                >
                  <span className="text-lg sm:text-xl">🎬</span>
                  <span className="text-[11px] sm:text-xs font-mono font-bold text-white mt-0.5 sm:mt-1 truncate max-w-full">Remotion</span>
                  <span className="text-[8px] sm:text-[10px] font-mono text-[#F59E0B]">03 • RENDER</span>
                </div>
              </div>
            </div>

            <p className="mt-3 sm:mt-4 text-xs text-[#94A3B8]">
              Tracks asynchronous processing lifecycles with continuous photon packets triggering node state updates.
            </p>
          </div>

          {/* ========================================================
              ARCHETYPE 3: DYNAMIC KINETIC TELEMETRY CHART
             ======================================================== */}
          <div className="rounded-2xl border border-[#232736] bg-[#0E1017] p-4 sm:p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B] shrink-0">
                    <LineChart className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-xs font-mono text-[#F59E0B] uppercase tracking-wider font-semibold block">
                      Archetype 03
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-tight truncate">Kinetic Telemetry Chart</h3>
                  </div>
                </div>
                <button
                  onClick={() => triggerReplay('telemetry')}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-[#181B26] border border-[#2A2F42] text-[11px] sm:text-xs font-mono text-[#E2E8F0] hover:bg-[#23283B] hover:text-white transition active:scale-95 shrink-0"
                >
                  <RotateCcw className="h-3 w-3 text-[#F59E0B]" />
                  Replay ↺
                </button>
              </div>

              {/* Animated Interactive Canvas */}
              <div
                key={replayKeys.telemetry}
                className="relative h-60 sm:h-64 rounded-xl bg-[#090C14] border border-[#1C2030] p-3 sm:p-4 flex flex-col justify-between overflow-hidden"
              >
                {/* Metric Summary Header */}
                <div className="flex justify-between items-center z-10">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-xl sm:text-2xl font-black font-mono text-white">92.4%</span>
                    <span className="text-[10px] sm:text-xs font-mono text-[#10B981] bg-[#10B981]/15 px-1.5 sm:px-2 py-0.5 rounded border border-[#10B981]/30">
                      +142% Retention
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-mono text-[#64748B]">Attention Curve</span>
                </div>

                {/* SVG Line Graph */}
                <div className="relative h-36 sm:h-40 w-full">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="30" x2="400" y2="30" stroke="#1E2436" strokeDasharray="4 4" />
                    <line x1="0" y1="70" x2="400" y2="70" stroke="#1E2436" strokeDasharray="4 4" />

                    {/* Gradient Fill under curve */}
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Curve Fill */}
                    <path
                      d="M 0,110 Q 80,90 140,50 T 280,25 T 400,10 L 400,120 L 0,120 Z"
                      fill="url(#chartGradient)"
                    />

                    {/* Animated Line Stroke */}
                    <path
                      d="M 0,110 Q 80,90 140,50 T 280,25 T 400,10"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="3.5"
                      strokeDasharray="600"
                      style={{ animation: 'drawSvgPath 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
                    />

                    {/* Milestone 1 Point */}
                    <circle
                      cx="140"
                      cy="50"
                      r="5"
                      fill="#FFFFFF"
                      stroke="#F59E0B"
                      strokeWidth="3"
                      style={{ animation: 'chartPointA 1.6s forwards' }}
                    />

                    {/* Milestone 2 Point */}
                    <circle
                      cx="280"
                      cy="25"
                      r="5"
                      fill="#FFFFFF"
                      stroke="#F59E0B"
                      strokeWidth="3"
                      style={{ animation: 'chartPointB 1.6s forwards' }}
                    />

                    {/* Climax Zenith Point */}
                    <circle
                      cx="400"
                      cy="10"
                      r="6"
                      fill="#10B981"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      style={{ animation: 'chartPointC 1.6s forwards' }}
                    />
                  </svg>
                </div>

                {/* X-Axis Timeline Labels */}
                <div className="flex justify-between text-[9px] sm:text-[10px] font-mono text-[#64748B] pt-1.5 border-t border-[#1C2030]">
                  <span>0.0s (Hook)</span>
                  <span className="hidden xs:inline">10.0s (Proof)</span>
                  <span>20.0s (Climax)</span>
                  <span className="text-[#10B981] font-semibold">30.0s (Resolve)</span>
                </div>
              </div>
            </div>

            <p className="mt-3 sm:mt-4 text-xs text-[#94A3B8]">
              Plots smooth mathematical bezier curves with milestone inflection points and animated value badges.
            </p>
          </div>

          {/* ========================================================
              ARCHETYPE 4: DIMENSIONAL MATRIX & RATIO ASSORTMENT
             ======================================================== */}
          <div className="rounded-2xl border border-[#232736] bg-[#0E1017] p-4 sm:p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-[#E11D48]/10 text-[#E11D48] shrink-0">
                    <LayoutGrid className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] sm:text-xs font-mono text-[#E11D48] uppercase tracking-wider font-semibold block">
                      Archetype 04
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-tight truncate">Dimensional Ratio Matrix</h3>
                  </div>
                </div>
                <button
                  onClick={() => triggerReplay('matrix')}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-[#181B26] border border-[#2A2F42] text-[11px] sm:text-xs font-mono text-[#E2E8F0] hover:bg-[#23283B] hover:text-white transition active:scale-95 shrink-0"
                >
                  <RotateCcw className="h-3 w-3 text-[#E11D48]" />
                  Replay ↺
                </button>
              </div>

              {/* Animated Interactive Canvas */}
              <div
                key={replayKeys.matrix}
                className="relative h-60 sm:h-64 rounded-xl bg-[#090C14] border border-[#1C2030] p-2.5 sm:p-4 grid grid-cols-2 gap-2 sm:gap-3 overflow-hidden"
              >
                {/* Quadrant 1 */}
                <div
                  style={{ animation: 'matrixCell1 0.6s cubic-bezier(0.16, 1, 0.3, 1) both' }}
                  className="rounded-lg sm:rounded-xl border border-[#EAB308]/40 bg-[#EAB308]/10 p-2 sm:p-3 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#FDE047] uppercase truncate">9/16 Dominant</span>
                    <span className="text-[10px] sm:text-xs font-black font-mono text-white/90">9:3:3:1</span>
                  </div>
                  <div className="my-0.5 sm:my-1">
                    <div className="text-base sm:text-xl font-black text-[#FDE047]">56.25%</div>
                    <div className="text-[10px] sm:text-xs text-[#CBD5E1] font-medium truncate">Yellow & Round</div>
                  </div>
                  <div className="w-full bg-[#EAB308]/20 h-1 sm:h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#EAB308] h-full w-[56%]" />
                  </div>
                </div>

                {/* Quadrant 2 */}
                <div
                  style={{ animation: 'matrixCell2 0.6s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both' }}
                  className="rounded-lg sm:rounded-xl border border-[#22C55E]/40 bg-[#22C55E]/10 p-2 sm:p-3 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#4ADE80] uppercase truncate">3/16 Recomb A</span>
                    <span className="text-[10px] sm:text-xs font-black font-mono text-white/90">3:16</span>
                  </div>
                  <div className="my-0.5 sm:my-1">
                    <div className="text-base sm:text-xl font-black text-[#4ADE80]">18.75%</div>
                    <div className="text-[10px] sm:text-xs text-[#CBD5E1] font-medium truncate">Green & Round</div>
                  </div>
                  <div className="w-full bg-[#22C55E]/20 h-1 sm:h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#22C55E] h-full w-[19%]" />
                  </div>
                </div>

                {/* Quadrant 3 */}
                <div
                  style={{ animation: 'matrixCell3 0.6s 0.4s cubic-bezier(0.16, 1, 0.3, 1) both' }}
                  className="rounded-lg sm:rounded-xl border border-[#F59E0B]/40 bg-[#F59E0B]/10 p-2 sm:p-3 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#FBBF24] uppercase truncate">3/16 Recomb B</span>
                    <span className="text-[10px] sm:text-xs font-black font-mono text-white/90">3:16</span>
                  </div>
                  <div className="my-0.5 sm:my-1">
                    <div className="text-base sm:text-xl font-black text-[#FBBF24]">18.75%</div>
                    <div className="text-[10px] sm:text-xs text-[#CBD5E1] font-medium truncate">Yellow Wrinkled</div>
                  </div>
                  <div className="w-full bg-[#F59E0B]/20 h-1 sm:h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#F59E0B] h-full w-[19%]" />
                  </div>
                </div>

                {/* Quadrant 4 */}
                <div
                  style={{ animation: 'matrixCell4 0.6s 0.6s cubic-bezier(0.16, 1, 0.3, 1) both' }}
                  className="rounded-lg sm:rounded-xl border border-[#10B981]/50 bg-[#10B981]/20 p-2 sm:p-3 flex flex-col justify-between shadow-lg shadow-[#10B981]/15"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#34D399] uppercase truncate">1/16 Recessive</span>
                    <span className="text-[10px] sm:text-xs font-black font-mono text-white/90">1:16</span>
                  </div>
                  <div className="my-0.5 sm:my-1">
                    <div className="text-base sm:text-xl font-black text-[#34D399]">6.25%</div>
                    <div className="text-[10px] sm:text-xs text-[#CBD5E1] font-medium truncate">Green Wrinkled</div>
                  </div>
                  <div className="w-full bg-[#10B981]/30 h-1 sm:h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#10B981] h-full w-[6%]" />
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-3 sm:mt-4 text-xs text-[#94A3B8]">
              Organizes multi-variable outcomes into dimensional grids with animated cell reveals and ratio bars.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
