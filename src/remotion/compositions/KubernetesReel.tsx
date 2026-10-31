import React from 'react';
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { VoxEditorialCaptions } from '../components/captions/VoxEditorialCaptions';
import k8sData from '../../../public/audio/reel_kubernetes.json';

export const KubernetesReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Slow, cinematic 3D camera push
  const cameraScale = interpolate(frame, [0, durationInFrames], [1, 1.06], {
    extrapolateRight: 'clamp',
  });

  // Scene timing thresholds (based on synthesized sentence timestamps)
  // Scene 1: 0 - 150 frames (0.0s - 5.0s) -> "Containers do not exist" + Container Shatter
  // Scene 2: 150 - 390 frames (5.0s - 13.0s) -> Linux Process, cgroups, namespaces & Port Conflict
  // Scene 3: 390 - 615 frames (13.0s - 20.5s) -> The Pod Hexagon Boundary & Shared Network
  // Scene 4: 615 - 765 frames (20.5s - 25.5s) -> Localhost High-Speed Sidecar Beam
  // Scene 5: 765+ frames (25.5s - end) -> Atomic Unit of Compute: Pod

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#05070D',
        color: '#FFFFFF',
        fontFamily: 'Inter, system-ui, sans-serif',
        transform: `scale(${cameraScale})`,
        transformOrigin: 'center center',
      }}
    >
      {/* 1. Deep Tech Spatial Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 50% 25%, rgba(0, 240, 255, 0.15) 0%, transparent 65%), radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.12) 0%, transparent 50%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.15,
          backgroundImage:
            'linear-gradient(rgba(0, 240, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.3) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
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
          borderBottom: '1px solid rgba(0, 240, 255, 0.3)',
          paddingBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: '#00F0FF',
              boxShadow: '0 0 12px #00F0FF',
            }}
          />
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#00F0FF',
            }}
          >
            Cloud Systems • The Pod Abstraction
          </span>
        </div>
        <div
          style={{
            fontSize: 20,
            fontFamily: 'monospace',
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          K8S ARCHITECTURE
        </div>
      </div>

      {/* ========================================================
          SCENE 1: THE CONTAINER LIE (Frames 0 - 150)
          "Containers do not exist. There is no tiny virtual machine inside your server."
         ======================================================== */}
      {frame < 155 && (
        <div
          style={{
            position: 'absolute',
            top: 320,
            left: 50,
            right: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: interpolate(frame, [0, 15, 135, 150], [0, 1, 1, 0], { extrapolateRight: 'clamp' }),
          }}
        >
          <div
            style={{
              padding: '8px 24px',
              borderRadius: 30,
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #EF4444',
              color: '#F87171',
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 40,
            }}
          >
            Architectural Reality Check
          </div>

          {/* 3D Shipping Container Box that cracks open */}
          <div style={{ position: 'relative', width: 340, height: 260, perspective: 800 }}>
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 20,
                border: frame > 60 ? '2px dashed #EF4444' : '3px solid #00F0FF',
                backgroundColor: 'rgba(10, 20, 35, 0.85)',
                boxShadow: frame > 60 ? '0 0 50px rgba(239, 68, 68, 0.4)' : '0 0 50px rgba(0, 240, 255, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `rotateX(15deg) rotateY(-10deg) scale(${frame > 60 ? 1.05 : 1})`,
                transition: 'all 0.3s ease',
              }}
            >
              {frame <= 60 ? (
                <>
                  <div style={{ fontSize: 60 }}>📦</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#00F0FF', marginTop: 10 }}>DOCKER CONTAINER</div>
                  <div style={{ fontSize: 18, color: '#94A3B8', marginTop: 4 }}>Supposed "Isolated VM"</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 50, color: '#EF4444' }}>⚡</div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: '#EF4444', marginTop: 6 }}>ILLUSION SHATTERED</div>
                  <div style={{ fontSize: 20, color: '#FCA5A5', marginTop: 4, fontFamily: 'monospace' }}>
                    PID 48291 • Host CPU Thread
                  </div>
                  <div style={{ fontSize: 16, color: '#94A3B8', marginTop: 4 }}>No Hypervisor • No Guest OS</div>
                </>
              )}
            </div>
          </div>

          <div
            style={{
              marginTop: 40,
              fontSize: 28,
              fontWeight: 800,
              color: frame > 60 ? '#EF4444' : '#E2E8F0',
              textAlign: 'center',
            }}
          >
            {frame > 60 ? 'A container is just an ordinary Linux process.' : 'Is a container really a virtual machine?'}
          </div>
        </div>
      )}

      {/* ========================================================
          SCENE 2: KERNEL TRICKS & PORT CONFLICT (Frames 150 - 390)
          "A container is just a normal Linux process, isolated by cgroups and namespaces... single containers fail."
         ======================================================== */}
      {frame >= 150 && frame < 395 && (
        <div
          style={{
            position: 'absolute',
            top: 300,
            left: 50,
            right: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: interpolate(frame, [150, 165, 380, 395], [0, 1, 1, 0], { extrapolateRight: 'clamp' }),
          }}
        >
          <div
            style={{
              padding: '6px 20px',
              borderRadius: 20,
              backgroundColor: 'rgba(0, 240, 255, 0.15)',
              border: '1px solid #00F0FF',
              color: '#00F0FF',
              fontSize: 22,
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: 30,
            }}
          >
            The Two Linux Kernel Levers
          </div>

          {/* Dials for cgroups and namespaces */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32, width: '100%' }}>
            {/* 1. cgroups Dial */}
            <div
              style={{
                backgroundColor: 'rgba(10, 22, 40, 0.9)',
                border: '1.5px solid rgba(0, 240, 255, 0.4)',
                borderRadius: 24,
                padding: '28px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 12px 40px rgba(0, 240, 255, 0.1)',
              }}
            >
              <div style={{ fontSize: 26, fontWeight: 900, color: '#00F0FF', letterSpacing: '0.02em' }}>cgroups</div>
              <div style={{ fontSize: 16, color: '#94A3B8', marginTop: 4 }}>Resource Throttling</div>

              {/* High-Tech Telemetry Circle */}
              <div
                style={{
                  position: 'relative',
                  marginTop: 24,
                  width: 200,
                  height: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Rotating Outer Dashed Reticle */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    border: '2px dashed rgba(0, 240, 255, 0.4)',
                    transform: `rotate(${frame * 1.5}deg)`,
                  }}
                />

                {/* Inner Glowing Gauge Ring */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 8,
                    borderRadius: '50%',
                    border: '5px solid rgba(0, 240, 255, 0.15)',
                    borderTopColor: '#00F0FF',
                    borderRightColor: '#00F0FF',
                    boxShadow: '0 0 25px rgba(0, 240, 255, 0.3)',
                  }}
                />

                {/* Center Core HUD */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 16,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, rgba(8, 16, 32, 0.95) 75%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 10,
                  }}
                >
                  <span style={{ fontSize: 11, fontVariant: 'all-small-caps', letterSpacing: '0.18em', color: '#00F0FF', fontWeight: 800 }}>
                    MEMORY LIMIT
                  </span>
                  <span style={{ fontSize: 28, fontWeight: 900, color: '#FFFFFF', margin: '4px 0' }}>
                    512 MB
                  </span>
                  <span style={{ fontSize: 13, color: '#94A3B8', fontFamily: 'monospace', fontWeight: 600 }}>
                    CPU • 1.0 CORE
                  </span>
                  <div
                    style={{
                      marginTop: 6,
                      padding: '2px 8px',
                      borderRadius: 10,
                      backgroundColor: 'rgba(245, 158, 11, 0.2)',
                      border: '1px solid #F59E0B',
                      fontSize: 10,
                      fontWeight: 800,
                      color: '#FCD34D',
                      letterSpacing: '0.1em',
                    }}
                  >
                    THROTTLED
                  </div>
                </div>
              </div>
            </div>

            {/* 2. namespaces Dial */}
            <div
              style={{
                backgroundColor: 'rgba(10, 22, 40, 0.9)',
                border: '1.5px solid rgba(0, 240, 255, 0.4)',
                borderRadius: 24,
                padding: '28px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 12px 40px rgba(0, 240, 255, 0.1)',
              }}
            >
              <div style={{ fontSize: 26, fontWeight: 900, color: '#00F0FF', letterSpacing: '0.02em' }}>namespaces</div>
              <div style={{ fontSize: 16, color: '#94A3B8', marginTop: 4 }}>Vision & Process Masking</div>

              {/* High-Tech Telemetry Circle */}
              <div
                style={{
                  position: 'relative',
                  marginTop: 24,
                  width: 200,
                  height: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Rotating Outer Dashed Reticle */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    border: '2px dashed rgba(0, 240, 255, 0.4)',
                    transform: `rotate(${-frame * 1.5}deg)`,
                  }}
                />

                {/* Inner Glowing Gauge Ring */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 8,
                    borderRadius: '50%',
                    border: '5px solid rgba(0, 240, 255, 0.15)',
                    borderTopColor: '#00F0FF',
                    borderLeftColor: '#00F0FF',
                    boxShadow: '0 0 25px rgba(0, 240, 255, 0.3)',
                  }}
                />

                {/* Center Core HUD */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 16,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, rgba(8, 16, 32, 0.95) 75%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 10,
                  }}
                >
                  <span style={{ fontSize: 11, fontVariant: 'all-small-caps', letterSpacing: '0.18em', color: '#00F0FF', fontWeight: 800 }}>
                    KERNEL MASK
                  </span>
                  <span style={{ fontSize: 24, fontWeight: 900, color: '#FFFFFF', margin: '4px 0', letterSpacing: '0.04em' }}>
                    PID • NET
                  </span>
                  <span style={{ fontSize: 13, color: '#94A3B8', fontFamily: 'monospace', fontWeight: 600 }}>
                    IPC • MNT • UTS
                  </span>
                  <div
                    style={{
                      marginTop: 6,
                      padding: '2px 8px',
                      borderRadius: 10,
                      backgroundColor: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid #10B981',
                      fontSize: 10,
                      fontWeight: 800,
                      color: '#6EE7B7',
                      letterSpacing: '0.1em',
                    }}
                  >
                    ISOLATED
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Port Collision Warning */}
          <div
            style={{
              marginTop: 30,
              width: '100%',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '2px solid #EF4444',
              borderRadius: 16,
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 28 }}>⚠️</span>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#EF4444' }}>Port Conflict Failure</div>
                <div style={{ fontSize: 16, color: '#FCA5A5' }}>Two isolated containers cannot share localhost or port space</div>
              </div>
            </div>
            <div style={{ fontSize: 20, fontFamily: 'monospace', color: '#EF4444', fontWeight: 900 }}>ERR_IN_USE</div>
          </div>
        </div>
      )}

      {/* ========================================================
          SCENE 3: ENTER THE POD (Frames 390 - 615)
          "That is why Kubernetes created the Pod. A Pod wraps containers inside the exact same network namespace..."
         ======================================================== */}
      {frame >= 390 && frame < 620 && (
        <div
          style={{
            position: 'absolute',
            top: 290,
            left: 40,
            right: 40,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: interpolate(frame, [390, 405, 605, 620], [0, 1, 1, 0], { extrapolateRight: 'clamp' }),
          }}
        >
          <div
            style={{
              padding: '6px 22px',
              borderRadius: 20,
              backgroundColor: 'rgba(0, 240, 255, 0.2)',
              border: '1px solid #00F0FF',
              color: '#00F0FF',
              fontSize: 22,
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            The Solution: The Kubernetes Pod
          </div>

          {/* Outer Pod Hexagon Frame */}
          <div
            style={{
              width: '100%',
              maxWidth: 720,
              backgroundColor: 'rgba(10, 25, 45, 0.85)',
              borderRadius: 28,
              border: '3px solid #00F0FF',
              boxShadow: '0 0 60px rgba(0, 240, 255, 0.35)',
              padding: 30,
              position: 'relative',
            }}
          >
            {/* Header Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>🔷</span>
                <span style={{ fontSize: 26, fontWeight: 900, color: '#00F0FF' }}>Pod: api-service-7f9a</span>
              </div>
              <div
                style={{
                  padding: '6px 16px',
                  borderRadius: 12,
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid #10B981',
                  color: '#34D399',
                  fontFamily: 'monospace',
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                IP: 10.244.0.12
              </div>
            </div>

            {/* Two Containers Sharing Network */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* App Container */}
              <div
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  borderRadius: 18,
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontSize: 40 }}>⚙️</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', marginTop: 8 }}>Main App Container</div>
                <div style={{ fontSize: 16, color: '#94A3B8', marginTop: 2 }}>Node.js / Go Web Server</div>
                <div style={{ fontSize: 16, fontFamily: 'monospace', color: '#00F0FF', marginTop: 10 }}>Port: 8080</div>
              </div>

              {/* Sidecar Container */}
              <div
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  borderRadius: 18,
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontSize: 40 }}>🛡️</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', marginTop: 8 }}>Sidecar Proxy</div>
                <div style={{ fontSize: 16, color: '#94A3B8', marginTop: 2 }}>Envoy / Auth / Logging</div>
                <div style={{ fontSize: 16, fontFamily: 'monospace', color: '#00F0FF', marginTop: 10 }}>Port: 9000</div>
              </div>
            </div>

            {/* Shared Localhost Ribbon */}
            <div
              style={{
                marginTop: 20,
                padding: '12px 20px',
                borderRadius: 14,
                backgroundColor: 'rgba(0, 240, 255, 0.1)',
                border: '1px dashed #00F0FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
              }}
            >
              <span style={{ fontSize: 18, color: '#00F0FF', fontWeight: 800 }}>Shared Network Namespace</span>
              <span style={{ color: '#94A3B8' }}>•</span>
              <span style={{ fontSize: 18, color: '#FFFFFF', fontFamily: 'monospace' }}>Communicate via localhost</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SCENE 4: LIGHTSPEED LOCALHOST BEAM (Frames 615 - 765)
          "...letting them talk at lightspeed over localhost."
         ======================================================== */}
      {frame >= 615 && frame < 770 && (
        <div
          style={{
            position: 'absolute',
            top: 310,
            left: 50,
            right: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: interpolate(frame, [615, 630, 755, 770], [0, 1, 1, 0], { extrapolateRight: 'clamp' }),
          }}
        >
          <div
            style={{
              padding: '8px 24px',
              borderRadius: 30,
              backgroundColor: 'rgba(0, 240, 255, 0.2)',
              border: '2px solid #00F0FF',
              color: '#00F0FF',
              fontSize: 24,
              fontWeight: 900,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 40,
            }}
          >
            Zero-Latency Localhost Bridge
          </div>

          {/* Interactive Beam Diagram */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30, width: '100%' }}>
            {/* Node A */}
            <div
              style={{
                width: 180,
                padding: 24,
                borderRadius: 20,
                backgroundColor: 'rgba(10, 20, 35, 0.9)',
                border: '2px solid #00F0FF',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 36 }}>⚡</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#00F0FF', marginTop: 6 }}>Web Service</div>
              <div style={{ fontSize: 14, color: '#94A3B8', fontFamily: 'monospace' }}>127.0.0.1:8080</div>
            </div>

            {/* Glowing Laser Pipe with Traveling Packets */}
            <div style={{ position: 'relative', width: 220, height: 16, backgroundColor: 'rgba(0, 240, 255, 0.2)', borderRadius: 8 }}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  boxShadow: '0 0 20px #00F0FF',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: -6,
                  left: `${(frame * 5) % 180}px`,
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 0 25px #00F0FF',
                }}
              />
            </div>

            {/* Node B */}
            <div
              style={{
                width: 180,
                padding: 24,
                borderRadius: 20,
                backgroundColor: 'rgba(10, 20, 35, 0.9)',
                border: '2px solid #00F0FF',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 36 }}>🛡️</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#00F0FF', marginTop: 6 }}>Envoy Sidecar</div>
              <div style={{ fontSize: 14, color: '#94A3B8', fontFamily: 'monospace' }}>127.0.0.1:9000</div>
            </div>
          </div>

          {/* Metric Telemetry */}
          <div
            style={{
              marginTop: 40,
              padding: '16px 36px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid #10B981',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <span style={{ fontSize: 32, fontWeight: 900, color: '#34D399', fontFamily: 'monospace' }}>0.02 ms</span>
            <span style={{ fontSize: 20, color: '#E2E8F0', fontWeight: 600 }}>Memory-Bus Latency (No Network Hop)</span>
          </div>
        </div>
      )}

      {/* ========================================================
          SCENE 5: ARCHITECTURAL LAW (Frames 765 - End)
          "Never deploy bare containers. Deploy Pods."
         ======================================================== */}
      {frame >= 765 && (
        <div
          style={{
            position: 'absolute',
            top: 330,
            left: 50,
            right: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: interpolate(frame, [765, 785], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 240, 255, 0.15)',
              border: '3px solid #00F0FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 50px rgba(0, 240, 255, 0.5)',
              marginBottom: 30,
            }}
          >
            <span style={{ fontSize: 60 }}>☸️</span>
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
            The Atomic Unit of Cloud Compute
          </div>
          <div
            style={{
              fontSize: 26,
              color: '#00F0FF',
              marginTop: 16,
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            Never deploy bare containers. Deploy Pods.
          </div>
          <div
            style={{
              marginTop: 30,
              fontFamily: 'monospace',
              fontSize: 20,
              color: '#34D399',
              padding: '10px 24px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              borderRadius: 20,
              border: '1px solid #10B981',
            }}
          >
            STATUS: READY 2/2 RUNNING
          </div>
        </div>
      )}

      {/* 3. Audio & Synced Kinetic Captions */}
      <Audio src={staticFile('audio/reel_kubernetes.mp3')} />
      <VoxEditorialCaptions
        wordTimestamps={k8sData.wordTimestamps}
        accentColor="#00F0FF"
      />
    </AbsoluteFill>
  );
};
