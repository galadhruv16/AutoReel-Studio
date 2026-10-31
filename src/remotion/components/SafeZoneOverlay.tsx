import React from 'react';
import { AbsoluteFill } from 'remotion';

/**
 * Instagram Safe Zone Guardrail:
 * Vertical 9:16 Canvas = 1080 x 1920 px
 * - Top Safe Margin: 160px (Header / status bar)
 * - Bottom Safe Margin: 480px (Handle, captions, sound icon)
 * - Right Safe Margin: 160px (Like, comment, share buttons)
 */
export const SafeZoneOverlay: React.FC<{ isVisible?: boolean }> = ({ isVisible = false }) => {
  if (!isVisible) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 100 }}>
      {/* Top Danger Zone (Instagram Header) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 160,
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          borderBottom: '2px dashed rgba(239, 68, 68, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f87171',
          fontSize: 24,
          fontFamily: 'sans-serif',
          fontWeight: 600,
        }}
      >
        Instagram Header Overlay Area (160px)
      </div>

      {/* Right Danger Zone (Interaction Buttons) */}
      <div
        style={{
          position: 'absolute',
          top: 160,
          right: 0,
          bottom: 480,
          width: 160,
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          borderLeft: '2px dashed rgba(239, 68, 68, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          writingMode: 'vertical-rl',
          color: '#f87171',
          fontSize: 22,
          fontFamily: 'sans-serif',
          fontWeight: 600,
        }}
      >
        Actions (Like/Share) Area
      </div>

      {/* Bottom Danger Zone (Handle & Caption) */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 480,
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          borderTop: '2px dashed rgba(239, 68, 68, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f87171',
          fontSize: 26,
          fontFamily: 'sans-serif',
          fontWeight: 600,
        }}
      >
        Instagram Handle & Caption Overlay Area (480px)
      </div>

      {/* Center Safe Zone Outline */}
      <div
        style={{
          position: 'absolute',
          top: 160,
          left: 40,
          right: 160,
          bottom: 480,
          border: '2px solid rgba(34, 197, 94, 0.5)',
          borderRadius: 24,
          boxSizing: 'border-box',
        }}
      />
    </AbsoluteFill>
  );
};
