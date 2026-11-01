import type { StudioScene } from '../types/studio';

/**
 * Formats seconds into standard SRT timestamp format: HH:MM:SS,mmm
 */
export function formatSrtTimestamp(seconds: number): string {
  const totalMs = Math.max(0, Math.round(seconds * 1000));
  const hrs = Math.floor(totalMs / 3600000);
  const mins = Math.floor((totalMs % 3600000) / 60000);
  const secs = Math.floor((totalMs % 60000) / 1000);
  const ms = totalMs % 1000;

  const pad = (n: number, width = 2) => String(n).padStart(width, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(ms, 3)}`;
}

/**
 * Converts an array of StudioScene beats into a valid SubRip Subtitle (.SRT) string.
 */
export function generateSrtContent(scenes: StudioScene[]): string {
  if (!scenes || scenes.length === 0) {
    return '1\n00:00:00,000 --> 00:00:05,000\nAutoReel Studio Generated Reel\n';
  }

  return scenes
    .map((scene, idx) => {
      const start = formatSrtTimestamp(scene.startTime);
      const end = formatSrtTimestamp(scene.endTime > scene.startTime ? scene.endTime : scene.startTime + scene.duration);
      return `${idx + 1}\n${start} --> ${end}\n${(scene.narration || '').trim()}\n`;
    })
    .join('\n');
}

/**
 * Generates video chapter markers from scenes for YouTube descriptions.
 */
export function generateVideoChapters(scenes: StudioScene[]): string {
  return scenes
    .map((s) => {
      const mins = Math.floor(s.startTime / 60);
      const secs = Math.floor(s.startTime % 60);
      const pad = (n: number) => String(n).padStart(2, '0');
      // Create concise 2-4 word label from visual direction or narration
      const rawDirection = s.visualDirection || '';
      const label = rawDirection.split(':')[0].replace(/kinetic|vector|crosshair|split|process/gi, '').trim() || `Scene ${s.index}`;
      return `${mins}:${pad(secs)} - ${label}`;
    })
    .join('\n');
}
