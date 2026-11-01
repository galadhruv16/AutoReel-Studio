import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from 'remotion';
import { StudioScene } from '../../types/studio';

export interface DynamicStoryReelProps {
  topic: string;
  scenes: StudioScene[];
  captionStyle: 'kinetic' | 'minimal' | 'bold';
  accentColor?: string;
  voiceName?: string;
  audioUrl?: string | null;
}

// =========================================================================
// SUB-COMPONENT: KINETIC TYPOGRAPHY SCENE
// =========================================================================
const KineticTextScene: React.FC<{
  scene: StudioScene;
  accentColor: string;
  topic: string;
}> = ({ scene, accentColor, topic }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 120 },
  });

  const opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const rotate = interpolate(frame, [0, 60], [-1.5, 1.5], { extrapolateRight: 'clamp' });
  const pulse = Math.sin(frame * 0.1) * 6;

  // Split narration into punchy segments
  const words = scene.narration.split(' ');
  const primaryHeadline = words.slice(0, 4).join(' ');
  const secondaryHeadline = words.slice(4, 9).join(' ');
  const remaining = words.slice(9).join(' ');

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 80px',
        opacity,
      }}
    >
      {/* Dynamic Radial Energy Field */}
      <div
        style={{
          position: 'absolute',
          width: 700 + pulse * 10,
          height: 700 + pulse * 10,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accentColor}25 0%, transparent 70%)`,
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      {/* Geometric Decorative Crosshairs */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          border: `1px dashed ${accentColor}40`,
          borderRadius: '50%',
          transform: `rotate(${frame * 0.5}deg)`,
        }}
      />

      {/* Motion Card Container */}
      <div
        style={{
          transform: `scale(${scale}) rotate(${rotate}deg)`,
          textAlign: 'center',
          zIndex: 10,
          maxWidth: 900,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            backgroundColor: `${accentColor}20`,
            border: `1px solid ${accentColor}60`,
            color: accentColor,
            padding: '10px 24px',
            borderRadius: 9999,
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: 32,
            boxShadow: `0 0 25px ${accentColor}30`,
          }}
        >
          {(scene.visualDirection || 'KEY CONCEPT').split(':')[0].slice(0, 24) || 'KEY CONCEPT'}
        </div>

        <h1
          style={{
            fontSize: 84,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: '#FFFFFF',
            textTransform: 'uppercase',
            margin: '0 0 24px 0',
            textShadow: '0 10px 40px rgba(0,0,0,0.8)',
          }}
        >
          {primaryHeadline}{' '}
          <span
            style={{
              color: accentColor,
              textDecoration: 'underline',
              textDecorationColor: accentColor,
            }}
          >
            {secondaryHeadline}
          </span>
        </h1>

        {remaining && (
          <p
            style={{
              fontSize: 36,
              color: '#94A3B8',
              lineHeight: 1.4,
              fontWeight: 500,
              margin: 0,
            }}
          >
            {remaining}
          </p>
        )}
      </div>
    </AbsoluteFill>
  );
};

// =========================================================================
// SUB-COMPONENT: VECTOR SCHEMATIC SCENE
// =========================================================================
const VectorSchematicScene: React.FC<{
  scene: StudioScene;
  accentColor: string;
}> = ({ scene, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const rotation = frame * 0.4;
  const strokeDash = interpolate(frame, [0, 45], [600, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 60px',
      }}
    >
      {/* Center SVG Schematic Animation */}
      <svg
        width="650"
        height="650"
        viewBox="0 0 600 600"
        style={{
          transform: `scale(${scale})`,
          overflow: 'visible',
          filter: `drop-shadow(0 0 30px ${accentColor}35)`,
        }}
      >
        {/* Outer Orbit Ring */}
        <circle
          cx="300"
          cy="300"
          r="260"
          fill="none"
          stroke={`${accentColor}30`}
          strokeWidth="2"
          strokeDasharray="8 8"
          transform={`rotate(${rotation} 300 300)`}
        />

        {/* Outer Hexagon Boundary */}
        <polygon
          points="300,70 490,180 490,420 300,530 110,420 110,180"
          fill="none"
          stroke={accentColor}
          strokeWidth="3"
          strokeDasharray="1200"
          strokeDashoffset={strokeDash}
        />

        {/* Inner Tech Ring with Ticks */}
        <circle
          cx="300"
          cy="300"
          r="160"
          fill="none"
          stroke="#EDEDED"
          strokeWidth="2"
          strokeDasharray="4 20"
          transform={`rotate(${-rotation * 1.5} 300 300)`}
        />

        {/* Central Pulsing Core */}
        <circle
          cx="300"
          cy="300"
          r="60"
          fill={`${accentColor}20`}
          stroke={accentColor}
          strokeWidth="4"
        />
        <circle
          cx="300"
          cy="300"
          r={25 + Math.sin(frame * 0.15) * 5}
          fill={accentColor}
        />

        {/* Diagonal Vector Ray Lines */}
        <line x1="110" y1="180" x2="490" y2="420" stroke={`${accentColor}40`} strokeWidth="1.5" />
        <line x1="490" y1="180" x2="110" y2="420" stroke={`${accentColor}40`} strokeWidth="1.5" />

        {/* Telemetry Corner Accents */}
        <text x="130" y="160" fill="#94A3B8" fontSize="16" fontFamily="monospace">SCHEMATIC_REF // 0{scene.index}</text>
        <text x="350" y="460" fill={accentColor} fontSize="16" fontFamily="monospace">VECTOR_ACTIVE: 60FPS</text>
      </svg>

      {/* Schematic Headline Label */}
      <div
        style={{
          marginTop: 50,
          textAlign: 'center',
          maxWidth: 850,
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontFamily: 'monospace',
            color: accentColor,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: 12,
          }}
        >
          {(scene.visualDirection || 'ARCHITECTURAL SCHEMATIC').split(':')[0] || 'ARCHITECTURAL SCHEMATIC'}
        </span>
        <h2
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.2,
            margin: 0,
            textShadow: '0 6px 25px rgba(0,0,0,0.9)',
          }}
        >
          {scene.narration}
        </h2>
      </div>
    </AbsoluteFill>
  );
};

// =========================================================================
// SUB-COMPONENT: CROSSHAIR TARGETING SCENE
// =========================================================================
const CrosshairTargetScene: React.FC<{
  scene: StudioScene;
  accentColor: string;
}> = ({ scene, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lockProgress = spring({ frame, fps, config: { damping: 10, mass: 0.5, stiffness: 140 } });
  const bracketSpread = interpolate(lockProgress, [0, 1], [180, 80]);
  const radarAngle = (frame * 3) % 360;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 70px',
      }}
    >
      {/* Target Reticle Viewport */}
      <div
        style={{
          position: 'relative',
          width: 550,
          height: 550,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Radar Sweep Arc */}
        <div
          style={{
            position: 'absolute',
            inset: 20,
            borderRadius: '50%',
            background: `conic-gradient(from ${radarAngle}deg, ${accentColor}40 0deg, transparent 60deg)`,
            border: `2px solid ${accentColor}30`,
          }}
        />

        {/* Concentric Calibration Rings */}
        <div
          style={{
            position: 'absolute',
            width: 320,
            height: 320,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 160,
            height: 160,
            borderRadius: '50%',
            border: `2px solid ${accentColor}50`,
          }}
        />

        {/* Center Target Point */}
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: accentColor,
            boxShadow: `0 0 25px ${accentColor}`,
          }}
        />

        {/* 4 Precision Corner Brackets (Locking In) */}
        {/* Top-Left */}
        <div
          style={{
            position: 'absolute',
            top: 275 - bracketSpread,
            left: 275 - bracketSpread,
            width: 40,
            height: 40,
            borderTop: `4px solid ${accentColor}`,
            borderLeft: `4px solid ${accentColor}`,
          }}
        />
        {/* Top-Right */}
        <div
          style={{
            position: 'absolute',
            top: 275 - bracketSpread,
            right: 275 - bracketSpread,
            width: 40,
            height: 40,
            borderTop: `4px solid ${accentColor}`,
            borderRight: `4px solid ${accentColor}`,
          }}
        />
        {/* Bottom-Left */}
        <div
          style={{
            position: 'absolute',
            bottom: 275 - bracketSpread,
            left: 275 - bracketSpread,
            width: 40,
            height: 40,
            borderBottom: `4px solid ${accentColor}`,
            borderLeft: `4px solid ${accentColor}`,
          }}
        />
        {/* Bottom-Right */}
        <div
          style={{
            position: 'absolute',
            bottom: 275 - bracketSpread,
            right: 275 - bracketSpread,
            width: 40,
            height: 40,
            borderBottom: `4px solid ${accentColor}`,
            borderRight: `4px solid ${accentColor}`,
          }}
        />

        {/* Crosshair Horizontal & Vertical Laser Lines */}
        <div
          style={{
            position: 'absolute',
            left: 40,
            right: 40,
            height: 1.5,
            backgroundColor: `${accentColor}40`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 40,
            bottom: 40,
            width: 1.5,
            backgroundColor: `${accentColor}40`,
          }}
        />
      </div>

      {/* Target Status readout */}
      <div
        style={{
          marginTop: 40,
          textAlign: 'center',
          maxWidth: 850,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            backgroundColor: '#14161F',
            border: `1px solid ${accentColor}60`,
            padding: '8px 20px',
            borderRadius: 9999,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 10px #10B981',
            }}
          />
          <span style={{ fontSize: 18, fontFamily: 'monospace', color: '#EDEDED' }}>
            TARGET_ACQUIRED // FOCUS POINT 0{scene.index}
          </span>
        </div>

        <h2
          style={{
            fontSize: 50,
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.25,
            margin: 0,
          }}
        >
          {scene.narration}
        </h2>
      </div>
    </AbsoluteFill>
  );
};

// =========================================================================
// SUB-COMPONENT: SPLIT COMPARISON SCENE
// =========================================================================
const SplitComparisonScene: React.FC<{
  scene: StudioScene;
  accentColor: string;
}> = ({ scene, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardOffset = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const leftX = interpolate(cardOffset, [0, 1], [-200, 0]);
  const rightX = interpolate(cardOffset, [0, 1], [200, 0]);

  const words = scene.narration.split(' ');
  const mid = Math.ceil(words.length / 2);
  const leftText = words.slice(0, mid).join(' ');
  const rightText = words.slice(mid).join(' ');

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 50px',
      }}
    >
      {/* Split Comparison Dual Deck */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 30,
          width: '100%',
          maxWidth: 950,
          marginBottom: 40,
        }}
      >
        {/* Left Side: Thesis / Pre-Condition */}
        <div
          style={{
            transform: `translateX(${leftX}px)`,
            backgroundColor: '#14161F',
            border: '2px solid #232634',
            borderRadius: 32,
            padding: 40,
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              backgroundColor: '#64748B',
            }}
          />
          <span
            style={{
              fontSize: 20,
              fontFamily: 'monospace',
              color: '#94A3B8',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 20,
            }}
          >
            STATE A // THESIS
          </span>
          <p
            style={{
              fontSize: 38,
              fontWeight: 700,
              color: '#EDEDED',
              lineHeight: 1.3,
              margin: 0,
            }}
          >
            {leftText}
          </p>
        </div>

        {/* Right Side: Mechanism / Synthesis */}
        <div
          style={{
            transform: `translateX(${rightX}px)`,
            backgroundColor: '#14161F',
            border: `2px solid ${accentColor}`,
            borderRadius: 32,
            padding: 40,
            boxShadow: `0 20px 50px ${accentColor}25`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              backgroundColor: accentColor,
            }}
          />
          <span
            style={{
              fontSize: 20,
              fontFamily: 'monospace',
              color: accentColor,
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 20,
            }}
          >
            STATE B // RESOLUTION
          </span>
          <p
            style={{
              fontSize: 38,
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.3,
              margin: 0,
            }}
          >
            {rightText}
          </p>
        </div>
      </div>

      {/* Center Dividing Beam Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          backgroundColor: '#08090A',
          border: `1px solid ${accentColor}40`,
          borderRadius: 9999,
          padding: '10px 28px',
        }}
      >
        <span style={{ fontSize: 22, fontWeight: 800, color: accentColor }}>VS</span>
        <span style={{ fontSize: 18, fontFamily: 'monospace', color: '#94A3B8' }}>
          COMPARATIVE MECHANISM
        </span>
      </div>
    </AbsoluteFill>
  );
};

// =========================================================================
// SUB-COMPONENT: PROCESS FLOW / PIPELINE SCENE
// =========================================================================
const ProcessFlowScene: React.FC<{
  scene: StudioScene;
  accentColor: string;
}> = ({ scene, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const nodeCount = 3;
  const activeNode = Math.floor((frame / (fps * 1.2)) % nodeCount);
  const pulseX = interpolate(frame % (fps * 1.5), [0, fps * 1.5], [100, 800]);

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 60px',
      }}
    >
      {/* 3 Connected Pipeline Nodes */}
      <div
        style={{
          position: 'relative',
          width: 850,
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 60,
        }}
      >
        {/* Connecting Data Rail */}
        <div
          style={{
            position: 'absolute',
            left: 60,
            right: 60,
            height: 4,
            backgroundColor: '#232634',
          }}
        />

        {/* Animated Traveling Energy Pulse */}
        <div
          style={{
            position: 'absolute',
            left: pulseX,
            width: 30,
            height: 12,
            borderRadius: 6,
            backgroundColor: accentColor,
            boxShadow: `0 0 20px ${accentColor}`,
            transform: 'translateY(-4px)',
          }}
        />

        {/* Steps 1, 2, 3 */}
        {[0, 1, 2].map((stepIdx) => {
          const isActive = stepIdx <= activeNode;
          const isCurrent = stepIdx === activeNode;
          return (
            <div
              key={stepIdx}
              style={{
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 28,
                  backgroundColor: isCurrent ? accentColor : isActive ? '#14161F' : '#08090A',
                  border: `3px solid ${isActive ? accentColor : '#232634'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 34,
                  fontWeight: 900,
                  color: isCurrent ? '#FFFFFF' : isActive ? accentColor : '#64748B',
                  boxShadow: isCurrent ? `0 0 35px ${accentColor}60` : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                0{stepIdx + 1}
              </div>
              <span
                style={{
                  marginTop: 14,
                  fontSize: 16,
                  fontFamily: 'monospace',
                  color: isActive ? '#EDEDED' : '#64748B',
                  fontWeight: 600,
                }}
              >
                STAGE 0{stepIdx + 1}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Narrative Explanation */}
      <div
        style={{
          textAlign: 'center',
          maxWidth: 850,
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontFamily: 'monospace',
            color: accentColor,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: 16,
          }}
        >
          {(scene.visualDirection || 'SEQUENTIAL EXECUTION PIPELINE').split(':')[0] || 'SEQUENTIAL EXECUTION PIPELINE'}
        </span>
        <h2
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.25,
            margin: 0,
          }}
        >
          {scene.narration}
        </h2>
      </div>
    </AbsoluteFill>
  );
};

