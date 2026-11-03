import { StudioScene, StudioProject } from '../types/studio';
import { generateSrtContent, generateVideoChapters } from './srt';

/**
 * Generates a clean, filesystem-safe slug from the project topic.
 */
export function getTopicSlug(topic?: string): string {
  const raw = (topic || '').trim().toLowerCase();
  const slug = raw.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 36);
  return slug || 'autoreel_video';
}

/**
 * Triggers a direct file download for a given Blob.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Downloads a file from a URL using streaming Content-Disposition: attachment
 * and hidden iframe trigger to bypass browser popup and user-activation expiration limits.
 */
export async function downloadFileFromUrl(url: string, filename: string): Promise<void> {
  const cleanFilename = filename.endsWith('.mp4') ? filename : `${filename}.mp4`;

  // For server video renders, route through the dedicated attachment download endpoint
  // which streams with Content-Disposition: attachment and bypasses browser user-activation expiration.
  const isServerFile =
    url.startsWith('/renders/') ||
    url.startsWith('renders/') ||
    url.startsWith('/videos/') ||
    url.startsWith('videos/');

  const targetUrl = isServerFile
    ? `/api/studio/download?file=${encodeURIComponent(url.replace(/^\/+/, ''))}&name=${encodeURIComponent(cleanFilename)}`
    : url;

  // 1. Direct hidden iframe download (industry standard for attachment streaming without navigation or popup blocking)
  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.visibility = 'hidden';
    iframe.src = targetUrl;
    document.body.appendChild(iframe);
    setTimeout(() => {
      try {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      } catch {}
    }, 120000);
  } catch (iframeErr) {
    console.warn('Iframe download fallback:', iframeErr);
  }

  // 2. Also trigger synthetic anchor click as dual guarantee
  try {
    const link = document.createElement('a');
    link.href = targetUrl;
    link.download = cleanFilename;
    link.target = '_self';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      } catch {}
    }, 1000);
  } catch (linkErr) {
    console.warn('Anchor download fallback:', linkErr);
  }
}

/**
 * Generates and downloads a synchronized SubRip Subtitle file (.SRT).
 */
export function downloadSubtitlesSrt(scenes: StudioScene[], topic?: string): void {
  const srtContent = generateSrtContent(scenes);
  const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
  const filename = `${getTopicSlug(topic)}_subtitles.srt`;
  downloadBlob(blob, filename);
}

/**
 * Merges all synthesized scene audio buffers into a single .mp3 file and triggers download.
 */
export async function downloadVoiceoverMp3(
  scenes: StudioScene[],
  topic?: string
): Promise<{ success: boolean; count: number; error?: string }> {
  const voicedScenes = scenes.filter((s) => s.audioUrl);
  if (voicedScenes.length === 0) {
    return { success: false, count: 0, error: 'No scene audio synthesized yet.' };
  }

  try {
    const byteArrays: Uint8Array[] = [];
    for (const sc of voicedScenes) {
      if (!sc.audioUrl) continue;
      if (sc.audioUrl.startsWith('data:audio/mp3;base64,')) {
        const base64Data = sc.audioUrl.replace(/^data:audio\/mp3;base64,/, '');
        const binaryStr = atob(base64Data);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        byteArrays.push(bytes);
      } else {
        const res = await fetch(sc.audioUrl);
        if (res.ok) {
          const buf = await res.arrayBuffer();
          byteArrays.push(new Uint8Array(buf));
        }
      }
    }

    if (byteArrays.length === 0) {
      return { success: false, count: 0, error: 'Could not extract scene audio chunks.' };
    }

    const totalLength = byteArrays.reduce((acc, b) => acc + b.length, 0);
    const merged = new Uint8Array(totalLength);
    let offset = 0;
    for (const b of byteArrays) {
      merged.set(b, offset);
      offset += b.length;
    }

    const blob = new Blob([merged], { type: 'audio/mp3' });
    const filename = `${getTopicSlug(topic)}_narration.mp3`;
    downloadBlob(blob, filename);
    return { success: true, count: voicedScenes.length };
  } catch (err: any) {
    console.warn('Failed to merge and download audio:', err);
    return { success: false, count: 0, error: err?.message || 'Audio export failed' };
  }
}

/**
 * Downloads complete project storyboard and publishing metadata as structured JSON.
 */
export function downloadStoryboardJson(
  project: StudioProject,
  publishingKit?: any
): void {
  const safeScenes = project.scenes || [];
  const totalDuration = safeScenes.reduce((acc, s) => acc + (s.duration || 4), 0);

  const exportPayload = {
    schemaVersion: '2.0.0',
    exportedAt: new Date().toISOString(),
    project: {
      topic: project.topic,
      tone: project.tone,
      targetDuration: project.duration,
      actualDuration: Number(totalDuration.toFixed(2)),
      voice: project.voice,
      captionStyle: project.captionStyle,
      musicTrack: project.musicTrack,
      enableSfx: project.enableSfx !== false,
      enableMusicDucking: project.enableMusicDucking !== false,
    },
    scenes: safeScenes.map((s, idx) => ({
      index: idx + 1,
      id: s.id,
      archetype: s.visualType,
      visualDirection: s.visualDirection,
      narration: s.narration,
      highlightWords: s.highlightWords || [],
      startTime: s.startTime,
      endTime: s.endTime,
      duration: s.duration,
      audioDuration: s.audioDuration,
      hasVoiceover: Boolean(s.audioUrl),
    })),
    chapters: generateVideoChapters(safeScenes),
    srtSubtitles: generateSrtContent(safeScenes),
    publishingKit: publishingKit || null,
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const filename = `${getTopicSlug(project.topic)}_storyboard.json`;
  downloadBlob(blob, filename);
}

/**
 * Calls `/api/studio/render-reel` to render a 1080p MP4.
 */
export async function requestReelRender(params: {
  topic: string;
  voice: string;
  captionStyle: 'kinetic' | 'minimal' | 'bold';
  accentColor?: string;
  scenes: StudioScene[];
  musicUrl?: string | null;
  enableSfx?: boolean;
  enableMusicDucking?: boolean;
}): Promise<{
  success: boolean;
  videoUrl?: string;
  posterUrl?: string;
  isDynamic?: boolean;
  isServerless?: boolean;
  error?: string;
}> {
  try {
    const res = await fetch('/api/studio/render-reel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: params.topic,
        voice: params.voice,
        captionStyle: params.captionStyle,
        accentColor: params.accentColor || '#FF4F00',
        scenes: params.scenes,
        renderDynamic: true,
        musicUrl: params.musicUrl ?? 'audio/music/ambient_tension.wav',
        enableSfx: params.enableSfx !== false,
        enableMusicDucking: params.enableMusicDucking !== false,
      }),
    });

    const json = await res.json();
    if (json.success && json.data) {
      return {
        success: true,
        videoUrl: json.data.videoUrl,
        posterUrl: json.data.posterUrl,
        isDynamic: json.data.isDynamic,
        isServerless: json.data.isServerless,
      };
    }

    return {
      success: false,
      error: json.error || 'Render service returned an unexpected response',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network request to render service failed',
    };
  }
}
