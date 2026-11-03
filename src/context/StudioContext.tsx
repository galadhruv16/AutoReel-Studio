'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { StudioProject, StudioDuration, StudioTone, VoiceId } from '../types/studio';

const STORAGE_KEY = 'autoreel_studio_project_v2';

const DEFAULT_PROJECT: StudioProject = {
  id: 'proj_' + Date.now(),
  stage: 1,
  topic: '',
  duration: 60,
  tone: 'engaging',
  voice: 'alloy',
  scriptMode: 'ai_generate',
  customScript: '',
  scenes: [],
  selectedSceneIndex: 0,
  captionStyle: 'kinetic',
  aspectRatio: '9:16',
  videoUrl: null,
  srtUrl: null,
  publishing: {
    platform: 'youtube',
    title: '',
    description: '',
    hashtags: [],
  },
  updatedAt: new Date().toISOString(),
};

interface StudioContextType {
  project: StudioProject;
  setTopic: (topic: string) => void;
  setDuration: (duration: StudioDuration) => void;
  setTone: (tone: StudioTone) => void;
  setVoice: (voice: VoiceId) => void;
  setStage: (stage: 1 | 2 | 3 | 4) => void;
  setScriptMode: (mode: 'ai_generate' | 'own_script') => void;
  setCustomScript: (script: string) => void;
  updateProject: (updates: Partial<StudioProject>) => void;
  resetProject: () => void;
  isReadyForStage2: boolean;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [project, setProject] = useState<StudioProject>(DEFAULT_PROJECT);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage safely after client mount to prevent SSR hydration mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setProject({
          ...DEFAULT_PROJECT,
          ...parsed,
          duration: [30, 60, 90].includes(parsed.duration) ? parsed.duration : 60,
        });
      }
    } catch (e) {
      console.warn('Failed to load studio project from localStorage', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save to localStorage on changes (only after initial client hydration)
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch (e) {
      console.warn('Failed to persist studio project', e);
    }
  }, [project, isHydrated]);

  const updateProject = (updates: Partial<StudioProject>) => {
    setProject((prev) => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  };

  const setTopic = (topic: string) => {
    setProject((prev) => ({
      ...prev,
      topic,
      videoUrl: prev.topic !== topic ? null : prev.videoUrl,
      updatedAt: new Date().toISOString(),
    }));
  };
  const setDuration = (duration: StudioDuration) => {
    setProject((prev) => {
      const durationChanged = prev.duration !== duration;
      return {
        ...prev,
        duration,
        scenes: durationChanged ? [] : prev.scenes,
        videoUrl: durationChanged ? null : prev.videoUrl,
        updatedAt: new Date().toISOString(),
      };
    });
  };
  const setTone = (tone: StudioTone) => updateProject({ tone });
  const setVoice = (voice: VoiceId) => {
    setProject((prev) => {
      const voiceChanged = prev.voice !== voice;
      return {
        ...prev,
        voice,
        scenes: voiceChanged
          ? prev.scenes.map((s) => ({ ...s, audioUrl: undefined, audioDuration: undefined }))
          : prev.scenes,
        updatedAt: new Date().toISOString(),
      };
    });
  };
  const setStage = (stage: 1 | 2 | 3 | 4) => updateProject({ stage });
  const setScriptMode = (scriptMode: 'ai_generate' | 'own_script') => updateProject({ scriptMode });
  const setCustomScript = (customScript: string) => updateProject({ customScript });

  const resetProject = () => {
    const fresh: StudioProject = {
      ...DEFAULT_PROJECT,
      id: 'proj_' + Date.now(),
      updatedAt: new Date().toISOString(),
    };
    setProject(fresh);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  };

  const isReadyForStage2 = Boolean(project.topic && project.topic.trim().length >= 5);

  return (
    <StudioContext.Provider
      value={{
        project,
        setTopic,
        setDuration,
        setTone,
        setVoice,
        setStage,
        setScriptMode,
        setCustomScript,
        updateProject,
        resetProject,
        isReadyForStage2,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
};

export const useStudio = (): StudioContextType => {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
};
