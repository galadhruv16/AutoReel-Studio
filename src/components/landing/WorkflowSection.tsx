import React from 'react';
import { Sparkles, Layers, Sliders, Share2, ArrowRight } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Concept Formulation',
    badge: 'Stage 01',
    icon: Sparkles,
    description:
      'Enter your concept, topic, or script. Select target duration (30s, 60s, or 90s) and pick your neural voice narrator.',
  },
  {
    step: '02',
    title: 'Phrase-Sync Storyboard',
    badge: 'Stage 02',
    icon: Layers,
    description:
      'AI constructs phrase-timed scene cards. Each scene is matched to dynamic vector graphics (charts, schematics, kinetic typography).',
  },
  {
    step: '03',
    title: 'Surgical Video Review',
    badge: 'Stage 03',
    icon: Sliders,
    description:
      'Scrub the real-time 60FPS Remotion canvas. Re-synthesize audio instantly, adjust speech pacing, and fine-tune the 3-track audio mixer.',
  },
  {
    step: '04',
    title: 'Multi-Platform Publishing',
    badge: 'Stage 04',
    icon: Share2,
    description:
      'Export Full HD 1080×1920 MP4 masters, download millisecond-accurate SubRip (.srt) subtitles, and copy tailored social media kits.',
  },
];

export const WorkflowSection: React.FC = () => {
  return (
    <section className="py-24 border-t border-[#1C1F2B] bg-[#08090A]" id="workflow">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#232634] bg-[#14161F] px-3.5 py-1 text-xs font-mono text-[#EDEDED] mb-4">
            <span className="h-2 w-2 rounded-full bg-[#FF4F00] animate-pulse" />
            <span>4-STAGE CREATION ENGINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            How AutoReel Studio Turns Scripts Into Viral Explainer Reels
          </h2>
          <p className="mt-3 text-base text-[#94A3B8]">
            From raw idea to high-retention vertical video with deterministic audio-visual synchrony.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-2xl border border-[#1C1F2B] bg-[#0F1117] p-6 transition-all duration-300 hover:border-[#FF4F00]/40 hover:bg-[#14161F] hover:-translate-y-1 shadow-lg"
              >
                {/* Step indicator */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF4F00]/10 border border-[#FF4F00]/25 text-[#FF4F00] transition group-hover:bg-[#FF4F00] group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#64748B] group-hover:text-[#FF4F00] transition">
                    STEP {item.step}
                  </span>
                </div>

                <div className="mb-2">
                  <span className="inline-block rounded-md bg-[#1C1E26] px-2 py-0.5 text-[10px] font-mono text-[#94A3B8] uppercase">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-white tracking-tight mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="mt-16 text-center">
          <a
            href="/studio"
            className="inline-flex items-center gap-2 rounded-xl bg-[#FF4F00] px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-[#FF4F00]/25 transition hover:bg-[#FF3B00] active:scale-95"
          >
            Launch Studio &amp; Start Creating
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
};
