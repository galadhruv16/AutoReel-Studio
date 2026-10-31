import React from 'react';
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { VoxEditorialCaptions } from '../components/captions/VoxEditorialCaptions';
import geneticsData from '../../../public/audio/reel_genetics.json';

export const GeneticsReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Subtle continuous cinematic camera push
  const cameraScale = interpolate(frame, [0, durationInFrames], [1, 1.05], {
    extrapolateRight: 'clamp',
  });

  // Scene timing thresholds (based on synthesized sentence timestamps)
  // Scene 1: 0 - 135 frames (0.0s - 4.5s) -> Hook & Mystery
  // Scene 2: 135 - 405 frames (4.5s - 13.5s) -> 1866 Parental Cross & Hidden Recessive
  // Scene 3: 405 - 675 frames (13.5s - 22.5s) -> 16-Cell Punnett Recombination Matrix
  // Scene 4: 675 - 825 frames (22.5s - 27.5s) -> 9:3:3:1 Phenotypic Ratio Explosion
  // Scene 5: 825+ frames (27.5s - end) -> Law of Independent Assortment Seal

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#050E09',
        color: '#FFFFFF',
        fontFamily: 'Inter, system-ui, sans-serif',
        transform: `scale(${cameraScale})`,
        transformOrigin: 'center center',
      }}
    >
      {/* 1. Dynamic Biological Grid Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 50% 25%, rgba(16, 185, 129, 0.18) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(5, 150, 105, 0.12) 0%, transparent 50%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.15,
          backgroundImage:
            'linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* 2. Top Editorial Header */}
      <div
        style={{
          position: 'absolute',
          top: 140,
          left: 60,
          right: 60,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(16, 185, 129, 0.3)',
          paddingBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 12px #10B981',
            }}
          />
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#34D399',
            }}
          >
            Genetics • Dihybrid Cross
          </span>
        </div>
        <div
          style={{
            fontSize: 20,
            fontFamily: 'monospace',
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          MENDEL • 1866
        </div>
      </div>

      {/* ========================================================
          SCENE 1: HOOK & MYSTERY (Frames 0 - 135)
          "Why do two yellow round peas produce wrinkled green offspring?"
         ======================================================== */}
      {frame < 140 && (
        <div
          style={{
            position: 'absolute',
            top: 360,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: interpolate(frame, [0, 15, 120, 135], [0, 1, 1, 0], { extrapolateRight: 'clamp' }),
          }}
        >
          {/* Big Hook Tag */}
          <div
            style={{
              padding: '8px 24px',
              borderRadius: 30,
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10B981',
              color: '#10B981',
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 40,
            }}
          >
            The Genetic Paradox
          </div>

          {/* Two Colliding Parent Peas */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 80, width: '100%' }}>
            {/* Yellow Round Pea */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transform: `translateX(${interpolate(frame, [0, 30], [-100, 0], { extrapolateRight: 'clamp' })}px)`,
              }}
            >
              <div
                style={{
                  width: 170,
                  height: 170,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 35%, #FDE047 0%, #EAB308 60%, #CA8A04 100%)',
                  boxShadow: '0 0 45px rgba(234, 179, 8, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: 32, fontWeight: 900, color: '#713F12', fontFamily: 'monospace' }}>YYRR</span>
              </div>
              <span style={{ marginTop: 20, fontSize: 24, fontWeight: 700, color: '#FDE047' }}>Yellow Round</span>
            </div>

            {/* Cross Symbol */}
            <div
              style={{
                fontSize: 56,
                fontWeight: 900,
                color: '#10B981',
                transform: `scale(${interpolate(frame, [15, 30], [0, 1], { extrapolateRight: 'clamp' })})`,
              }}
            >
              ×
            </div>

            {/* Green Wrinkled Pea */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transform: `translateX(${interpolate(frame, [0, 30], [100, 0], { extrapolateRight: 'clamp' })}px)`,
              }}
            >
              <div
                style={{
                  width: 170,
                  height: 170,
                  borderRadius: '42% 58% 55% 45% / 48% 42% 58% 52%',
                  background: 'radial-gradient(circle at 35% 35%, #4ADE80 0%, #16A34A 60%, #14532D 100%)',
                  boxShadow: '0 0 45px rgba(22, 163, 74, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: 32, fontWeight: 900, color: '#052E16', fontFamily: 'monospace' }}>yyrr</span>
              </div>
              <span style={{ marginTop: 20, fontSize: 24, fontWeight: 700, color: '#4ADE80' }}>Green Wrinkled</span>
            </div>
          </div>

          {/* Question Callout */}
          <div
            style={{
              marginTop: 60,
              padding: '16px 36px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 16,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: 26,
              color: '#E2E8F0',
              fontWeight: 600,
            }}
          >
            P-Generation Parent Cross
          </div>
        </div>
      )}

      {/* ========================================================
          SCENE 2: F1 GENERATION & HIDDEN RECESSIVE ALLELE (Frames 135 - 405)
          "In 1866 Mendel crossed yellow round with green wrinkled... every first-gen child was yellow round... green was hiding."
         ======================================================== */}
      {frame >= 135 && frame < 410 && (
        <div
          style={{
            position: 'absolute',
            top: 320,
            left: 60,
            right: 60,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: interpolate(
              frame,
              [135, 150, 395, 410],
              [0, 1, 1, 0],
              { extrapolateRight: 'clamp' }
            ),
          }}
        >
          <div
            style={{
              padding: '6px 20px',
              borderRadius: 20,
              backgroundColor: 'rgba(234, 179, 8, 0.2)',
              border: '1px solid #EAB308',
              color: '#FDE047',
              fontSize: 22,
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: 30,
            }}
          >
            F1 Generation Result: 100% Yellow
          </div>

          {/* Central F1 Pea with Chromosome Core */}
          <div style={{ position: 'relative', width: 280, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Outer Visible Shell */}
            <div
              style={{
                width: 240,
                height: 240,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, #FDE047 0%, #EAB308 60%, #854D0E 100%)',
                boxShadow: '0 0 60px rgba(234, 179, 8, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <span style={{ fontSize: 44, fontWeight: 900, color: '#422006', fontFamily: 'monospace' }}>YyRr</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#713F12', marginTop: 4 }}>Phenotype: Yellow Round</span>
            </div>

            {/* Glowing Orbit Rings */}
            <div
              style={{
                position: 'absolute',
                inset: -20,
                borderRadius: '50%',
                border: '2px dashed rgba(16, 185, 129, 0.6)',
                transform: `rotate(${frame * 0.8}deg)`,
              }}
            />
          </div>

          {/* Hidden Recessive Trait Revelation Box */}
          <div
            style={{
              marginTop: 40,
              width: '100%',
              backgroundColor: 'rgba(10, 20, 15, 0.8)',
              borderRadius: 20,
              border: '1px solid rgba(16, 185, 129, 0.4)',
              padding: '24px 30px',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, color: '#94A3B8', fontWeight: 600 }}>Dominant Alleles</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#FDE047', marginTop: 4 }}>Y (Color) + R (Shape)</div>
              <div style={{ fontSize: 18, color: '#CBD5E1', marginTop: 2 }}>Visibly Expressed</div>
            </div>
            <div style={{ width: 1, height: 60, backgroundColor: 'rgba(255, 255, 255, 0.15)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, color: '#34D399', fontWeight: 600 }}>Hidden Recessive</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#4ADE80', marginTop: 4 }}>y (Green) + r (Wrinkled)</div>
              <div style={{ fontSize: 18, color: '#10B981', marginTop: 2 }}>Latent in DNA</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SCENE 3: THE 16-CELL RECOMBINATION MATRIX (Frames 405 - 675)
          "In the F2 generation, alleles recombined into a sixteen-cell matrix."
         ======================================================== */}
      {frame >= 405 && frame < 675 && (
        <div
          style={{
            position: 'absolute',
            top: 280,
            left: 40,
            right: 40,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: interpolate(
              frame,
              [405, 420, 660, 675],
              [0, 1, 1, 0],
              { extrapolateRight: 'clamp' }
            ),
          }}
        >
          <div
            style={{
              padding: '6px 20px',
              borderRadius: 20,
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid #10B981',
              color: '#34D399',
              fontSize: 22,
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            F2 Dihybrid Matrix (4 × 4)
          </div>

          {/* Punnett Square Table */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 12,
              width: '100%',
              maxWidth: 720,
              padding: 16,
              backgroundColor: 'rgba(5, 15, 10, 0.9)',
              borderRadius: 24,
              border: '2px solid rgba(16, 185, 129, 0.4)',
              boxShadow: '0 0 50px rgba(0, 0, 0, 0.8)',
            }}
          >
            {/* 16 Cells corresponding to 9 Yellow Round, 3 Green Round, 3 Yellow Wrinkled, 1 Green Wrinkled */}
            {[
              { type: 'YR', bg: '#EAB308', text: '#713F12', label: 'Yellow Round', code: 'YYRR' },
              { type: 'YR', bg: '#EAB308', text: '#713F12', label: 'Yellow Round', code: 'YYRr' },
              { type: 'YR', bg: '#EAB308', text: '#713F12', label: 'Yellow Round', code: 'YyRR' },
              { type: 'YR', bg: '#EAB308', text: '#713F12', label: 'Yellow Round', code: 'YyRr' },

              { type: 'YR', bg: '#EAB308', text: '#713F12', label: 'Yellow Round', code: 'YYRr' },
              { type: 'Yw', bg: '#F59E0B', text: '#78350F', label: 'Yellow Wrinkled', code: 'YYrr' },
              { type: 'YR', bg: '#EAB308', text: '#713F12', label: 'Yellow Round', code: 'YyRr' },
              { type: 'Yw', bg: '#F59E0B', text: '#78350F', label: 'Yellow Wrinkled', code: 'Yyrr' },

              { type: 'YR', bg: '#EAB308', text: '#713F12', label: 'Yellow Round', code: 'YyRR' },
              { type: 'YR', bg: '#EAB308', text: '#713F12', label: 'Yellow Round', code: 'YyRr' },
              { type: 'GR', bg: '#22C55E', text: '#052E16', label: 'Green Round', code: 'yyRR' },
              { type: 'GR', bg: '#22C55E', text: '#052E16', label: 'Green Round', code: 'yyRr' },

              { type: 'YR', bg: '#EAB308', text: '#713F12', label: 'Yellow Round', code: 'YyRr' },
              { type: 'Yw', bg: '#F59E0B', text: '#78350F', label: 'Yellow Wrinkled', code: 'Yyrr' },
              { type: 'GR', bg: '#22C55E', text: '#052E16', label: 'Green Round', code: 'yyRr' },
              { type: 'Gw', bg: '#10B981', text: '#022C22', label: 'Green Wrinkled', code: 'yyrr' },
            ].map((cell, idx) => {
              const cellSpring = spring({
                frame: frame - (410 + idx * 4),
                fps,
                config: { damping: 14, stiffness: 120 },
              });

              return (
                <div
                  key={idx}
                  style={{
                    height: 105,
                    borderRadius: 16,
                    backgroundColor: cell.bg,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: cell.text,
                    fontWeight: 800,
                    boxShadow: cell.type === 'Gw' ? '0 0 25px #10B981' : 'none',
                    transform: `scale(${Math.max(0, cellSpring)})`,
                    border: cell.type === 'Gw' ? '3px solid #FFFFFF' : '1px solid rgba(0,0,0,0.15)',
                  }}
                >
                  <span style={{ fontSize: 24, fontFamily: 'monospace' }}>{cell.code}</span>
                  <span style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>{cell.label.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          SCENE 4: 9:3:3:1 PHENOTYPIC RATIO EXPLOSION (Frames 675 - 825)
          "Nine yellow round, three green round, three yellow wrinkled, and one lone green wrinkled pea."
         ======================================================== */}
      {frame >= 675 && frame < 830 && (
        <div
          style={{
            position: 'absolute',
            top: 300,
            left: 50,
            right: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: interpolate(
              frame,
              [675, 690, 815, 830],
              [0, 1, 1, 0],
              { extrapolateRight: 'clamp' }
            ),
          }}
        >
          <div
            style={{
              padding: '8px 26px',
              borderRadius: 30,
              backgroundColor: 'rgba(234, 179, 8, 0.25)',
              border: '2px solid #EAB308',
              color: '#FDE047',
              fontSize: 26,
              fontWeight: 900,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 40,
            }}
          >
            The 9 : 3 : 3 : 1 Phenotype Ratio
          </div>

          {/* 4 Categorized Metric Pedestals */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, width: '100%' }}>
            {/* 1. Yellow Round (9) */}
            <div
              style={{
                backgroundColor: 'rgba(234, 179, 8, 0.15)',
                border: '2px solid #EAB308',
                borderRadius: 24,
                padding: 28,
                display: 'flex',
                alignItems: 'center',
                gap: 24,
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 35%, #FDE047 0%, #CA8A04 100%)',
                  boxShadow: '0 0 25px rgba(234, 179, 8, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 48,
                  fontWeight: 900,
                  color: '#422006',
                }}
              >
                9
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#FDE047' }}>Yellow Round</div>
                <div style={{ fontSize: 18, color: '#E2E8F0', marginTop: 4 }}>Dominant Both</div>
                <div style={{ fontSize: 16, color: '#A1A1AA', fontFamily: 'monospace' }}>56.25% Probability</div>
              </div>
            </div>

            {/* 2. Green Round (3) */}
            <div
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                border: '2px solid #22C55E',
                borderRadius: 24,
                padding: 28,
                display: 'flex',
                alignItems: 'center',
                gap: 24,
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 35%, #4ADE80 0%, #15803D 100%)',
                  boxShadow: '0 0 25px rgba(34, 197, 94, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 48,
                  fontWeight: 900,
                  color: '#052E16',
                }}
              >
                3
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#4ADE80' }}>Green Round</div>
                <div style={{ fontSize: 18, color: '#E2E8F0', marginTop: 4 }}>Recessive Color</div>
                <div style={{ fontSize: 16, color: '#A1A1AA', fontFamily: 'monospace' }}>18.75% Probability</div>
              </div>
            </div>

            {/* 3. Yellow Wrinkled (3) */}
            <div
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                border: '2px solid #F59E0B',
                borderRadius: 24,
                padding: 28,
                display: 'flex',
                alignItems: 'center',
                gap: 24,
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: '40% 60% 55% 45%',
                  background: 'radial-gradient(circle at 35% 35%, #FBBF24 0%, #B45309 100%)',
                  boxShadow: '0 0 25px rgba(245, 158, 11, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 48,
                  fontWeight: 900,
                  color: '#451A03',
                }}
              >
                3
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#FBBF24' }}>Yellow Wrinkled</div>
                <div style={{ fontSize: 18, color: '#E2E8F0', marginTop: 4 }}>Recessive Shape</div>
                <div style={{ fontSize: 16, color: '#A1A1AA', fontFamily: 'monospace' }}>18.75% Probability</div>
              </div>
            </div>

            {/* 4. Green Wrinkled (1) */}
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                border: '2px solid #10B981',
                borderRadius: 24,
                padding: 28,
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                boxShadow: '0 0 35px rgba(16, 185, 129, 0.3)',
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: '35% 65% 60% 40%',
                  background: 'radial-gradient(circle at 35% 35%, #34D399 0%, #064E3B 100%)',
                  boxShadow: '0 0 30px #10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 48,
                  fontWeight: 900,
                  color: '#ECFDF5',
                }}
              >
                1
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#34D399' }}>Green Wrinkled</div>
                <div style={{ fontSize: 18, color: '#E2E8F0', marginTop: 4 }}>Double Recessive</div>
                <div style={{ fontSize: 16, color: '#A1A1AA', fontFamily: 'monospace' }}>6.25% (1 in 16)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SCENE 5: LAW OF INDEPENDENT ASSORTMENT SEAL (Frames 825 - End)
          "That nine-to-three-to-three-to-one ratio proved genes sort independently."
         ======================================================== */}
      {frame >= 825 && (
        <div
          style={{
            position: 'absolute',
            top: 340,
            left: 60,
            right: 60,
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
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              border: '3px solid #10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 50px rgba(16, 185, 129, 0.5)',
              marginBottom: 30,
            }}
          >
            <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>

          <div
            style={{
              fontSize: 44,
              fontWeight: 900,
              color: '#FFFFFF',
              textAlign: 'center',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            Law of Independent Assortment
          </div>
          <div
            style={{
              fontSize: 24,
              color: '#34D399',
              marginTop: 16,
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            Alleles for different traits segregate completely independently during gamete formation.
          </div>
          <div
            style={{
              marginTop: 30,
              fontFamily: 'monospace',
              fontSize: 20,
              color: 'rgba(255, 255, 255, 0.6)',
              padding: '8px 20px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 20,
            }}
          >
            Gregor Mendel • Brünn Natural History Society, 1866
          </div>
        </div>
      )}

      {/* 3. Audio & Synced Kinetic Captions */}
      <Audio src={staticFile('audio/reel_genetics.mp3')} />
      <VoxEditorialCaptions
        wordTimestamps={geneticsData.wordTimestamps}
        accentColor="#10B981"
      />
    </AbsoluteFill>
  );
};
