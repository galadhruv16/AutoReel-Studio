import React from 'react';
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { VoxEditorialCaptions } from '../components/captions/VoxEditorialCaptions';
import saraighatData from '../../../public/audio/reel_saraighat.json';

export const SaraighatReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Slow, cinematic 3D camera push
  const cameraScale = interpolate(frame, [0, durationInFrames], [1, 1.05], {
    extrapolateRight: 'clamp',
  });

  // Scene timing thresholds (based on synthesized sentence timestamps)
  // Scene 1: 0 - 180 frames (0.0s - 6.0s) -> "1671: 4,000 Mughal Warships on Brahmaputra"
  // Scene 2: 180 - 435 frames (6.0s - 14.5s) -> The 1km Saraighat Bottleneck Trap
  // Scene 3: 435 - 690 frames (14.5s - 23.0s) -> Dual-Bank Ambush by Agile Bachari Boats
  // Scene 4: 690 - 825 frames (23.0s - 27.5s) -> Imperial Armada Shattered & Trapped
  // Scene 5: 825+ frames (27.5s - end) -> Assam Stood Free & Lachit's Decree

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0C0806',
        color: '#FFFFFF',
        fontFamily: 'Inter, system-ui, sans-serif',
        transform: `scale(${cameraScale})`,
        transformOrigin: 'center center',
      }}
    >
      {/* 1. Dramatic Antique War Atmosphere */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 50% 30%, rgba(225, 29, 72, 0.22) 0%, transparent 65%), radial-gradient(circle at 80% 80%, rgba(245, 158, 11, 0.15) 0%, transparent 55%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.12,
          backgroundImage:
            'linear-gradient(rgba(245, 158, 11, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.3) 1px, transparent 1px)',
          backgroundSize: '70px 70px',
        }}
      />

      {/* 2. Top Header */}
      <div
        style={{
          position: 'absolute',
          top: 140,
          left: 60,
          right: 60,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
          paddingBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: '#E11D48',
              boxShadow: '0 0 12px #E11D48',
            }}
          />
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#F59E0B',
            }}
          >
            Indian History • Naval Warfare
          </span>
        </div>
        <div
          style={{
            fontSize: 20,
            fontFamily: 'monospace',
            color: 'rgba(255, 255, 255, 0.6)',
          }}
        >
          SARAIGHAT • 1671
        </div>
      </div>

      {/* ========================================================
          SCENE 1: THE IMPERIAL ARMADA (Frames 0 - 180)
          "In 1671, four thousand Mughal warships sailed down the Brahmaputra River to conquer Assam."
         ======================================================== */}
      {frame < 185 && (
        <div
          style={{
            position: 'absolute',
            top: 320,
            left: 50,
            right: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: interpolate(frame, [0, 15, 165, 180], [0, 1, 1, 0], { extrapolateRight: 'clamp' }),
          }}
        >
          <div
            style={{
              padding: '8px 26px',
              borderRadius: 30,
              backgroundColor: 'rgba(225, 29, 72, 0.2)',
              border: '1px solid #E11D48',
              color: '#FDA4AF',
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 40,
            }}
          >
            1671: The Imperial Invasion
          </div>

          {/* Tactical Map Card: Brahmaputra River Vector */}
          <div
            style={{
              width: '100%',
              maxWidth: 720,
              backgroundColor: 'rgba(20, 15, 12, 0.9)',
              borderRadius: 24,
              border: '2px solid rgba(245, 158, 11, 0.4)',
              boxShadow: '0 0 50px rgba(0, 0, 0, 0.9)',
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ fontSize: 64 }}>⛵</div>
              <div>
                <div style={{ fontSize: 38, fontWeight: 900, color: '#F59E0B' }}>4,000 Warships</div>
                <div style={{ fontSize: 20, color: '#E2E8F0', marginTop: 4 }}>Mughal Imperial Heavy Fleet</div>
                <div style={{ fontSize: 16, color: '#E11D48', fontFamily: 'monospace', marginTop: 4 }}>
                  Commander: Ram Singh
                </div>
              </div>
            </div>

            {/* River Advance Vector */}
            <div
              style={{
                marginTop: 30,
                width: '100%',
                padding: '16px 24px',
                borderRadius: 14,
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px dashed #F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: 20, color: '#F59E0B', fontWeight: 700 }}>Brahmaputra River Fleet Vector</span>
              <span style={{ fontSize: 22, color: '#FFFFFF', fontWeight: 900 }}>EASTWARD ADVANCE →</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SCENE 2: THE 1KM SARAIGHAT BOTTLENECK TRAP (Frames 180 - 435)
          "On open ground the imperial army was unbeatable. So General Lachit Borphukan lured them into the Saraighat gorge..."
         ======================================================== */}
      {frame >= 180 && frame < 440 && (
        <div
          style={{
            position: 'absolute',
            top: 300,
            left: 50,
            right: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: interpolate(frame, [180, 195, 420, 435], [0, 1, 1, 0], { extrapolateRight: 'clamp' }),
          }}
        >
          <div
            style={{
              padding: '6px 22px',
              borderRadius: 20,
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid #F59E0B',
              color: '#F59E0B',
              fontSize: 22,
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: 30,
            }}
          >
            The Tactical Choke Point
          </div>

          {/* Canyon Gorge Diagram */}
          <div
            style={{
              width: '100%',
              maxWidth: 720,
              backgroundColor: 'rgba(20, 12, 10, 0.95)',
              borderRadius: 24,
              border: '2px solid #E11D48',
              boxShadow: '0 0 60px rgba(225, 29, 72, 0.3)',
              padding: 30,
              position: 'relative',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#FFFFFF' }}>Saraighat River Gorge</div>
              <div style={{ fontSize: 18, color: '#F59E0B', marginTop: 4 }}>Narrowed to Barely 1 Kilometer</div>
            </div>

            {/* Topographic Visual: Canyon Walls Squeezing River */}
            <div style={{ display: 'flex', alignItems: 'center', height: 160, position: 'relative' }}>
              {/* North Bank Cliffs */}
              <div
                style={{
                  width: '30%',
                  height: '100%',
                  backgroundColor: '#2A1810',
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#A1A1AA',
                  fontWeight: 800,
                  fontSize: 18,
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                North Cliff Bank
              </div>

              {/* Squeezed Rapid River Gorge */}
              <div
                style={{
                  flex: 1,
                  height: '60%',
                  backgroundColor: 'rgba(225, 29, 72, 0.2)',
                  borderTop: '3px dashed #E11D48',
                  borderBottom: '3px dashed #E11D48',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <span style={{ fontSize: 22, fontWeight: 900, color: '#E11D48' }}>CURRENT: 8.5 KNOTS</span>
                <span style={{ fontSize: 14, color: '#FDA4AF', marginTop: 2 }}>Heavy Warships Jammed</span>
              </div>

              {/* South Bank Cliffs */}
              <div
                style={{
                  width: '30%',
                  height: '100%',
                  backgroundColor: '#2A1810',
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#A1A1AA',
                  fontWeight: 800,
                  fontSize: 18,
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                South Cliff Bank
              </div>
            </div>

            <div
              style={{
                marginTop: 20,
                textAlign: 'center',
                fontSize: 18,
                color: '#E2E8F0',
                fontWeight: 600,
              }}
            >
              Lachit knew the unwieldy Mughal behemoths could not maneuver in tight rapids.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SCENE 3: DUAL-BANK AMBUSH BY BACHARI BOATS (Frames 435 - 690)
          "As the massive Mughal fleet choked in the rapids, agile Assamese war boats launched a devastating ambush from both banks."
         ======================================================== */}
      {frame >= 435 && frame < 695 && (
        <div
          style={{
            position: 'absolute',
            top: 290,
            left: 50,
            right: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: interpolate(frame, [435, 450, 680, 695], [0, 1, 1, 0], { extrapolateRight: 'clamp' }),
          }}
        >
          <div
            style={{
              padding: '6px 24px',
              borderRadius: 20,
              backgroundColor: 'rgba(225, 29, 72, 0.2)',
              border: '2px solid #E11D48',
              color: '#FDA4AF',
              fontSize: 22,
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: 30,
            }}
          >
            The Pincer Ambush
          </div>

          {/* Combat Comparison Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, width: '100%' }}>
            {/* Mughal Fleet */}
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '2px solid #EF4444',
                borderRadius: 20,
                padding: 24,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 44 }}>🚢</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#EF4444', marginTop: 8 }}>Mughal Flagships</div>
              <div style={{ fontSize: 16, color: '#FCA5A5', marginTop: 4 }}>Heavy, Slow, Immobile in Rapids</div>
              <div
                style={{
                  marginTop: 14,
                  padding: '6px 12px',
                  borderRadius: 10,
                  backgroundColor: 'rgba(239, 68, 68, 0.3)',
                  fontSize: 15,
                  fontWeight: 800,
                  color: '#FFFFFF',
                }}
              >
                CHOKED IN GORGE
              </div>
            </div>

            {/* Ahom Bachari War-Boats */}
            <div
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                border: '2px solid #F59E0B',
                borderRadius: 20,
                padding: 24,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 44 }}>🚣‍♂️</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#F59E0B', marginTop: 8 }}>Assamese Bacharis</div>
              <div style={{ fontSize: 16, color: '#FEF08A', marginTop: 4 }}>Light, Rapid, Twin-Bank Ambush</div>
              <div
                style={{
                  marginTop: 14,
                  padding: '6px 12px',
                  borderRadius: 10,
                  backgroundColor: 'rgba(245, 158, 11, 0.3)',
                  fontSize: 15,
                  fontWeight: 800,
                  color: '#FFFFFF',
                }}
              >
                TACTICAL PINCH ATTACK
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 30,
              padding: '16px 30px',
              backgroundColor: 'rgba(20, 15, 12, 0.9)',
              borderRadius: 16,
              border: '1px solid rgba(245, 158, 11, 0.4)',
              fontSize: 22,
              fontWeight: 700,
              color: '#F59E0B',
              textAlign: 'center',
            }}
          >
            Lachit personally led the vanguard assault from his sickbed.
          </div>
        </div>
      )}

      {/* ========================================================
          SCENE 4: TOTAL ARMADA ANNIHILATION (Frames 690 - 825)
          "Trapped and helpless, the imperial armada was shattered."
         ======================================================== */}
      {frame >= 690 && frame < 830 && (
        <div
          style={{
            position: 'absolute',
            top: 310,
            left: 50,
            right: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: interpolate(frame, [690, 705, 815, 830], [0, 1, 1, 0], { extrapolateRight: 'clamp' }),
          }}
        >
          <div
            style={{
              padding: '8px 24px',
              borderRadius: 30,
              backgroundColor: 'rgba(225, 29, 72, 0.25)',
              border: '2px solid #E11D48',
              color: '#FDA4AF',
              fontSize: 24,
              fontWeight: 900,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 40,
            }}
          >
            Imperial Defeat
          </div>

          <div
            style={{
              width: '100%',
              maxWidth: 720,
              backgroundColor: 'rgba(25, 12, 10, 0.9)',
              borderRadius: 24,
              border: '2px solid #E11D48',
              padding: 36,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 60 }}>⚔️</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#FFFFFF', marginTop: 10 }}>
              The Armada Shattered
            </div>
            <div style={{ fontSize: 20, color: '#FDA4AF', marginTop: 8 }}>
              Mughal Admirals Retreat • Thousands of Vessels Captured or Sunk
            </div>

            <div
              style={{
                marginTop: 30,
                display: 'flex',
                justifyContent: 'center',
                gap: 20,
              }}
            >
              <div
                style={{
                  padding: '12px 24px',
                  borderRadius: 14,
                  backgroundColor: 'rgba(225, 29, 72, 0.3)',
                  color: '#FFFFFF',
                  fontFamily: 'monospace',
                  fontSize: 18,
                  fontWeight: 800,
                }}
              >
                MUGHAL ADVANCE HALTED
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SCENE 5: ASSAM STOOD FREE & LACHIT'S DECREE (Frames 825 - End)
          "Assam stood free."
         ======================================================== */}
      {frame >= 825 && (
        <div
          style={{
            position: 'absolute',
            top: 320,
            left: 50,
            right: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: interpolate(frame, [825, 845], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: '50%',
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              border: '3px solid #F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 50px rgba(245, 158, 11, 0.5)',
              marginBottom: 30,
            }}
          >
            <span style={{ fontSize: 60 }}>🛡️</span>
          </div>

          <div
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: '#FFFFFF',
              textAlign: 'center',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            Assam Stood Free
          </div>
          <div
            style={{
              fontSize: 26,
              color: '#F59E0B',
              marginTop: 16,
              fontWeight: 700,
              textAlign: 'center',
              fontStyle: 'italic',
            }}
          >
            "My uncle is not greater than my country."
          </div>
          <div
            style={{
              marginTop: 30,
              fontFamily: 'monospace',
              fontSize: 20,
              color: '#E2E8F0',
              padding: '10px 24px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              borderRadius: 20,
              border: '1px solid #F59E0B',
            }}
          >
            General Lachit Borphukan • 1671
          </div>
        </div>
      )}

      {/* 3. Audio & Synced Kinetic Captions */}
      <Audio src={staticFile('audio/reel_saraighat.mp3')} />
      <VoxEditorialCaptions
        wordTimestamps={saraighatData.wordTimestamps}
        accentColor="#F59E0B"
      />
    </AbsoluteFill>
  );
};
