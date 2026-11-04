export type StudioDuration = 30 | 60 | 90;

export type StudioTone = 'engaging' | 'academic' | 'narrative' | 'casual';

export type VoiceId = 'rohan' | 'priya' | 'alloy' | 'echo' | 'fable' | 'nova' | 'ryan' | 'sonia';

export interface VoiceOption {
  id: VoiceId;
  name: string;
  edgeVoice: string;
  description: string;
  gender: 'Female' | 'Male';
  region: 'Indian English' | 'US English' | 'British English';
  flag: string;
  sampleAudio: string;
}

export type VisualArchetype =
  | 'kinetic_text'
  | 'vector_schematic'
  | 'crosshair_target'
  | 'split_comparison'
  | 'process_flow'
  | 'dynamic_chart'
  | 'timeline'
  | 'step_sequence'
  | 'code_terminal'
  | 'investigative_dossier';

export type SfxCue = 'bass_drop' | 'whoosh' | 'pop' | 'typewriter' | 'none';

export interface DynamicGraphicData {
  badge?: string;
  headline: string;
  subtext?: string;
  statNumber?: string;
  statLabel?: string;
  leftItem?: { title: string; desc: string };
  rightItem?: { title: string; desc: string };
  comparison?: {
    left: { heading: string; points: string[] };
    right: { heading: string; points: string[] };
  };
  steps?: Array<{ num: string; title: string; desc?: string }>;
  milestones?: Array<{ date: string; title: string }>;
  keyTags?: string[];
}

export interface StudioScene {
  id: string;
  index: number;
  startTime: number; // in seconds
  endTime: number; // in seconds
  duration: number; // in seconds
  narration: string;
  visualDirection: string;
  visualType: VisualArchetype;
  highlightWords?: string[];
  cue?: string; // Exact verbatim substring of narration that triggers visual reveal
  cueFrame?: number; // Exact Remotion frame when cue is spoken (relative to scene start)
  decisionCue?: string; // Secondary verbatim substring for state transition / comparison
  decisionFrame?: number;
  graphicData?: DynamicGraphicData;
  audioUrl?: string;
  audioDuration?: number; // Exact spoken audio duration in seconds
  sfxCue?: SfxCue;
}

export interface StudioProject {
  id: string;
  stage: 1 | 2 | 3 | 4;
  topic: string;
  duration: StudioDuration;
  tone: StudioTone;
  voice: VoiceId;
  scriptMode: 'ai_generate' | 'own_script';
  customScript: string;
  scenes: StudioScene[];
  selectedSceneIndex: number;
  captionStyle: 'kinetic' | 'minimal' | 'bold';
  aspectRatio: '9:16';
  videoUrl: string | null;
  srtUrl: string | null;
  musicTrack?: {
    id: string;
    name: string;
    url: string;
    enabled: boolean;
  };
  enableSfx?: boolean;
  enableMusicDucking?: boolean;
  publishing: {
    platform: 'youtube' | 'instagram' | 'tiktok' | 'linkedin';
    title: string;
    description: string;
    hashtags: string[];
  };
  updatedAt: string;
}

