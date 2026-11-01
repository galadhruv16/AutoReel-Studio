'use client';

import React from 'react';
import { StudioProvider, useStudio } from '../../context/StudioContext';
import { StudioNavbar } from '../../components/studio/StudioNavbar';
import { Stage01Topic } from '../../components/studio/Stage01Topic';
import { Stage02Storyboard } from '../../components/studio/Stage02Storyboard';
import { Stage03Review } from '../../components/studio/Stage03Review';
import { Stage04Publish } from '../../components/studio/Stage04Publish';

const StudioContent: React.FC = () => {
  const { project } = useStudio();

  return (
    <main className="min-h-screen bg-[#08090A] text-[#EDEDED] antialiased">
      <StudioNavbar />

      {project.stage === 1 && <Stage01Topic />}
      {project.stage === 2 && <Stage02Storyboard />}
      {project.stage === 3 && <Stage03Review />}
      {project.stage === 4 && <Stage04Publish />}
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
