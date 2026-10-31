export interface WordBoundary {
  word: string;
  startMs: number;
  endMs: number;
}

export interface SpikeReelProps {
  headline: string;
  subheadline: string;
  badgeText: string;
  audioPath: string;
  wordTimestamps: WordBoundary[];
  showSafeZone?: boolean;
  captionStyle?: 'vox-editorial' | 'opus-karaoke';
}
