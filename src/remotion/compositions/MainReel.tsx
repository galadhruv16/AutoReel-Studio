import React from 'react';
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { SpikeReelProps } from '../types';
import { TitleHook } from '../patterns/TitleHook';
import { VoxEditorialCaptions } from '../components/captions/VoxEditorialCaptions';
import { OpusKaraokeCaptions } from '../components/captions/OpusKaraokeCaptions';
import { SafeZoneOverlay } from '../components/SafeZoneOverlay';

export const MainReel: React.FC<SpikeReelProps> = ({
  headline,
  subheadline,
  badgeText,
  audioPath,
  wordTimestamps,
  showSafeZone = false,
  captionStyle = 'vox-editorial',
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Slow, cinematic 3D camera push
  const cameraScale = interpolate(frame, [0, durationInFrames], [1, 1.07], {
    extrapolateRight: 'clamp',
  });
  const cameraPanY = interpolate(frame, [0, durationInFrames], [0, -25], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#05070D', // Deep cinematic void
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* ========================================================
          CINEMATIC BACKGROUND LAYERS (CAMERA SCALED)
         ======================================================== */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${cameraScale}) translateY(${cameraPanY}px)`,
          transformOrigin: 'center center',
        }}
      >
        {/* Subtle Perspective Star/Grid Field */}
        <div
          style={{
            position: 'absolute',
            inset: '-10%',
            backgroundImage: `
              radial-gradient(circle at center, rgba(56, 189, 248, 0.08) 0%, transparent 65%),
              linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 70px 70px, 70px 70px',
            opacity: 0.8,
          }}
        />

        {/* Top-Center Dramatic Spotlight */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '10%',
            width: '80%',
            height: '60%',
            background: 'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.35) 0%, rgba(5, 7, 13, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Primary Spatial Motion Graphic */}
        <TitleHook
          badgeText={badgeText}
          headline={headline}
          subheadline={subheadline}
        />
      </div>

      {/* Voiceover Speech Audio */}
      <Audio src={staticFile(audioPath)} />

      {/* ========================================================
          KINETIC CAPTIONS (SELECTABLE STYLE)
         ======================================================== */}
      {captionStyle === 'vox-editorial' ? (
        <VoxEditorialCaptions wordTimestamps={wordTimestamps} />
      ) : (
        <OpusKaraokeCaptions wordTimestamps={wordTimestamps} />
      )}

      {/* Instagram Safe Zone Guardrail (Toggleable) */}
      <SafeZoneOverlay isVisible={showSafeZone} />
    </AbsoluteFill>
  );
};
