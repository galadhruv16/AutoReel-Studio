export type StudioDuration = 30 | 60 | 90;

export type StudioTone = 'engaging' | 'academic' | 'narrative' | 'casual';

export type VoiceId = 'alloy' | 'echo' | 'fable' | 'nova';

export interface VoiceOption {
  id: VoiceId;
  name: string;
  edgeVoice: string;
  description: string;
  gender: 'Female' | 'Male';
  sampleAudio: string;
}

export interface StudioScene {
  id: string;
  index: number;
  startTime: number; // in seconds
  endTime: number; // in seconds
  duration: number; // in seconds
  narration: string;
  visualDirection: string;
  visualType: 'kinetic_text' | 'vector_schematic' | 'crosshair_target' | 'split_comparison' | 'process_flow';
  highlightWords?: string[];
  audioUrl?: string;
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
    id: 'alloy',
    name: 'Alloy',
    edgeVoice: 'en-US-JennyNeural',
    description: 'Warm, clear, and natural documentary cadence',
    gender: 'Female',
    sampleAudio: '/audio/reel_genetics.mp3',
  },
  {
    id: 'echo',
    name: 'Echo',
    edgeVoice: 'en-US-BrianMultilingualNeural',
    description: 'Energetic, crisp, and authoritative technical explainer',
    gender: 'Male',
    sampleAudio: '/audio/reel_kubernetes.mp3',
  },
  {
    id: 'fable',
    name: 'Fable',
    edgeVoice: 'en-US-AndrewMultilingualNeural',
    description: 'Deep, resonant, and editorial narrative voice',
    gender: 'Male',
    sampleAudio: '/audio/reel_saraighat.mp3',
  },
  {
    id: 'nova',
    name: 'Nova',
    edgeVoice: 'en-US-AvaMultilingualNeural',
    description: 'Calm, polished, and confident modern delivery',
    gender: 'Female',
    sampleAudio: '/audio/spike_test.mp3',
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
