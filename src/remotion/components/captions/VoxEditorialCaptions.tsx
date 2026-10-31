import React, { useMemo } from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { WordBoundary } from '../../types';

interface KineticCaptionsProps {
  wordTimestamps: WordBoundary[];
  accentColor?: string;
}

interface CaptionWord {
  raw: string;
  startMs: number;
  endMs: number;
  globalIndex: number;
}

interface CaptionChunk {
  words: CaptionWord[];
  startMs: number;
  endMs: number;
}

/**
 * Vox / Apple Keynote Editorial Captions (User Preferred Baseline):
 * - Clean, elegant Inter font (Weight 600 SemiBold).
 * - Natural sentence casing ("If you think Kubernetes...").
 * - Minimalist frosted glass dock (blur 20px + soft 1px border).
 * - Zero scale jumping/bouncing: words never push neighbors.
 * - Calm illumination: unspoken words in muted slate (#94A3B8) -> smoothly illuminate to crisp white (#FFFFFF) with cyan underline (#38BDF8).
 */
export const VoxEditorialCaptions: React.FC<KineticCaptionsProps> = ({
  wordTimestamps,
  accentColor = '#38BDF8', // Refined sky blue accent (clean tech editorial)
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;

  // Build natural semantic chunks of 3-4 words in natural sentence case
  const chunks: CaptionChunk[] = useMemo(() => {
    if (!wordTimestamps || wordTimestamps.length === 0) return [];

    const result: CaptionChunk[] = [];
    let currentWords: CaptionWord[] = [];

    for (let i = 0; i < wordTimestamps.length; i++) {
      const w = wordTimestamps[i];
      const hasPunctuation = /[.,!?;:]$/.test(w.word);

      currentWords.push({
        raw: w.word,
        startMs: w.startMs,
        endMs: w.endMs,
        globalIndex: i,
      });

      const nextWord = wordTimestamps[i + 1];
      const gapToNext = nextWord ? nextWord.startMs - w.endMs : 0;

      // Break chunk on 4 words OR punctuation OR significant pause (>250ms)
      const shouldBreak =
        currentWords.length >= 4 ||
        hasPunctuation ||
        gapToNext > 250 ||
        i === wordTimestamps.length - 1;

      if (shouldBreak && currentWords.length > 0) {
        result.push({
          words: currentWords,
          startMs: currentWords[0].startMs,
          endMs: currentWords[currentWords.length - 1].endMs,
        });
        currentWords = [];
      }
    }

    return result;
  }, [wordTimestamps]);

  // Determine active chunk (smooth continuity: stays active until next chunk starts)
  const activeChunkIndex = useMemo(() => {
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const nextChunk = chunks[i + 1];
      const chunkEndThreshold = nextChunk ? nextChunk.startMs : chunk.endMs + 800;

      if (currentMs < chunkEndThreshold) {
        return i;
      }
    }
    return chunks.length - 1;
  }, [chunks, currentMs]);

  const activeChunk = chunks[activeChunkIndex];
  if (!activeChunk) return null;

  // Gentle fade-in for each chunk (3 frames)
  const chunkStartFrame = Math.floor((activeChunk.startMs / 1000) * fps);
  const chunkOpacity = interpolate(
    frame - chunkStartFrame,
    [0, 3],
    [0.4, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        position: 'absolute',
        top: 1330, // Safe Zone: Lower third above Instagram UI
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
        zIndex: 100,
        opacity: chunkOpacity,
      }}
    >
      {/* Sleek Frosted Editorial Glass Dock */}
      <div
        style={{
          display: 'inline-flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px 14px',
          padding: '16px 32px',
          maxWidth: '85%',
          backgroundColor: 'rgba(10, 15, 29, 0.72)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 32,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: `
            0 16px 36px rgba(0, 0, 0, 0.6),
            0 1px 0 rgba(255, 255, 255, 0.1) inset
          `,
        }}
      >
        {activeChunk.words.map((wordObj, idx) => {
          const nextWord = activeChunk.words[idx + 1];
          // Current active word
          const isCurrent =
            currentMs >= wordObj.startMs &&
            (nextWord ? currentMs < nextWord.startMs : currentMs <= wordObj.endMs + 300);

          const isPast = currentMs > wordObj.endMs;

          return (
            <span
              key={`${wordObj.globalIndex}-${wordObj.raw}`}
              style={{
                display: 'inline-block',
                fontSize: 50,
                fontWeight: isCurrent ? 700 : 500,
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                letterSpacing: '-0.01em',
                color: isCurrent
                  ? '#FFFFFF'
                  : isPast
                  ? '#E2E8F0'
                  : '#94A3B8',
                transition: 'color 0.15s ease, font-weight 0.15s ease',
                textShadow: isCurrent
                  ? `
                    0 2px 8px rgba(0, 0, 0, 0.9),
                    0 0 20px ${accentColor}88
                  `
                  : '0 2px 6px rgba(0, 0, 0, 0.6)',
                borderBottom: isCurrent
                  ? `3px solid ${accentColor}`
                  : '3px solid transparent',
                paddingBottom: 2,
              }}
            >
              {wordObj.raw}
            </span>
          );
        })}
      </div>
    </div>
  );
};
