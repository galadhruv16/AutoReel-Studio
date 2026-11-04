import fs from 'fs';
import path from 'path';
import { StudioProject, StoredProject } from '../../types/studio';

const DATA_DIR = path.join(process.cwd(), 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Read raw projects from local JSON storage
async function readLocalProjects(): Promise<StoredProject[]> {
  ensureDataDir();
  if (!fs.existsSync(PROJECTS_FILE)) {
    return [];
  }
  try {
    const raw = await fs.promises.readFile(PROJECTS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read projects file, returning empty array:', err);
    return [];
  }
}

// Write projects atomically
async function writeLocalProjects(projects: StoredProject[]): Promise<void> {
  ensureDataDir();
  const tempFile = `${PROJECTS_FILE}.tmp.${Date.now()}`;
  const content = JSON.stringify(projects, null, 2);
  await fs.promises.writeFile(tempFile, content, 'utf-8');
  await fs.promises.rename(tempFile, PROJECTS_FILE);
}

// Optional Supabase integration if environment variables are configured
function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    return { url, key };
  }
  return null;
}

/**
 * List all saved studio projects, sorted by most recently updated
 */
export async function listProjects(): Promise<StoredProject[]> {
  const local = await readLocalProjects();

  // If Supabase is configured, attempt to sync/fetch
  const sb = getSupabaseConfig();
  if (sb) {
    try {
      const res = await fetch(`${sb.url}/rest/v1/studio_projects?select=*&order=updated_at.desc`, {
        headers: {
          apikey: sb.key,
          Authorization: `Bearer ${sb.key}`,
        },
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          return rows.map((r: any) => ({
            id: r.id,
            topic: r.topic || 'Untitled Reel',
            duration: r.duration || 60,
            tone: r.tone || 'engaging',
            voice: r.voice || 'rohan',
            status: r.status || 'draft',
            scenesCount: r.scenes_count || (r.project_data?.scenes?.length ?? 0),
            videoUrl: r.video_url || null,
            srtUrl: r.srt_url || null,
            createdAt: r.created_at || new Date().toISOString(),
            updatedAt: r.updated_at || new Date().toISOString(),
            projectData: r.project_data,
          }));
        }
      }
    } catch (sbErr) {
      console.warn('Supabase fetch failed, falling back to local file store:', sbErr);
    }
  }

  return local.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/**
 * Fetch a single project by ID
 */
export async function getProjectById(id: string): Promise<StoredProject | null> {
  const projects = await listProjects();
  return projects.find((p) => p.id === id) || null;
}

/**
 * Persist or update a studio project
 */
export async function saveProject(project: StudioProject): Promise<StoredProject> {
  const now = new Date().toISOString();
  const existingList = await readLocalProjects();
  const existingIdx = existingList.findIndex((p) => p.id === project.id);

  let status: StoredProject['status'] = 'draft';
  if (project.videoUrl) {
    status = 'rendered';
  } else if (project.scenes && project.scenes.length > 0) {
    status = 'storyboarded';
  }

  const stored: StoredProject = {
    id: project.id || `proj_${Date.now()}`,
    topic: project.topic || 'Untitled Project',
    duration: project.duration,
    tone: project.tone,
    voice: project.voice,
    status,
    scenesCount: project.scenes?.length || 0,
    videoUrl: project.videoUrl || null,
    srtUrl: project.srtUrl || null,
    createdAt: existingIdx >= 0 ? existingList[existingIdx].createdAt : now,
    updatedAt: now,
    projectData: {
      ...project,
      updatedAt: now,
    },
  };

  if (existingIdx >= 0) {
    existingList[existingIdx] = stored;
  } else {
    existingList.unshift(stored);
  }

  await writeLocalProjects(existingList);

  // If Supabase is configured, upsert asynchronously
  const sb = getSupabaseConfig();
  if (sb) {
    try {
      await fetch(`${sb.url}/rest/v1/studio_projects`, {
        method: 'POST',
        headers: {
          apikey: sb.key,
          Authorization: `Bearer ${sb.key}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          id: stored.id,
          topic: stored.topic,
          duration: stored.duration,
          tone: stored.tone,
          voice: stored.voice,
          status: stored.status,
          scenes_count: stored.scenesCount,
          video_url: stored.videoUrl,
          srt_url: stored.srtUrl,
          created_at: stored.createdAt,
          updated_at: stored.updatedAt,
          project_data: stored.projectData,
        }),
      });
    } catch (sbErr) {
      console.warn('Supabase upsert failed (data saved locally):', sbErr);
    }
  }

  return stored;
}

/**
 * Delete a project by ID
 */
export async function deleteProjectById(id: string): Promise<boolean> {
  const existingList = await readLocalProjects();
  const filtered = existingList.filter((p) => p.id !== id);
  if (filtered.length === existingList.length) {
    return false;
  }

  await writeLocalProjects(filtered);

  // If Supabase is configured, delete from cloud
  const sb = getSupabaseConfig();
  if (sb) {
    try {
      await fetch(`${sb.url}/rest/v1/studio_projects?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          apikey: sb.key,
          Authorization: `Bearer ${sb.key}`,
        },
      });
    } catch (sbErr) {
      console.warn('Supabase delete failed:', sbErr);
    }
  }

  return true;
}
