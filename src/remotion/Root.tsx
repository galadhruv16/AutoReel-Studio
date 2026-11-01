import React from 'react';
import { Composition } from 'remotion';
import { MainReel } from './compositions/MainReel';
import { GeneticsReel } from './compositions/GeneticsReel';
import { KubernetesReel } from './compositions/KubernetesReel';
import { SaraighatReel } from './compositions/SaraighatReel';
import { DynamicStoryReel } from './compositions/DynamicStoryReel';

import spikeAudioData from '../../public/audio/spike_test.json';
import geneticsData from '../../public/audio/reel_genetics.json';
import k8sData from '../../public/audio/reel_kubernetes.json';
import saraighatData from '../../public/audio/reel_saraighat.json';

export const RemotionRoot: React.FC = () => {
  const fps = 30;

  return (
    <>
      {/* 1. Biology & Genetics Reel: Mendel's F2 Cross */}
      <Composition
        id="GeneticsReel"
        component={GeneticsReel}
        durationInFrames={Math.ceil((geneticsData.totalDurationMs / 1000) * fps) + 15}
        fps={fps}
        width={1080}
        height={1920}
      />

      {/* 2. Cloud Architecture Reel: Kubernetes Pod Illusion */}
      <Composition
        id="KubernetesReel"
        component={KubernetesReel}
        durationInFrames={Math.ceil((k8sData.totalDurationMs / 1000) * fps) + 15}
        fps={fps}
        width={1080}
        height={1920}
      />

      {/* 3. Indian History Reel: Battle of Saraighat */}
      <Composition
        id="SaraighatReel"
        component={SaraighatReel}
        durationInFrames={Math.ceil((saraighatData.totalDurationMs / 1000) * fps) + 15}
        fps={fps}
        width={1080}
        height={1920}
      />

      {/* 4. Universal AI Dynamic Storyboard Reel */}
      <Composition
        id="DynamicStoryReel"
        component={DynamicStoryReel as any}
        durationInFrames={30 * 60}
        fps={fps}
        width={1080}
        height={1920}
        defaultProps={{
          topic: 'AutoReel Motion Explainer',
          scenes: [],
          captionStyle: 'kinetic' as const,
          accentColor: '#FF4F00',
        }}
      />

      {/* Backward-compatible Spike Reel */}
      <Composition
        id="MainReel"
        component={MainReel as any}
        durationInFrames={Math.ceil((spikeAudioData.totalDurationMs / 1000) * fps) + 15}
        fps={fps}
        width={1080}
        height={1920}
        defaultProps={{
          headline: 'The Kubernetes Container Lie',
          subheadline: 'Why Pods Exist',
          badgeText: 'Cloud Architecture',
          audioPath: 'audio/spike_test.mp3',
          wordTimestamps: spikeAudioData.wordTimestamps,
          showSafeZone: false,
          captionStyle: 'vox-editorial' as const,
        }}
      />
    </>
  );
};
