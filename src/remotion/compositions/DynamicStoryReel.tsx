import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  Audio,
  staticFile,
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
          {scene.graphicData?.badge || (scene.visualDirection || 'KEY CONCEPT').split(':')[0].slice(0, 28)}
        </div>

        <h1
          style={{
            fontSize: (scene.graphicData?.headline || '').length > 22 ? 58 : 74,
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: '#FFFFFF',
            textTransform: 'uppercase',
            margin: '0 0 24px 0',
            textShadow: '0 10px 40px rgba(0,0,0,0.8)',
            maxWidth: '100%',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          {scene.graphicData?.headline || (
            <>
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
            </>
          )}
        </h1>

        {scene.graphicData?.subtext ? (
          <p
            style={{
              fontSize: 36,
              color: '#EDEDED',
              fontWeight: 600,
              maxWidth: 800,
              margin: '0 auto',
              lineHeight: 1.3,
            }}
          >
            {scene.graphicData.subtext}
          </p>
        ) : remaining ? (
          <p
            style={{
              fontSize: 36,
              color: '#94A3B8',
              maxWidth: 800,
              margin: '0 auto',
              lineHeight: 1.4,
              fontWeight: 500,
            }}
          >
            {remaining}
          </p>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// =========================================================================
// SUB-COMPONENT: SYSTEM SCHEMATIC / MECHANISM ARCHITECTURE SCENE
// =========================================================================
const VectorSchematicScene: React.FC<{
  scene: StudioScene;
  accentColor: string;
}> = ({ scene, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cueFrame = scene.cueFrame || Math.floor(fps * 0.4);
  const isCueReached = frame >= cueFrame;
  const cueProgress = interpolate(frame, [cueFrame, cueFrame + 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const enterSpring = spring({ frame, fps, config: { damping: 14, stiffness: 110 } });

  const inputTag = scene.graphicData?.keyTags?.[0] || 'PRIMARY INPUT';
  const outputTag = scene.graphicData?.keyTags?.[1] || 'FINAL OUTCOME';

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
      {/* Background Subtle Depth */}
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

      {/* Structural Editorial Flowchart Diagram */}
      <div
        style={{
          width: '100%',
          maxWidth: 880,
          backgroundColor: '#14161F',
          border: `1.5px solid ${isCueReached ? accentColor : '#232634'}`,
          borderRadius: 36,
          padding: '48px 40px',
          boxShadow: isCueReached ? `0 25px 60px ${accentColor}25` : '0 20px 50px rgba(0,0,0,0.7)',
          transform: `scale(${enterSpring})`,
          transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
          marginBottom: 36,
        }}
      >
        {/* Top Header Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
          <span
            style={{
              fontSize: 18,
              fontFamily: 'monospace',
              color: accentColor,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            {scene.graphicData?.badge || 'SYSTEM MECHANISM'}
          </span>
          <span
            style={{
              backgroundColor: '#08090A',
              border: '1px solid #232634',
              borderRadius: 9999,
              padding: '6px 16px',
              fontSize: 14,
              fontFamily: 'monospace',
              color: isCueReached ? accentColor : '#64748B',
              fontWeight: 700,
            }}
          >
            {isCueReached ? 'ACTIVE BEAT' : 'INITIALIZING'}
          </span>
        </div>

        {/* 3-Tier Connected Flow Nodes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1.4fr auto 1fr', alignItems: 'center', gap: 14 }}>
          {/* Node 1: Input / Origin */}
          <div
            style={{
              backgroundColor: '#08090A',
              border: '1.5px solid #232634',
              borderRadius: 20,
              padding: '20px 16px',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              CATALYST
            </span>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#EDEDED', lineHeight: 1.2 }}>
              {inputTag}
            </span>
          </div>

          {/* Connecting Arrow */}
          <span style={{ fontSize: 28, color: accentColor, fontWeight: 900 }}>→</span>

          {/* Node 2: Central Mechanism */}
          <div
            style={{
              backgroundColor: isCueReached ? `${accentColor}18` : '#191C28',
              border: `2px solid ${isCueReached ? accentColor : '#3D445C'}`,
              borderRadius: 24,
              padding: '24px 20px',
              textAlign: 'center',
              boxShadow: isCueReached ? `0 0 30px ${accentColor}30` : 'none',
              transform: isCueReached ? `scale(${1 + cueProgress * 0.04})` : 'scale(1)',
              transition: 'all 0.3s ease',
            }}
          >
            <span style={{ fontSize: 13, fontFamily: 'monospace', color: accentColor, textTransform: 'uppercase', display: 'block', marginBottom: 6, fontWeight: 700 }}>
              OPERATIONAL CORE
            </span>
            <span style={{ fontSize: 24, fontWeight: 900, color: '#FFFFFF', lineHeight: 1.25 }}>
              {scene.graphicData?.headline || 'CORE MECHANISM'}
            </span>
          </div>

          {/* Connecting Arrow */}
          <span style={{ fontSize: 28, color: isCueReached ? accentColor : '#33384B', fontWeight: 900 }}>→</span>

          {/* Node 3: Result / Outcome */}
          <div
            style={{
              backgroundColor: '#08090A',
              border: `1.5px solid ${isCueReached ? '#10B981' : '#232634'}`,
              borderRadius: 20,
              padding: '20px 16px',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: 13, fontFamily: 'monospace', color: isCueReached ? '#10B981' : '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              OUTCOME
            </span>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#EDEDED', lineHeight: 1.2 }}>
              {outputTag}
            </span>
          </div>
        </div>

        {/* Bottom Context Line */}
        {scene.graphicData?.subtext && (
          <div style={{ marginTop: 28, borderTop: '1px solid #1C1E26', paddingTop: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 22, color: '#94A3B8', margin: 0, fontWeight: 500, lineHeight: 1.35 }}>
              {scene.graphicData.subtext}
            </p>
          </div>
        )}
      </div>

      {/* Main Narrative Explanation */}
      <div style={{ textAlign: 'center', maxWidth: 880 }}>
        <h2
          style={{
            fontSize: 50,
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.25,
            margin: '0 0 10px 0',
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
// SUB-COMPONENT: FOCAL SPOTLIGHT CARD SCENE (NO SCI-FI RADAR)
// =========================================================================
const CrosshairTargetScene: React.FC<{
  scene: StudioScene;
  accentColor: string;
}> = ({ scene, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cueFrame = scene.cueFrame || Math.floor(fps * 0.4);
  const isCueReached = frame >= cueFrame;
  const cueSpring = spring({
    frame: frame - cueFrame,
    fps,
    config: { damping: 12, stiffness: 130 },
  });

  const pulse = Math.sin(frame * 0.12) * 6;

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
      {/* Expanding Soft Spotlight Aura */}
      <div
        style={{
          position: 'absolute',
          width: 580 + pulse * 12,
          height: 580 + pulse * 12,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accentColor}25 0%, transparent 70%)`,
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      {/* Editorial Spotlight Focus Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 860,
          backgroundColor: '#14161F',
          border: `2px solid ${isCueReached ? accentColor : '#232634'}`,
          borderRadius: 40,
          padding: '52px 48px',
          boxShadow: isCueReached ? `0 30px 80px ${accentColor}30` : '0 25px 60px rgba(0,0,0,0.8)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 40,
          transform: isCueReached ? `scale(${1 + cueSpring * 0.03})` : 'scale(1)',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Accent Top Ribbon */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            backgroundColor: isCueReached ? accentColor : '#3D445C',
          }}
        />

        {/* Editorial Pill Eyebrow */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            backgroundColor: '#08090A',
            border: `1px solid ${isCueReached ? accentColor : '#232634'}`,
            padding: '8px 24px',
            borderRadius: 9999,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: isCueReached ? accentColor : '#64748B',
              boxShadow: isCueReached ? `0 0 12px ${accentColor}` : 'none',
            }}
          />
          <span
            style={{
              fontSize: 18,
              fontFamily: 'monospace',
              color: isCueReached ? '#FFFFFF' : '#94A3B8',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            {scene.graphicData?.badge || 'CRITICAL ENTITY SPOTLIGHT'}
          </span>
        </div>

        {/* Primary Factual Entity Headline */}
        <h1
          style={{
            fontSize: 66,
            fontWeight: 900,
            color: '#FFFFFF',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            margin: '0 0 20px 0',
            textShadow: '0 8px 30px rgba(0,0,0,0.8)',
          }}
        >
          {scene.graphicData?.headline || scene.narration}
        </h1>

        {/* Subtext Explanation */}
        {scene.graphicData?.subtext && (
          <p
            style={{
              fontSize: 28,
              color: '#EDEDED',
              fontWeight: 500,
              maxWidth: 720,
              margin: '0 auto 28px auto',
              lineHeight: 1.35,
            }}
          >
            {scene.graphicData.subtext}
          </p>
        )}

        {/* Key Entities / Tags Row */}
        {scene.graphicData?.keyTags && scene.graphicData.keyTags.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {scene.graphicData.keyTags.map((tag, tIdx) => (
              <span
                key={tIdx}
                style={{
                  backgroundColor: '#08090A',
                  border: '1px solid #232634',
                  borderRadius: 12,
                  padding: '8px 18px',
                  fontSize: 18,
                  fontFamily: 'monospace',
                  color: isCueReached ? accentColor : '#94A3B8',
                  fontWeight: 600,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Spoken Narration */}
      <div style={{ textAlign: 'center', maxWidth: 880 }}>
        <p style={{ fontSize: 32, color: '#94A3B8', margin: 0, fontWeight: 500, lineHeight: 1.3 }}>
          {scene.narration}
        </p>
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

  const cueFrame = scene.cueFrame || Math.floor(fps * 0.4);
  const isCueReached = frame >= cueFrame;
  const cueProgress = interpolate(frame, [cueFrame, cueFrame + 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const cardOffset = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const leftX = interpolate(cardOffset, [0, 1], [-140, 0]);
  const rightX = interpolate(cardOffset, [0, 1], [140, 0]);

  const words = scene.narration.split(' ');
  const mid = Math.ceil(words.length / 2);
  const leftText = words.slice(0, mid).join(' ');
  const rightText = words.slice(mid).join(' ');

  const leftHeading = scene.graphicData?.comparison?.left.heading || scene.graphicData?.leftItem?.title || 'PRIOR STATE';
  const leftPoints = scene.graphicData?.comparison?.left.points || (scene.graphicData?.leftItem?.desc ? [scene.graphicData.leftItem.desc] : [leftText]);

  const rightHeading = scene.graphicData?.comparison?.right.heading || scene.graphicData?.rightItem?.title || 'NEW DOCTRINE';
  const rightPoints = scene.graphicData?.comparison?.right.points || (scene.graphicData?.rightItem?.desc ? [scene.graphicData.rightItem.desc] : [rightText]);

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
      {/* Top Eyebrow Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          backgroundColor: '#08090A',
          border: `1px solid ${isCueReached ? accentColor : '#232634'}`,
          borderRadius: 9999,
          padding: '8px 24px',
          marginBottom: 36,
          boxShadow: isCueReached ? `0 0 20px ${accentColor}30` : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 900, color: accentColor }}>VS</span>
        <span style={{ fontSize: 18, fontFamily: 'monospace', color: '#EDEDED', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {scene.graphicData?.badge || 'COMPARATIVE ANALYSIS'}
        </span>
      </div>

      {/* Split Comparison Dual Deck */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 28,
          width: '100%',
          maxWidth: 960,
          marginBottom: 36,
        }}
      >
        {/* Left Side: Conventional / Before State */}
        <div
          style={{
            transform: `translateX(${leftX}px)`,
            backgroundColor: '#14161F',
            border: '2px solid #232634',
            borderRadius: 32,
            padding: 36,
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
              fontSize: 18,
              fontFamily: 'monospace',
              color: '#94A3B8',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 16,
              fontWeight: 700,
            }}
          >
            {leftHeading}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {leftPoints.map((pt, pIdx) => (
              <div key={pIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#64748B', marginTop: 10, flexShrink: 0 }} />
                <p style={{ fontSize: 26, fontWeight: 600, color: '#EDEDED', lineHeight: 1.3, margin: 0 }}>
                  {pt}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Modern / Outcome / Active Beat */}
        <div
          style={{
            transform: `translateX(${rightX}px) scale(${isCueReached ? 1 + cueProgress * 0.02 : 1})`,
            backgroundColor: isCueReached ? '#191C28' : '#14161F',
            border: `2px solid ${isCueReached ? accentColor : '#232634'}`,
            borderRadius: 32,
            padding: 36,
            boxShadow: isCueReached ? `0 25px 60px ${accentColor}30` : '0 20px 50px rgba(0,0,0,0.6)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
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
              fontSize: 18,
              fontFamily: 'monospace',
              color: isCueReached ? accentColor : '#94A3B8',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 16,
              fontWeight: 700,
            }}
          >
            {rightHeading}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {rightPoints.map((pt, pIdx) => (
              <div key={pIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: accentColor, marginTop: 10, flexShrink: 0 }} />
                <p style={{ fontSize: 26, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.3, margin: 0 }}>
                  {pt}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Spoken Narration */}
      <div style={{ textAlign: 'center', maxWidth: 880 }}>
        <p style={{ fontSize: 32, color: '#94A3B8', margin: 0, fontWeight: 500, lineHeight: 1.3 }}>
          {scene.narration}
        </p>
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

  const cueFrame = scene.cueFrame || Math.floor(fps * 0.4);
  const activeNode = frame >= cueFrame ? 1 : 0;
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
          const dynamicStep = scene.graphicData?.steps?.[stepIdx];
          const stepTitle = dynamicStep?.title?.slice(0, 20) || `STAGE 0${stepIdx + 1}`;

          return (
            <div
              key={stepIdx}
              style={{
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxWidth: 220,
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
                {dynamicStep?.num || `0${stepIdx + 1}`}
              </div>
              <span
                style={{
                  marginTop: 14,
                  fontSize: 16,
                  fontFamily: 'monospace',
                  color: isActive ? '#EDEDED' : '#64748B',
                  fontWeight: 600,
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
              >
                {stepTitle}
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
          {scene.graphicData?.badge || (scene.visualDirection || 'PROCESS PIPELINE').split(':')[0]}
        </span>
        <h2
          style={{
            fontSize: 50,
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.25,
            margin: '0 0 12px 0',
            textShadow: '0 6px 25px rgba(0,0,0,0.9)',
          }}
        >
          {scene.graphicData?.headline || scene.narration}
        </h2>
        {scene.graphicData?.subtext && (
          <p style={{ fontSize: 24, color: '#94A3B8', margin: 0, fontWeight: 500 }}>
            {scene.graphicData.subtext}
          </p>
        )}
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

  const cueFrame = scene.cueFrame || Math.floor(fps * 0.35);
  const isCueReached = frame >= cueFrame;
  const cueProgress = interpolate(frame, [cueFrame, cueFrame + 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

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
          border: `1.5px solid ${isCueReached ? accentColor : '#232634'}`,
          borderRadius: 36,
          padding: '48px 40px',
          boxShadow: isCueReached ? `0 30px 70px ${accentColor}30` : '0 30px 60px rgba(0,0,0,0.8)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
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
                fontWeight: 700,
              }}
            >
              {scene.graphicData?.badge || 'METRIC ANALYSIS'}
            </span>
            <div
              style={{
                fontSize: 58,
                fontWeight: 900,
                color: '#FFFFFF',
                letterSpacing: '-0.03em',
                transform: isCueReached ? `scale(${1 + cueProgress * 0.05})` : 'scale(1)',
                transition: 'all 0.3s ease',
              }}
            >
              {scene.graphicData?.statNumber || `+${count2}%`}{' '}
              <span style={{ fontSize: 24, fontWeight: 700, color: '#10B981' }}>
                {scene.graphicData?.statLabel || 'RECORD'}
              </span>
            </div>
          </div>
          <div
            style={{
              backgroundColor: '#08090A',
              border: `1px solid ${isCueReached ? accentColor : '#232634'}`,
              borderRadius: 14,
              padding: '8px 16px',
              color: isCueReached ? accentColor : '#94A3B8',
              fontFamily: 'monospace',
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {isCueReached ? 'VERIFIED METRIC' : `METRIC // 0${scene.index}`}
          </div>
        </div>

        {/* Animated Bar Chart SVG */}
        <div style={{ height: 260, position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 20px 20px 20px' }}>
          {/* Baseline Gridlines */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 40, borderTop: '1px dashed #232634' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 120, borderTop: '1px dashed #232634' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 20, borderTop: '2px solid #33384B' }} />

          {/* Bar 1: Baseline / Left Item */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, width: 140 }}>
            <span style={{ fontSize: 18, fontFamily: 'monospace', color: '#94A3B8', marginBottom: 12, fontWeight: 700 }}>
              {Math.round(25 * grow)}%
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
            <span style={{ fontSize: 14, fontFamily: 'monospace', color: '#64748B', marginTop: 14, textAlign: 'center' }}>
              {scene.graphicData?.leftItem?.title?.slice(0, 14) || 'INITIAL'}
            </span>
          </div>

          {/* Bar 2: Midpoint / Right Item */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, width: 140 }}>
            <span style={{ fontSize: 18, fontFamily: 'monospace', color: '#EDEDED', marginBottom: 12, fontWeight: 700 }}>
              {Math.round(60 * grow)}%
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
            <span style={{ fontSize: 14, fontFamily: 'monospace', color: '#94A3B8', marginTop: 14, textAlign: 'center' }}>
              {scene.graphicData?.rightItem?.title?.slice(0, 14) || 'MIDPOINT'}
            </span>
          </div>

          {/* Bar 3: Peak Metric */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, width: 140 }}>
            <span style={{ fontSize: 20, fontFamily: 'monospace', color: accentColor, marginBottom: 12, fontWeight: 900 }}>
              {scene.graphicData?.statNumber || `${count1}%`}
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
            <span style={{ fontSize: 14, fontFamily: 'monospace', color: accentColor, marginTop: 14, fontWeight: 800, textAlign: 'center' }}>
              {scene.graphicData?.statLabel?.slice(0, 14) || 'PEAK'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Narrative Subtext */}
      <div style={{ marginTop: 44, textAlign: 'center', maxWidth: 850 }}>
        <h2
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.25,
            margin: '0 0 10px 0',
            textShadow: '0 6px 25px rgba(0,0,0,0.9)',
          }}
        >
          {scene.graphicData?.headline || scene.narration}
        </h2>
        {scene.graphicData?.subtext && (
          <p style={{ fontSize: 24, color: '#94A3B8', margin: 0 }}>
            {scene.graphicData.subtext}
          </p>
        )}
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

  const cueFrame = scene.cueFrame || Math.floor(fps * 0.4);
  const progress = interpolate(frame, [0, Math.max(cueFrame + 10, 45)], [0, 1], { extrapolateRight: 'clamp' });
  const activeMilestone = frame >= (cueFrame + 18) ? 2 : frame >= cueFrame ? 1 : 0;

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
          {scene.graphicData?.badge || `CHRONOLOGICAL RECORD // 0${scene.index}`}
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
          {(scene.graphicData?.milestones && scene.graphicData.milestones.length >= 2
            ? scene.graphicData.milestones.slice(0, 3).map((m) => ({ tag: m.date, label: m.title }))
            : [
                { tag: 'PHASE 1', label: 'Initial Spark' },
                { tag: 'PHASE 2', label: 'Strategic Turning Point' },
                { tag: 'PHASE 3', label: 'Long-term Impact' },
              ]
          ).map((milestone, mIdx) => {
            const isReached = mIdx <= activeMilestone;
            const isCurrent = mIdx === activeMilestone;

            return (
              <div key={mIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 220 }}>
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
                    textAlign: 'center',
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
                    lineHeight: 1.25,
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
            fontSize: 48,
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.25,
            margin: '0 0 10px 0',
            textShadow: '0 6px 25px rgba(0,0,0,0.9)',
          }}
        >
          {scene.graphicData?.headline || scene.narration}
        </h2>
        {scene.graphicData?.subtext && (
          <p style={{ fontSize: 24, color: '#94A3B8', margin: 0 }}>
            {scene.graphicData.subtext}
          </p>
        )}
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

  const cueFrame = scene.cueFrame || Math.floor(fps * 0.4);
  const isCueReached = frame >= cueFrame;

  const words = (scene.narration || '').split(' ');
  const chunk1 = words.slice(0, 4).join(' ');
  const chunk2 = words.slice(4, 8).join(' ');
  const chunk3 = words.slice(8).join(' ') || words.slice(0, 3).join(' ');

  const steps = scene.graphicData?.steps && scene.graphicData.steps.length > 0
    ? scene.graphicData.steps.slice(0, 3).map((st, i) => ({
        num: st.num || `0${i + 1}`,
        text: st.desc ? `${st.title}: ${st.desc}` : st.title,
      }))
    : [
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
        {scene.graphicData?.badge || (scene.visualDirection || 'STEP SEQUENCE').split(':')[0].slice(0, 28)}
      </div>

      {/* 3 Cascading Stack Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 780 }}>
        {steps.map((step, sIdx) => {
          const delay = sIdx * 8;
          const enter = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 120 } });
          const cardX = interpolate(enter, [0, 1], [60, 0], { extrapolateRight: 'clamp' });
          const cardOpacity = interpolate(enter, [0, 1], [0, 1], { extrapolateRight: 'clamp' });
          const isFinal = sIdx === steps.length - 1;
          const shouldHighlight = isFinal && isCueReached;

          return (
            <div
              key={sIdx}
              style={{
                transform: `translateX(${cardX}px) scale(${shouldHighlight ? 1.03 : 1})`,
                opacity: cardOpacity,
                backgroundColor: shouldHighlight ? '#1A1D2B' : isFinal ? '#191C28' : '#14161F',
                border: `1.5px solid ${shouldHighlight ? accentColor : isFinal ? `${accentColor}80` : '#232634'}`,
                borderRadius: 24,
                padding: '24px 32px',
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                boxShadow: shouldHighlight ? `0 20px 50px ${accentColor}40` : isFinal ? `0 15px 40px ${accentColor}25` : '0 10px 30px rgba(0,0,0,0.6)',
                transition: 'all 0.3s ease',
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
        <h3
          style={{
            fontSize: 34,
            fontWeight: 800,
            color: '#FFFFFF',
            margin: '0 0 8px 0',
            textShadow: '0 4px 20px rgba(0,0,0,0.8)',
          }}
        >
          {scene.graphicData?.headline || `SCENE 0${scene.index} // SYSTEM TAKEAWAY`}
        </h3>
        {scene.graphicData?.subtext && (
          <p style={{ fontSize: 22, color: '#94A3B8', margin: 0, fontWeight: 500 }}>
            {scene.graphicData.subtext}
          </p>
        )}
      </div>
    </AbsoluteFill>
  );
};

// =========================================================================
// SUB-COMPONENT: SYNCHRONIZED RESPONSIVE CAPTION BAR
// =========================================================================
interface SynchronizedCaptionProps {
  scene: StudioScene;
  captionStyle: 'kinetic' | 'minimal' | 'bold';
  accentColor: string;
  durationFrames: number;
}

const SynchronizedCaption: React.FC<SynchronizedCaptionProps> = ({
  scene,
  captionStyle,
  accentColor,
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const narration = (scene.narration || '').trim();
  const words = narration ? narration.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  if (wordCount === 0) return null;

  // Responsive font scaling: ensures text NEVER overflows the 9:16 safe area
  // 1-8 words: 32px | 9-13 words: 28px | 14+ words: 24px
  const fontSize = wordCount > 13 ? 24 : wordCount > 8 ? 28 : 32;

  // Word-by-word kinetic highlight index based on scene playback progress
  const progress = durationFrames > 0 ? Math.min(1, Math.max(0, frame / durationFrames)) : 0;
  const currentWordIdx = Math.min(wordCount - 1, Math.floor(progress * wordCount));

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 220,
        left: 48,
        right: 48,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
        pointerEvents: 'none',
        boxSizing: 'border-box',
      }}
    >
      {captionStyle === 'kinetic' && (
        <div
          style={{
            maxWidth: '100%',
            boxSizing: 'border-box',
            backgroundColor: 'rgba(8, 9, 10, 0.90)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 22,
            padding: '14px 22px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '6px 8px',
          }}
        >
          {words.map((word, wIdx) => {
            const isActive = wIdx === currentWordIdx;
            const isPast = wIdx < currentWordIdx;
            const isKeyword = (scene.highlightWords || []).some((hw) =>
              hw.toLowerCase().includes(word.toLowerCase().replace(/[^a-z0-9]/g, ''))
            );

            return (
              <span
                key={wIdx}
                style={{
                  fontSize,
                  fontWeight: isActive ? 900 : 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                  lineHeight: 1.25,
                  padding: isActive ? '3px 8px' : '3px 2px',
                  borderRadius: 8,
                  backgroundColor: isActive ? accentColor : 'transparent',
                  color: isActive
                    ? '#FFFFFF'
                    : isKeyword
                    ? accentColor
                    : isPast
                    ? '#FFFFFF'
                    : '#94A3B8',
                  transform: isActive ? 'scale(1.08)' : 'scale(1)',
                  boxShadow: isActive ? `0 4px 18px ${accentColor}60` : 'none',
                  whiteSpace: 'nowrap',
                  wordBreak: 'break-word',
                  transition: 'background-color 0.1s ease, transform 0.1s ease',
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      )}

      {captionStyle === 'minimal' && (
        <div
          style={{
            maxWidth: '100%',
            boxSizing: 'border-box',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(12px)',
            border: '1px solid #232634',
            borderRadius: 18,
            padding: '12px 24px',
            boxShadow: '0 15px 30px rgba(0, 0, 0, 0.7)',
          }}
        >
          <p
            style={{
              fontSize,
              fontWeight: 600,
              color: '#EDEDED',
              margin: 0,
              lineHeight: 1.35,
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {scene.narration}
          </p>
        </div>
      )}

      {captionStyle === 'bold' && (
        <div
          style={{
            maxWidth: '100%',
            boxSizing: 'border-box',
            backgroundColor: accentColor,
            borderRadius: 20,
            padding: '16px 24px',
            boxShadow: `0 15px 40px ${accentColor}40`,
          }}
        >
          <p
            style={{
              fontSize,
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              color: '#FFFFFF',
              margin: 0,
              lineHeight: 1.25,
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {scene.narration}
          </p>
        </div>
      )}
    </div>
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
  audioUrl,
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

      {/* 4. Live Synchronized Responsive Bottom Captions (Safe Zone: bottom 220px, zero-overflow flex wrap) */}
      {safeScenes.map((scene, idx) => {
        const fromFrame = Math.round(scene.startTime * fps);
        const durationFrames = Math.max(1, Math.round(scene.duration * fps));

        return (
          <Sequence
            key={`caption_${scene.id || idx}`}
            from={fromFrame}
            durationInFrames={durationFrames}
          >
            <SynchronizedCaption
              scene={scene}
              captionStyle={captionStyle}
              accentColor={accentColor}
              durationFrames={durationFrames}
            />
          </Sequence>
        );
      })}

      {/* 5. Dedicated Per-Scene Voiceover Sequences (Generous duration padding ensures full sentence completion without cutoffs) */}
      {safeScenes.map((scene, idx) => {
        if (!scene.audioUrl) return null;
        const fromFrame = Math.round(scene.startTime * fps);
        // Generous audio frame window: allows the full audio waveform + acoustic release to complete cleanly
        const audioSec = Math.max(scene.audioDuration || 0, scene.duration) + 0.6;
        const audioFrames = Math.max(1, Math.ceil(audioSec * fps));

        return (
          <Sequence
            key={`scene_audio_${scene.id || idx}`}
            from={fromFrame}
            durationInFrames={audioFrames}
          >
            <Audio
              src={
                scene.audioUrl.startsWith('http') || scene.audioUrl.startsWith('data:')
                  ? scene.audioUrl
                  : staticFile(scene.audioUrl.replace(/^\//, ''))
              }
              volume={1.0}
            />
          </Sequence>
        );
      })}

      {/* 6. Master Composite Audio Track (only if individual scenes do not have audio) */}
      {audioUrl && !safeScenes.some((s) => s.audioUrl) && (
        <Audio
          src={
            audioUrl.startsWith('http') || audioUrl.startsWith('data:')
              ? audioUrl
              : staticFile(audioUrl.replace(/^\//, ''))
          }
          volume={1.0}
        />
      )}
    </AbsoluteFill>
  );
};
