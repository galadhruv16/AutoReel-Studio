import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const TitleHook: React.FC<{
  badgeText: string;
  headline: string;
  subheadline: string;
}> = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // 1. Kinetic Text Staggered Springs
  const textSpring1 = spring({ frame, fps, config: { damping: 12, stiffness: 140 } });
  const textSpring2 = spring({ frame: frame - 6, fps, config: { damping: 10, stiffness: 120 } });
  const textSpring3 = spring({ frame: frame - 12, fps, config: { damping: 12, stiffness: 110 } });

  // 2. 3D Isometric Motion Object Entrance
  const objectSpring = spring({ frame: frame - 10, fps, config: { damping: 14, stiffness: 85, mass: 1.1 } });

  // Continuous subtle rotation & float
  const floatY = Math.sin((frame / 18) * Math.PI) * 14;
  const rotateAngle = interpolate(frame, [0, durationInFrames], [0, 18]);

  // Animated SVG laser line draw (stroke-dashoffset from 600 to 0)
  const lineDraw = interpolate(frame, [8, 35], [600, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Pulsing energy rings
  const ringScale1 = interpolate((frame % 30), [0, 30], [0.8, 1.35]);
  const ringOpacity1 = interpolate((frame % 30), [0, 30], [0.8, 0]);

  const ringScale2 = interpolate(((frame + 15) % 30), [0, 30], [0.8, 1.35]);
  const ringOpacity2 = interpolate(((frame + 15) % 30), [0, 30], [0.8, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 240, // Keeps clear of Instagram top header
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* ========================================================
          1. KINETIC EDITORIAL TYPOGRAPHY (NO CARDS, PURE TYPE)
         ======================================================== */}
      <div style={{ textAlign: 'center', marginBottom: 40, zIndex: 10 }}>
        {/* Intro Tag */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 800,
            fontFamily: 'Inter, system-ui, sans-serif',
            letterSpacing: '0.22em',
            color: '#38BDF8',
            textTransform: 'uppercase',
            marginBottom: 12,
            transform: `scale(${textSpring1})`,
            opacity: interpolate(frame, [0, 6], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          // THE ARCHITECTURE MYTH
        </div>

        {/* Big Impact Hook Headline */}
        <div
          style={{
            fontSize: 88,
            fontWeight: 900,
            fontFamily: '"Arial Black", "Inter", sans-serif',
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            color: '#FFFFFF',
            textTransform: 'uppercase',
            transform: `translateY(${interpolate(textSpring2, [0, 1], [40, 0])}px)`,
            opacity: interpolate(frame, [4, 10], [0, 1], { extrapolateRight: 'clamp' }),
            textShadow: '0 10px 40px rgba(0, 0, 0, 0.9)',
          }}
        >
          Kubernetes <br />
          <span
            style={{
              background: 'linear-gradient(90deg, #F43F5E 0%, #FB7185 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Never Runs
          </span>{' '}
          Containers
        </div>
      </div>

      {/* ========================================================
          2. SPATIAL ISOMETRIC ANIMATED VECTOR GRAPHIC (VOX STYLE)
         ======================================================== */}
      <div
        style={{
          position: 'relative',
          width: 720,
          height: 640,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translateY(${floatY}px) scale(${objectSpring})`,
          opacity: interpolate(frame, [8, 16], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        {/* Dynamic Glowing Energy Waves */}
        <div
          style={{
            position: 'absolute',
            width: 380,
            height: 380,
            borderRadius: '50%',
            border: '2px solid #38BDF8',
            transform: `scale(${ringScale1})`,
            opacity: ringOpacity1,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 380,
            height: 380,
            borderRadius: '50%',
            border: '2px solid #6366F1',
            transform: `scale(${ringScale2})`,
            opacity: ringOpacity2,
          }}
        />

        {/* Isometric 3D SVG Composition */}
        <svg
          width="700"
          height="620"
          viewBox="0 0 700 620"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.8))',
          }}
        >
          {/* Laser Orbit Circles */}
          <ellipse
            cx="350"
            cy="320"
            rx="280"
            ry="140"
            stroke="rgba(56, 189, 248, 0.25)"
            strokeWidth="2"
            strokeDasharray="12 12"
          />

          <ellipse
            cx="350"
            cy="320"
            rx="220"
            ry="110"
            stroke="url(#orbitGradient)"
            strokeWidth="3"
            strokeDasharray="600"
            strokeDashoffset={lineDraw}
          />

          {/* Central Isometric K8s Pod (Outer Hex Prism) */}
          {/* Top Face */}
          <polygon
            points="350,180 470,245 350,310 230,245"
            fill="rgba(30, 41, 59, 0.9)"
            stroke="#60A5FA"
            strokeWidth="3.5"
          />
          {/* Left Face */}
          <polygon
            points="230,245 350,310 350,440 230,375"
            fill="rgba(15, 23, 42, 0.95)"
            stroke="#3B82F6"
            strokeWidth="3.5"
          />
          {/* Right Face */}
          <polygon
            points="350,310 470,245 470,375 350,440"
            fill="rgba(11, 15, 25, 0.98)"
            stroke="#2563EB"
            strokeWidth="3.5"
          />

          {/* Inner Floating Hologram Core (The "Container" trapped inside) */}
          {/* Inner Top */}
          <polygon
            points="350,230 410,265 350,300 290,265"
            fill="rgba(56, 189, 248, 0.85)"
            stroke="#38BDF8"
            strokeWidth="2"
            style={{
              filter: 'drop-shadow(0 0 20px #38BDF8)',
            }}
          />
          {/* Inner Left */}
          <polygon
            points="290,265 350,300 350,360 290,325"
            fill="rgba(14, 165, 233, 0.7)"
            stroke="#0284C7"
            strokeWidth="2"
          />
          {/* Inner Right */}
          <polygon
            points="350,300 410,265 410,325 350,360"
            fill="rgba(2, 132, 199, 0.8)"
            stroke="#0369A1"
            strokeWidth="2"
          />

          {/* Floating Laser Pointer Lines with Callout Labels */}
          {/* Line 1: Points to Outer Hex */}
          <path
            d="M 470 245 L 560 190 L 640 190"
            stroke="#60A5FA"
            strokeWidth="3"
            strokeDasharray="300"
            strokeDashoffset={interpolate(frame, [15, 30], [300, 0], { extrapolateRight: 'clamp' })}
          />
          <circle cx="470" cy="245" r="5" fill="#60A5FA" />
          <text
            x="565"
            y="178"
            fill="#93C5FD"
            fontSize="22"
            fontWeight="800"
            fontFamily="Inter, sans-serif"
            opacity={interpolate(frame, [25, 32], [0, 1], { extrapolateRight: 'clamp' })}
          >
            POD WRAPPER
          </text>

          {/* Line 2: Points to Inner Core */}
          <path
            d="M 290 295 L 180 340 L 90 340"
            stroke="#38BDF8"
            strokeWidth="3"
            strokeDasharray="300"
            strokeDashoffset={interpolate(frame, [18, 34], [300, 0], { extrapolateRight: 'clamp' })}
          />
          <circle cx="290" cy="295" r="5" fill="#38BDF8" />
          <text
            x="95"
            y="328"
            fill="#38BDF8"
            fontSize="22"
            fontWeight="800"
            fontFamily="Inter, sans-serif"
            opacity={interpolate(frame, [28, 35], [0, 1], { extrapolateRight: 'clamp' })}
          >
            CONTAINER
          </text>

          {/* Gradients */}
          <defs>
            <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#F43F5E" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};
