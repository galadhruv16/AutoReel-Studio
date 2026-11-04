'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  X,
  Play,
  Copy,
  Trash2,
  Plus,
  Clock,
  Sparkles,
  Film,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { StoredProject, VOICES, StudioProject } from '../../types/studio';

interface ProjectLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectLibraryModal: React.FC<ProjectLibraryModalProps> = ({ isOpen, onClose }) => {
  const { project: currentProject, updateProject, setStage, resetProject } = useStudio();
  const [projects, setProjects] = useState<StoredProject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Fetch projects from server endpoint
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/studio/projects');
      const data = await res.json();
      if (data.success && Array.isArray(data.projects)) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.warn('Failed to load projects from library:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle opening a project
  const handleOpenProject = (stored: StoredProject) => {
    if (stored.projectData) {
      updateProject({
        ...stored.projectData,
        stage: stored.videoUrl ? 4 : stored.scenesCount > 0 ? 3 : 1,
      });
      setStage(stored.videoUrl ? 4 : stored.scenesCount > 0 ? 3 : 1);
      onClose();
    }
  };

  // Handle duplicating a project
  const handleDuplicateProject = async (stored: StoredProject) => {
    if (!stored.projectData) return;
    const duplicated: StudioProject = {
      ...stored.projectData,
      id: `proj_${Date.now()}`,
      topic: `${stored.topic} (Copy)`,
      videoUrl: null, // clear rendered output so copy can be edited cleanly
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/studio/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: duplicated }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess('Project duplicated successfully!');
        setTimeout(() => setActionSuccess(null), 3000);
        fetchProjects();
      }
    } catch (err) {
      console.error('Failed to duplicate project:', err);
    }
  };

  // Handle deleting a project
  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/studio/projects/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        setActionSuccess('Project deleted.');
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Handle starting a fresh project
  const handleCreateNew = () => {
    resetProject();
    setStage(1);
    onClose();
  };

  // Filtered list
  const filtered = projects.filter((p) => {
    const matchesQuery =
      p.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.voice.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || p.status === filterStatus;
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl border border-[#232634] bg-[#0E1015] shadow-2xl overflow-hidden text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#232634] p-5 sm:px-6 bg-[#14161F]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF4F00]/15 text-[#FF4F00] border border-[#FF4F00]/30 shadow-md shadow-[#FF4F00]/20">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Project Library
                <span className="text-xs font-mono font-medium text-[#FF4F00] bg-[#FF4F00]/10 px-2 py-0.5 rounded-full border border-[#FF4F00]/20">
                  {projects.length} saved
                </span>
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Browse, reopen, duplicate, and manage all your generated storyboards and reels.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCreateNew}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF4F00] px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-[#FF4F00]/20 hover:bg-[#FF3B00] transition active:scale-95"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span className="hidden sm:inline">New Project</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-[#94A3B8] hover:text-white hover:bg-[#232634] transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Action feedback banner */}
        {actionSuccess && (
          <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-6 py-2 flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[#232634] p-4 bg-[#0A0B0E]">
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by topic or voice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#232634] bg-[#14161F] px-3.5 py-2 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#FF4F00] transition"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Projects' },
              { id: 'rendered', label: 'Rendered Videos' },
              { id: 'storyboarded', label: 'Storyboards' },
              { id: 'draft', label: 'Drafts' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-[#FF4F00]/20 text-[#FF4F00] border border-[#FF4F00]/40'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#14161F]'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <button
              type="button"
              onClick={fetchProjects}
              title="Refresh projects list"
              className="p-1.5 text-[#94A3B8] hover:text-white rounded-lg hover:bg-[#14161F] transition ml-1"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-[#FF4F00]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Projects Grid / List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#FF4F00]" />
              <p className="text-xs text-[#94A3B8]">Loading project library...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 border border-dashed border-[#232634] rounded-2xl bg-[#14161F]/40 p-8">
              <Film className="h-10 w-10 text-[#64748B]" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">No projects found</p>
                <p className="text-xs text-[#94A3B8] max-w-sm">
                  {searchQuery || filterStatus !== 'all'
                    ? 'Try adjusting your search query or status filter.'
                    : 'You have not saved any reels yet. Generate a video in AutoReel Studio and it will appear here.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCreateNew}
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-[#FF4F00] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#FF3B00] transition"
              >
                <Plus className="h-4 w-4" />
                <span>Create First Reel</span>
              </button>
            </div>
          ) : (
            filtered.map((item) => {
              const voiceObj = VOICES.find((v) => v.id === item.voice) || VOICES[0];
              const isCurrent = currentProject.id === item.id;
              const dateStr = new Date(item.updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-4 sm:p-5 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isCurrent
                      ? 'border-[#FF4F00]/50 bg-[#161317] shadow-lg shadow-[#FF4F00]/5'
                      : 'border-[#232634] bg-[#14161F] hover:border-[#3D445C] hover:bg-[#181B26]'
                  }`}
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.status === 'rendered' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Rendered 1080p</span>
                        </span>
                      ) : item.status === 'storyboarded' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/25 px-2 py-0.5 rounded-full">
                          <FileText className="h-3 w-3" />
                          <span>Storyboard Ready</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#94A3B8] bg-[#232634]/50 border border-[#232634] px-2 py-0.5 rounded-full">
                          <span>Draft</span>
                        </span>
                      )}

                      {isCurrent && (
                        <span className="text-[10px] font-mono font-bold uppercase text-[#FF4F00] bg-[#FF4F00]/10 border border-[#FF4F00]/30 px-2 py-0.5 rounded-full">
                          Active in Studio
                        </span>
                      )}

                      <span className="text-[11px] font-mono text-[#64748B] flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {dateStr}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-white truncate" title={item.topic}>
                      {item.topic}
                    </h4>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                      <span className="text-[#EDEDED] bg-[#08090A] border border-[#232634] px-2 py-0.5 rounded-md">
                        {voiceObj.flag} {voiceObj.name}
                      </span>
                      <span className="text-[#94A3B8] bg-[#08090A] border border-[#232634] px-2 py-0.5 rounded-md">
                        ⏱ {item.duration}s
                      </span>
                      <span className="text-[#94A3B8] bg-[#08090A] border border-[#232634] px-2 py-0.5 rounded-md capitalize">
                        🎭 {item.tone}
                      </span>
                      <span className="text-[#94A3B8] bg-[#08090A] border border-[#232634] px-2 py-0.5 rounded-md">
                        🎬 {item.scenesCount} scenes
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#232634]">
                    <button
                      type="button"
                      onClick={() => handleOpenProject(item)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF4F00] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#FF4F00]/20 hover:bg-[#FF3B00] transition active:scale-95 cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5 fill-white" />
                      <span>Open</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDuplicateProject(item)}
                      title="Duplicate project"
                      className="p-2 rounded-xl border border-[#232634] bg-[#0E1015] text-[#94A3B8] hover:text-white hover:border-[#3D445C] transition cursor-pointer"
                    >
                      <Copy className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteProject(item.id)}
                      disabled={deletingId === item.id}
                      title="Delete project"
                      className="p-2 rounded-xl border border-[#232634] bg-[#0E1015] text-[#94A3B8] hover:text-red-400 hover:border-red-500/40 transition cursor-pointer disabled:opacity-50"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
