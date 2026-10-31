import React from 'react';
import { Aperture, ArrowRight, Play } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1C1E26] bg-[#08090A]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF4F00] text-white shadow-lg shadow-[#FF4F00]/25">
            <Aperture className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            AutoReel <span className="text-[#94A3B8] font-medium">Studio</span>
          </span>
        </div>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#94A3B8]">
          <a href="#showcase" className="transition hover:text-white">Showcase Reels</a>
          <a href="#archetypes" className="transition hover:text-white">Motion Archetypes</a>
          <a href="#workflow" className="transition hover:text-white">Workflow</a>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-4">
          <a
            href="#showcase"
            className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#94A3B8] hover:text-white transition"
          >
            <Play className="h-3.5 w-3.5 text-[#FF4F00]" />
            Watch Samples
          </a>
          <a
            href="/studio"
            className="inline-flex items-center gap-2 rounded-lg bg-[#FF4F00] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#FF4F00]/25 transition hover:bg-[#FF3B00] active:scale-95"
          >
            Launch Studio
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