export const VOICES: VoiceOption[] = [
  {
    id: 'rohan',
    name: 'Rohan',
    edgeVoice: 'en-IN-PrabhatNeural',
    description: 'Clear, natural, and authoritative Indian English educational delivery',
    gender: 'Male',
    region: 'Indian English',
    flag: '🇮🇳',
    sampleAudio: '/audio/samples/rohan.mp3',
  },
  {
    id: 'priya',
    name: 'Priya',
    edgeVoice: 'en-IN-NeerjaNeural',
    description: 'Warm, articulate, and engaging Indian English educator voice',
    gender: 'Female',
    region: 'Indian English',
    flag: '🇮🇳',
    sampleAudio: '/audio/samples/priya.mp3',
  },
  {
    id: 'alloy',
    name: 'Alloy',
    edgeVoice: 'en-US-JennyNeural',
    description: 'Clear, balanced, and documentary-style US cadence',
    gender: 'Female',
    region: 'US English',
    flag: '🇺🇸',
    sampleAudio: '/audio/samples/alloy.mp3',
  },
  {
    id: 'echo',
    name: 'Echo',
    edgeVoice: 'en-US-BrianMultilingualNeural',
    description: 'Energetic, crisp, and high-tech modern explainer',
    gender: 'Male',
    region: 'US English',
    flag: '🇺🇸',
    sampleAudio: '/audio/samples/echo.mp3',
  },
  {
    id: 'fable',
    name: 'Fable',
    edgeVoice: 'en-US-AndrewMultilingualNeural',
    description: 'Deep, resonant, and editorial narrative voice',
    gender: 'Male',
    region: 'US English',
    flag: '🇺🇸',
    sampleAudio: '/audio/samples/fable.mp3',
  },
  {
    id: 'nova',
    name: 'Nova',
    edgeVoice: 'en-US-AvaMultilingualNeural',
    description: 'Calm, polished, and confident modern delivery',
    gender: 'Female',
    region: 'US English',
    flag: '🇺🇸',
    sampleAudio: '/audio/samples/nova.mp3',
  },
  {
    id: 'ryan',
    name: 'Ryan',
    edgeVoice: 'en-GB-RyanNeural',
    description: 'Distinguished, articulate, and formal British narration',
    gender: 'Male',
    region: 'British English',
    flag: '🇬🇧',
    sampleAudio: '/audio/samples/ryan.mp3',
  },
  {
    id: 'sonia',
    name: 'Sonia',
    edgeVoice: 'en-GB-SoniaNeural',
    description: 'Expressive, clear, and modern British storytelling',
    gender: 'Female',
    region: 'British English',
    flag: '🇬🇧',
    sampleAudio: '/audio/samples/sonia.mp3',
  },
];

export const TONES: { id: StudioTone; label: string; description: string }[] = [
  {
    id: 'engaging',
    label: 'Engaging & Direct (Fast-paced)',
    description: 'High hook retention, punchy sentences, minimal fluff.',
  },
  {
    id: 'academic',
    label: 'Academic & Thorough',
    description: 'Precise scientific nomenclature, systematic explanations.',
  },
  {
    id: 'narrative',
    label: 'Storytelling & Dramatic',
    description: 'High-stakes historical or conceptual story arc.',
  },
  {
    id: 'casual',
    label: 'Conversational & Casual',
    description: 'Relatable analogies, friendly, accessible language.',
  },
];

export const DURATION_CONFIGS: Record<
  StudioDuration,
  { label: string; targetWords: number; sceneCount: string; description: string }
> = {
  30: {
    label: '30 Seconds',
    targetWords: 65,
    sceneCount: '3-4 Scenes',
    description: 'Fast viral hook, perfect for single-concept punchy reels',
  },
  60: {
    label: '60 Seconds',
    targetWords: 130,
    sceneCount: '5-7 Scenes',
    description: 'Standard explainer, optimal balance of depth and engagement',
  },
  90: {
    label: '90 Seconds',
    targetWords: 200,
    sceneCount: '7-10 Scenes',
    description: 'Deep dive, comprehensive multi-stage breakdown',
  },
};

export interface StoredProject {
  id: string;
  topic: string;
  duration: StudioDuration;
  tone: StudioTone;
  voice: VoiceId;
  status: 'draft' | 'storyboarded' | 'rendered' | 'published';
  scenesCount: number;
  videoUrl?: string | null;
  srtUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  projectData: StudioProject;
}

export interface InstagramPublishPayload {
  projectId?: string;
  videoUrl: string;
  caption: string;
  scheduledPublishTime?: number; // unix timestamp in seconds
  coverUrl?: string;
  thumbOffsetMs?: number;
  accessToken?: string;
  instagramAccountId?: string;
}

export interface InstagramPublishResult {
  success: boolean;
  mode: 'live' | 'sandbox';
  containerId?: string;
  mediaId?: string;
  permalink?: string;
  status?: string;
  scheduledTime?: string;
  message?: string;
  error?: string;
}