// =========================================================================
// SUB-COMPONENT: DYNAMIC METRIC & BAR CHART SCENE
// =========================================================================
const DynamicChartScene: React.FC<{
  scene: StudioScene;
  accentColor: string;
}> = ({ scene, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const grow = spring({ frame, fps, config: { damping: 12, mass: 0.6, stiffness: 100 } });
  const count1 = Math.round(interpolate(frame, [0, 25], [0, 84], { extrapolateRight: 'clamp' }));
  const count2 = Math.round(interpolate(frame, [0, 30], [0, 310], { extrapolateRight: 'clamp' }));

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 80px',
      }}
    >
      {/* Background Metric Glow */}
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accentColor}20 0%, transparent 70%)`,
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Chart Card */}
      <div
        style={{
          width: 760,
          backgroundColor: '#14161F',
          border: '1px solid #232634',
          borderRadius: 36,
          padding: '48px 40px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top Metric Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
          <div>
            <span
              style={{
                fontSize: 18,
                fontFamily: 'monospace',
                color: accentColor,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 8,
              }}
            >
              {(scene.visualDirection || 'METRIC ANALYSIS').split(':')[0].slice(0, 24)}
            </span>
            <div style={{ fontSize: 56, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.03em' }}>
              +{count2}% <span style={{ fontSize: 24, fontWeight: 700, color: '#10B981' }}>IMPACT</span>
            </div>
          </div>
          <div
            style={{
              backgroundColor: '#08090A',
              border: `1px solid ${accentColor}40`,
              borderRadius: 14,
              padding: '8px 16px',
              color: accentColor,
              fontFamily: 'monospace',
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            INDEX // 0{scene.index}
          </div>
        </div>

        {/* Animated Bar Chart SVG */}
        <div style={{ height: 260, position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 20px 20px 20px' }}>
          {/* Baseline Gridlines */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 40, borderTop: '1px dashed #232634' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 120, borderTop: '1px dashed #232634' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 20, borderTop: '2px solid #33384B' }} />

          {/* Bar 1: Baseline */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, width: 140 }}>
            <span style={{ fontSize: 20, fontFamily: 'monospace', color: '#94A3B8', marginBottom: 12, fontWeight: 700 }}>
              {Math.round(24 * grow)}%
            </span>
            <div
              style={{
                width: 100,
                height: 180 * 0.28 * grow,
                backgroundColor: '#232634',
                borderRadius: '12px 12px 0 0',
                border: '1px solid #33384B',
              }}
            />
            <span style={{ fontSize: 16, fontFamily: 'monospace', color: '#64748B', marginTop: 14 }}>BASELINE</span>
          </div>

          {/* Bar 2: Midpoint */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, width: 140 }}>
            <span style={{ fontSize: 20, fontFamily: 'monospace', color: '#EDEDED', marginBottom: 12, fontWeight: 700 }}>
              {Math.round(58 * grow)}%
            </span>
            <div
              style={{
                width: 100,
                height: 180 * 0.62 * grow,
                backgroundColor: '#38BDF8',
                borderRadius: '12px 12px 0 0',
                boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)',
              }}
            />
            <span style={{ fontSize: 16, fontFamily: 'monospace', color: '#94A3B8', marginTop: 14 }}>ADOPTION</span>
          </div>

          {/* Bar 3: Peak Metric */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, width: 140 }}>
            <span style={{ fontSize: 22, fontFamily: 'monospace', color: accentColor, marginBottom: 12, fontWeight: 900 }}>
              {count1}%
            </span>
            <div
              style={{
                width: 100,
                height: 180 * 0.95 * grow,
                backgroundColor: accentColor,
                borderRadius: '12px 12px 0 0',
                boxShadow: `0 0 35px ${accentColor}70`,
              }}
            />
            <span style={{ fontSize: 16, fontFamily: 'monospace', color: accentColor, marginTop: 14, fontWeight: 800 }}>RESULT</span>
          </div>
        </div>
      </div>

      {/* Main Narrative Subtext */}
      <div style={{ marginTop: 44, textAlign: 'center', maxWidth: 850 }}>
        <h2
          style={{
            fontSize: 50,
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.25,
            margin: 0,
            textShadow: '0 6px 25px rgba(0,0,0,0.9)',
          }}
        >
          {scene.narration}
        </h2>
      </div>
    </AbsoluteFill>
  );
};

// =========================================================================
// SUB-COMPONENT: CHRONOLOGICAL TIMELINE SCENE
// =========================================================================
const TimelineScene: React.FC<{
  scene: StudioScene;
  accentColor: string;
}> = ({ scene, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(frame, [0, 45], [0, 1], { extrapolateRight: 'clamp' });
  const activeMilestone = frame > 40 ? 2 : frame > 20 ? 1 : 0;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 80px',
      }}
    >
      {/* Background Atmosphere */}
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)`,
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* Timeline Eyebrow Badge */}
      <div
        style={{
          backgroundColor: '#14161F',
          border: `1px solid ${accentColor}60`,
          borderRadius: 9999,
          padding: '10px 24px',
          marginBottom: 44,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}` }} />
        <span style={{ fontSize: 20, fontFamily: 'monospace', color: '#EDEDED', letterSpacing: '0.1em' }}>
          CHRONOLOGICAL TIMELINE // EVENT 0{scene.index}
        </span>
      </div>

      {/* Horizontal Milestone Track */}
      <div
        style={{
          width: 780,
          backgroundColor: '#14161F',
          border: '1px solid #232634',
          borderRadius: 36,
          padding: '48px 36px',
          position: 'relative',
          boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
        }}
      >
        {/* Background Track Line */}
        <div
          style={{
            position: 'absolute',
            top: 96,
            left: 70,
            right: 70,
            height: 4,
            backgroundColor: '#232634',
          }}
        />

        {/* Active Laser Progress Line */}
        <div
          style={{
            position: 'absolute',
            top: 96,
            left: 70,
            width: (780 - 140) * progress,
            height: 4,
            backgroundColor: accentColor,
            boxShadow: `0 0 20px ${accentColor}`,
          }}
        />

        {/* 3 Chronological Nodes */}
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 10 }}>
          {[
            { tag: 'GENESIS', label: 'Initial State' },
            { tag: 'TURNING POINT', label: 'Catalyst' },
            { tag: 'OUTCOME', label: 'Current Impact' },
          ].map((milestone, mIdx) => {
            const isReached = mIdx <= activeMilestone;
            const isCurrent = mIdx === activeMilestone;

            return (
              <div key={mIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 180 }}>
                {/* Node Ring */}
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: isCurrent ? accentColor : isReached ? '#14161F' : '#08090A',
                    border: `3px solid ${isReached ? accentColor : '#33384B'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    fontWeight: 900,
                    color: isCurrent ? '#FFFFFF' : isReached ? accentColor : '#64748B',
                    boxShadow: isCurrent ? `0 0 30px ${accentColor}` : 'none',
                    marginBottom: 20,
                  }}
                >
                  0{mIdx + 1}
                </div>

                {/* Milestone Metadata */}
                <span
                  style={{
                    fontSize: 14,
                    fontFamily: 'monospace',
                    color: isReached ? accentColor : '#64748B',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}
                >
                  {milestone.tag}
                </span>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: isReached ? '#FFFFFF' : '#64748B',
                    textAlign: 'center',
                  }}
                >
                  {milestone.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Narrative Explanation */}
      <div style={{ marginTop: 44, textAlign: 'center', maxWidth: 850 }}>
        <h2
          style={{
            fontSize: 50,
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.25,
            margin: 0,
            textShadow: '0 6px 25px rgba(0,0,0,0.9)',
          }}
        >
          {scene.narration}
        </h2>
      </div>
    </AbsoluteFill>
  );
};

