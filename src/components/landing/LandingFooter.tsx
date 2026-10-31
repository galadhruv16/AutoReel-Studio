import React from 'react';
import { Aperture, ArrowRight, GitBranch } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="border-t border-[#1C1F2B] bg-[#060709] py-16 text-sm text-[#94A3B8]">
      <div className="mx-auto max-w-7xl px-6">
        {/* Manifesto Banner */}
        <div className="rounded-3xl border border-[#232738] bg-[#0E1017] p-8 sm:p-12 mb-16 relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,79,0,0.15)_0%,transparent_70%)] pointer-events-none" />

          <p className="text-xs font-mono font-bold tracking-widest text-[#FF4F00] uppercase mb-3">
            THE AUTOREEL MANIFESTO
          </p>

          <blockquote className="max-w-3xl mx-auto text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
            &ldquo;We built AutoReel because slides are dead, stock video is insulting, and the best technical minds deserve cinema-grade pedagogical tools.&rdquo;
          </blockquote>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/studio"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF4F00] px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-[#FF4F00]/25 transition hover:bg-[#FF3B00] active:scale-95"
            >
              Launch AutoReel Studio Free
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Footer Links & Credits */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-[#161822]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF4F00] text-white">
              <Aperture className="h-4 w-4" />
            </div>
            <span className="font-bold text-white tracking-tight">AutoReel Studio</span>
            <span className="text-xs text-[#64748B]">© {new Date().getFullYear()} • 100% Deterministic Video Engine</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#64748B]">
            <a href="#showcase" className="hover:text-white transition">Showcase</a>
            <a href="#archetypes" className="hover:text-white transition">Motion Archetypes</a>
            <span className="flex items-center gap-1.5 text-[#10B981]">
              <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              Engine Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
