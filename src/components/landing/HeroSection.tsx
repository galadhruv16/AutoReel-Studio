import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { PhoneReelPlayer } from './PhoneReelPlayer';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32" id="showcase">
      {/* Background Subtle Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] rounded-full bg-[#FF4F00]/10 blur-[130px]" />
        <div className="absolute top-20 left-1/4 w-[400px] h-[300px] rounded-full bg-[#38BDF8]/8 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Editorial Eyebrow Tag */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2A2E3D] bg-[#12141C] px-3.5 sm:px-4 py-1.5 text-[11px] sm:text-xs font-mono text-[#E2E8F0] shadow-sm text-center">
            <span className="flex h-2 w-2 rounded-full bg-[#FF4F00] animate-pulse shrink-0" />
            <span className="truncate">AI MOTION STUDIO • 100% DETERMINISTIC VECTOR GRAPHICS</span>
          </div>
        </div>

        {/* Big Editorial Headline */}
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            Ideas deserve <span className="italic font-serif font-normal text-[#FF4F00]">motion</span>, not bullet points.
          </h1>
          <p className="mt-6 text-base sm:text-xl text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
            AutoReel compiles complex systems, scientific concepts, and historical narratives into cinematic vertical explainer reels with synchronized progressive illustrations. Zero stock video fluff.
          </p>

          {/* Action Row */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/studio"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#FF4F00] px-6 py-3.5 text-base font-semibold text-white shadow-xl shadow-[#FF4F00]/30 transition hover:bg-[#FF3B00] active:scale-95"
            >
              <Sparkles className="h-5 w-5" />
              Launch Creation Studio
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#archetypes"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#2B3040] bg-[#11131B] px-6 py-3.5 text-base font-medium text-[#EDEDED] transition hover:bg-[#1A1D29] hover:border-[#3D445C]"
            >
              Explore Motion Archetypes
            </a>
          </div>
        </div>

        {/* ========================================================
            THE 3 INTERACTIVE 30-SECOND REELS SHOWCASE
           ======================================================== */}
        <div className="mt-16 pt-8 border-t border-[#1C1F2B]">
          <div className="text-center mb-10">
            <p className="text-xs font-mono font-semibold uppercase tracking-widest text-[#FF4F00]">
              Interactive Audio-Visual Proof
            </p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Three Distinct Stories. Three Custom Aesthetics.
            </h2>
            <p className="text-sm text-[#94A3B8] mt-2">
              Click any phone to listen to the synchronized voiceover and watch the real vector motion graphics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6 items-center justify-center max-w-6xl mx-auto">
            {/* Reel 1: Biology & Genetics */}
            <PhoneReelPlayer
              id="genetics"
              category="Biology & Genetics"
              title="The 9:3:3:1 Pea Plant Cross"
              durationText="31.5s"
              voiceName="Jenny Neural"
              accentColor="#10B981"
              borderColor="rgba(16, 185, 129, 0.4)"
              badgeBg="rgba(16, 185, 129, 0.15)"
              videoSrc="/videos/reel_genetics.mp4"
              posterSrc="/videos/poster_genetics.png"
              description="Mendel's F2 dihybrid cross: chromosome vectors, 16-cell Punnett matrix, and 9:3:3:1 ratio explosion."
            />

            {/* Reel 2: Kubernetes Container Architecture (Center Primary Focus) */}
            <PhoneReelPlayer
              id="kubernetes"
              category="Cloud Architecture"
              title="The Kubernetes Container Lie"
              durationText="29.5s"
              voiceName="Brian Multilingual"
              accentColor="#00F0FF"
              borderColor="rgba(0, 240, 255, 0.5)"
              badgeBg="rgba(0, 240, 255, 0.15)"
              videoSrc="/videos/reel_kubernetes.mp4"
              posterSrc="/videos/poster_kubernetes.png"
              description="Linux cgroups & namespaces shattered: why Pods wrap containers with a zero-latency localhost bridge."
              isPrimary={true}
            />

            {/* Reel 3: Indian History (Battle of Saraighat) */}
            <PhoneReelPlayer
              id="saraighat"
              category="Indian History"
              title="The Naval Ambush of Saraighat"
              durationText="31.8s"
              voiceName="Andrew Multilingual"
              accentColor="#F59E0B"
              borderColor="rgba(245, 158, 11, 0.45)"
              badgeBg="rgba(245, 158, 11, 0.15)"
              videoSrc="/videos/reel_saraighat.mp4"
              posterSrc="/videos/poster_saraighat.png"
              description="1671 Brahmaputra river guerrilla tactics: Lachit Borphukan traps and shatters the 4,000-vessel Mughal armada."
            />
          </div>
        </div>
      </div>
    </section>
  );
};
