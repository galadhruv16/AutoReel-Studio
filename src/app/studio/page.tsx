'use client';

import React from 'react';
import { StudioProvider, useStudio } from '../../context/StudioContext';
import { StudioNavbar } from '../../components/studio/StudioNavbar';
import { Stage01Topic } from '../../components/studio/Stage01Topic';
import { Stage02Storyboard } from '../../components/studio/Stage02Storyboard';
import { ArrowLeft, Layers, Play, Download } from 'lucide-react';

const StudioContent: React.FC = () => {
  const { project, setStage } = useStudio();

  return (
    <main className="min-h-screen bg-[#08090A] text-[#EDEDED] antialiased">
      <StudioNavbar />

      {project.stage === 1 && <Stage01Topic />}
      {project.stage === 2 && <Stage02Storyboard />}

      {/* Stage 03 Placeholder */}
      {project.stage === 3 && (
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF4F00]/15 text-[#FF4F00] border border-[#FF4F00]/30 shadow-lg shadow-[#FF4F00]/20">
            <Play className="h-7 w-7" />
          </div>
          <span className="text-xs font-mono uppercase text-[#FF4F00] bg-[#FF4F00]/10 px-3 py-1 rounded-full border border-[#FF4F00]/30">
            Sprint 3 Scope
          </span>
          <h2 className="mt-4 text-3xl font-bold text-white">Stage 03: Video Review &amp; Surgical Revision</h2>
          <p className="mt-2 text-sm text-[#94A3B8] max-w-lg mx-auto">
            9:16 vertical video player preview, inline script editing, and Edge TTS audio re-synthesis.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setStage(2)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#232634] bg-[#14161F] px-5 py-2.5 text-sm font-medium text-[#EDEDED] hover:bg-[#1C1E26] transition"
            >
              <ArrowLeft className="h-4 w-4 text-[#FF4F00]" />
              Back to Storyboard
            </button>
          </div>
        </div>
      )}

      {/* Stage 04 Placeholder */}
      {project.stage === 4 && (
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF4F00]/15 text-[#FF4F00] border border-[#FF4F00]/30 shadow-lg shadow-[#FF4F00]/20">
            <Download className="h-7 w-7" />
          </div>
          <span className="text-xs font-mono uppercase text-[#FF4F00] bg-[#FF4F00]/10 px-3 py-1 rounded-full border border-[#FF4F00]/30">
            Sprint 4 Scope
          </span>
          <h2 className="mt-4 text-3xl font-bold text-white">Stage 04: Publishing &amp; Multi-Platform Export</h2>
          <p className="mt-2 text-sm text-[#94A3B8] max-w-lg mx-auto">
            Full 1080x1920 60FPS video download, synchronized SRT subtitles, and AI platform metadata.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setStage(1)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#232634] bg-[#14161F] px-5 py-2.5 text-sm font-medium text-[#EDEDED] hover:bg-[#1C1E26] transition"
            >
              <ArrowLeft className="h-4 w-4 text-[#FF4F00]" />
              Start New Concept
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default function StudioPage() {
  return (
    <StudioProvider>
      <StudioContent />
    </StudioProvider>
  );
}
