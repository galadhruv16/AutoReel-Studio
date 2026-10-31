import React, { useMemo } from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { WordBoundary } from '../../types';

interface KineticCaptionsProps {
  wordTimestamps: WordBoundary[];
  accentColor?: string;
}

interface CaptionWord {
  raw: string;
  clean: string;
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
 * Option A (One-Step Prior): Submagic / OpusClip "Karaoke Chunk" Style:
 * - Natural 3-4 word phrases visible together in all-caps bold.
 * - Viewer can read ahead effortlessly.
 * - Spoken word pops with spring physics (1.15x) and illuminates in vivid neon yellow (#FACC15).
 * - Non-spoken words remain crisp bold white (#FFFFFF) with multi-layer black contrast drop shadows.
 * - No background dock; pure kinetic typography floating cleanly.
 */
export const OpusKaraokeCaptions: React.FC<KineticCaptionsProps> = ({
  wordTimestamps,
  accentColor = '#FACC15', // Vibrant neon electric yellow
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;

  // Build natural semantic chunks of 3-4 words
  const chunks: CaptionChunk[] = useMemo(() => {
    if (!wordTimestamps || wordTimestamps.length === 0) return [];

    const result: CaptionChunk[] = [];
    let currentWords: CaptionWord[] = [];

    for (let i = 0; i < wordTimestamps.length; i++) {
      const w = wordTimestamps[i];
      const clean = w.word.toUpperCase().replace(/[.,!?;:]/g, '');
      const hasPunctuation = /[.,!?;:]$/.test(w.word);

      currentWords.push({
        raw: w.word,
        clean,
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

  // Chunk entrance spring animation
  const chunkStartFrame = Math.floor((activeChunk.startMs / 1000) * fps);
  const chunkSpring = spring({
    frame: frame - chunkStartFrame,
    fps,
    config: { damping: 14, stiffness: 220, mass: 0.6 },
  });
  const chunkScale = interpolate(chunkSpring, [0, 1], [0.94, 1]);
  const chunkOpacity = interpolate(chunkSpring, [0, 1], [0.7, 1]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 1300, // Safe Zone: Lower third above Instagram UI
        left: 60,
        right: 60,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px 20px',
        pointerEvents: 'none',
        zIndex: 100,
        transform: `scale(${chunkScale})`,
        opacity: chunkOpacity,
        transformOrigin: 'center center',
      }}
    >
      {activeChunk.words.map((wordObj, idx) => {
        const nextWord = activeChunk.words[idx + 1];
        // Word remains active until the next word begins
        const isCurrent =
          currentMs >= wordObj.startMs &&
          (nextWord ? currentMs < nextWord.startMs : currentMs <= wordObj.endMs + 300);

        const wordStartFrame = Math.floor((wordObj.startMs / 1000) * fps);
        const popSpring = spring({
          frame: frame - wordStartFrame,
          fps,
          config: { damping: 12, stiffness: 260, mass: 0.5 },
        });

        const wordScale = isCurrent ? interpolate(popSpring, [0, 1], [1.0, 1.15]) : 1.0;

        return (
          <span
            key={`${wordObj.globalIndex}-${wordObj.clean}`}
            style={{
              display: 'inline-block',
              transform: `scale(${wordScale})`,
              transformOrigin: 'center center',
              fontSize: 66,
              fontWeight: 900,
              fontFamily: '"Impact", "Montserrat", "Arial Black", sans-serif',
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              color: isCurrent ? accentColor : '#FFFFFF',
              opacity: isCurrent ? 1 : 0.88,
              padding: '0 4px',
              textShadow: isCurrent
                ? `
                  -4px -4px 0 #000,
                   4px -4px 0 #000,
                  -4px  4px 0 #000,
                   4px  4px 0 #000,
                   0 8px 24px rgba(0, 0, 0, 1),
                   0 0 35px ${accentColor}99
                `
                : `
                  -3px -3px 0 #000,
                   3px -3px 0 #000,
                  -3px  3px 0 #000,
                   3px  3px 0 #000,
                   0 6px 16px rgba(0, 0, 0, 0.9)
                `,
            }}
          >
            {wordObj.clean}
          </span>
        );
      })}
    </div>
  );
};