// =========================================================================
// SUB-COMPONENT: STEP SEQUENCE (CASCADING TAKEAWAYS)
// =========================================================================
const StepSequenceScene: React.FC<{
  scene: StudioScene;
  accentColor: string;
}> = ({ scene, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = (scene.narration || '').split(' ');
  const chunk1 = words.slice(0, 4).join(' ');
  const chunk2 = words.slice(4, 8).join(' ');
  const chunk3 = words.slice(8).join(' ') || words.slice(0, 3).join(' ');

  const steps = [
    { num: '01', text: chunk1 || 'First Core Principle' },
    { num: '02', text: chunk2 || 'Action & Execution' },
    { num: '03', text: chunk3 || 'Key Structural Takeaway' },
  ];

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 80px',
      }}
    >
      {/* Background Energy Glow */}
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)`,
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      {/* Header Eyebrow */}
      <div
        style={{
          fontSize: 22,
          fontFamily: 'monospace',
          color: accentColor,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: 36,
          textAlign: 'center',
        }}
      >
        {(scene.visualDirection || 'STEP SEQUENCE').split(':')[0].slice(0, 28)}
      </div>

      {/* 3 Cascading Stack Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 780 }}>
        {steps.map((step, sIdx) => {
          const delay = sIdx * 8;
          const enter = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 120 } });
          const cardX = interpolate(enter, [0, 1], [60, 0], { extrapolateRight: 'clamp' });
          const cardOpacity = interpolate(enter, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
          const isFinal = sIdx === 2;

          return (
            <div
              key={sIdx}
              style={{
                transform: `translateX(${cardX}px)`,
                opacity: cardOpacity,
                backgroundColor: isFinal ? '#191C28' : '#14161F',
                border: `1.5px solid ${isFinal ? accentColor : '#232634'}`,
                borderRadius: 24,
                padding: '24px 32px',
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                boxShadow: isFinal ? `0 15px 40px ${accentColor}25` : '0 10px 30px rgba(0,0,0,0.6)',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: isFinal ? accentColor : '#08090A',
                  border: `2px solid ${isFinal ? '#FFFFFF' : accentColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  fontWeight: 900,
                  color: isFinal ? '#FFFFFF' : accentColor,
                  flexShrink: 0,
                }}
              >
                {step.num}
              </div>
              <p
                style={{
                  fontSize: 32,
                  fontWeight: isFinal ? 800 : 700,
                  color: '#FFFFFF',
                  margin: 0,
                  lineHeight: 1.25,
                }}
              >
                {step.text}
              </p>
            </div>
          );
        })}
      </div>

      {/* Bottom Main Statement */}
      <div style={{ marginTop: 36, textAlign: 'center', maxWidth: 850 }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: '#94A3B8' }}>
          SCENE 0{scene.index} // SYSTEM TAKEAWAY
        </span>
      </div>
    </AbsoluteFill>
  );
};

