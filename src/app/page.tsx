import React from 'react';
import { Navbar } from '../components/landing/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { MotionArchetypesInteractive } from '../components/landing/MotionArchetypesInteractive';
import { LandingFooter } from '../components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#08090A] text-[#EDEDED] antialiased overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <MotionArchetypesInteractive />
      <LandingFooter />
    </main>
  );
}