// =========================================================================
// MAIN COMPOSITION: DYNAMIC STORY REEL
// =========================================================================
export const DynamicStoryReel: React.FC<DynamicStoryReelProps> = ({
  topic,
  scenes = [],
  captionStyle = 'kinetic',
  accentColor = '#FF4F00',
  voiceName = 'Alloy',
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Subtle continuous camera zoom
  const cameraZoom = interpolate(frame, [0, durationInFrames], [1.0, 1.04], {
    extrapolateRight: 'clamp',
  });

  const safeScenes = scenes.length > 0 ? scenes : [
    {
      id: 'default_1',
      index: 1,
      startTime: 0,
      endTime: 5,
      duration: 5,
      narration: topic || 'Dynamic visual explainers generated by AutoReel Studio.',
      visualDirection: 'Kinetic bold typography punch with rapid zoom-in',
      visualType: 'kinetic_text' as const,
      highlightWords: ['AutoReel', 'explainers'],
    },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#08090A',
        color: '#EDEDED',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
        transform: `scale(${cameraZoom})`,
        transformOrigin: 'center center',
      }}
    >
      {/* 1. Deep Tangerine Obsidian Cinematic Grid & Atmospheric Void */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 50% 20%, ${accentColor}18 0%, transparent 60%),
            radial-gradient(circle at 80% 80%, rgba(20, 22, 31, 0.9) 0%, transparent 70%)
          `,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.12,
          backgroundImage: `
            linear-gradient(${accentColor}25 1px, transparent 1px),
            linear-gradient(90deg, ${accentColor}25 1px, transparent 1px)
          `,
          backgroundSize: '90px 90px',
        }}
      />

      {/* 2. Top Watermark & Navigation Bar */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 60,
          right: 60,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: 20,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 20px ${accentColor}60`,
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: '3px solid #FFFFFF',
              }}
            />
          </div>
          <span
            style={{
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
            }}
          >
            AUTOREEL
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              fontSize: 18,
              fontFamily: 'monospace',
              color: '#94A3B8',
              backgroundColor: '#14161F',
              padding: '6px 16px',
              borderRadius: 9999,
              border: '1px solid #232634',
            }}
          >
            1080×1920 • 60FPS
          </span>
        </div>
      </div>

      {/* 3. Sequence Renderer for Every Storyboard Scene */}
      {safeScenes.map((scene, idx) => {
        const fromFrame = Math.round(scene.startTime * fps);
        const durationFrames = Math.max(1, Math.round(scene.duration * fps));

        return (
          <Sequence
            key={scene.id || idx}
            from={fromFrame}
            durationInFrames={durationFrames}
          >
            {scene.visualType === 'vector_schematic' ? (
              <VectorSchematicScene scene={scene} accentColor={accentColor} />
            ) : scene.visualType === 'crosshair_target' ? (
              <CrosshairTargetScene scene={scene} accentColor={accentColor} />
            ) : scene.visualType === 'split_comparison' ? (
              <SplitComparisonScene scene={scene} accentColor={accentColor} />
            ) : scene.visualType === 'process_flow' ? (
              <ProcessFlowScene scene={scene} accentColor={accentColor} />
            ) : scene.visualType === 'dynamic_chart' ? (
              <DynamicChartScene scene={scene} accentColor={accentColor} />
            ) : scene.visualType === 'timeline' ? (
              <TimelineScene scene={scene} accentColor={accentColor} />
            ) : scene.visualType === 'step_sequence' ? (
              <StepSequenceScene scene={scene} accentColor={accentColor} />
            ) : (
              <KineticTextScene scene={scene} accentColor={accentColor} topic={topic} />
            )}
          </Sequence>
        );
      })}

      {/* 4. Live Synchronized Bottom Captions (Safe Zone: bottom 220px) */}
      {safeScenes.map((scene, idx) => {
        const fromFrame = Math.round(scene.startTime * fps);
        const durationFrames = Math.max(1, Math.round(scene.duration * fps));

        return (
          <Sequence
            key={`caption_${scene.id || idx}`}
            from={fromFrame}
            durationInFrames={durationFrames}
          >
            <div
              style={{
                position: 'absolute',
                bottom: 240,
                left: 60,
                right: 60,
                display: 'flex',
                justifyContent: 'center',
                textAlign: 'center',
                zIndex: 50,
                pointerEvents: 'none',
              }}
            >
              {captionStyle === 'kinetic' && (
                <div
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid #232634',
                    borderRadius: 24,
                    padding: '18px 36px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                  }}
                >
                  <p
                    style={{
                      fontSize: 34,
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: '#FFFFFF',
                      margin: 0,
                      lineHeight: 1.3,
                    }}
                  >
                    {scene.narration.split(' ').map((word, wIdx) => {
                      const isHighlighted = (scene.highlightWords || []).some((hw) =>
                        hw.toLowerCase().includes(word.toLowerCase().replace(/[.,!]/g, ''))
                      );
                      return (
                        <span
                          key={wIdx}
                          style={{
                            margin: '0 4px',
                            color: isHighlighted ? accentColor : '#FFFFFF',
                            textDecoration: isHighlighted ? `underline ${accentColor}` : 'none',
                          }}
                        >
                          {word}
                        </span>
                      );
                    })}
                  </p>
                </div>
              )}

              {captionStyle === 'minimal' && (
                <div
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: 18,
                    padding: '14px 28px',
                  }}
                >
                  <p
                    style={{
                      fontSize: 30,
                      fontWeight: 600,
                      color: '#EDEDED',
                      margin: 0,
                    }}
                  >
                    {scene.narration}
                  </p>
                </div>
              )}

              {captionStyle === 'bold' && (
                <div
                  style={{
                    width: '100%',
                    backgroundColor: accentColor,
                    borderRadius: 20,
                    padding: '20px 24px',
                    boxShadow: `0 15px 40px ${accentColor}40`,
                  }}
                >
                  <p
                    style={{
                      fontSize: 36,
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      color: '#FFFFFF',
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    {scene.narration}
                  </p>
                </div>
              )}
            </div>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
