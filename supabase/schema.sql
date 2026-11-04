-- ==============================================================================
-- AutoReel Studio: Supabase Schema for Projects & Reels
-- ==============================================================================

-- Create the studio_projects table
CREATE TABLE IF NOT EXISTS public.studio_projects (
    id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,
    duration INTEGER NOT NULL DEFAULT 60,
    tone TEXT NOT NULL DEFAULT 'engaging',
    voice TEXT NOT NULL DEFAULT 'rohan',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'storyboarded', 'rendered', 'published')),
    scenes_count INTEGER NOT NULL DEFAULT 0,
    video_url TEXT,
    srt_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    project_data JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.studio_projects ENABLE ROW LEVEL SECURITY;

-- Allow full access for authenticated/service role
CREATE POLICY "Allow service role full access" ON public.studio_projects
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Indexes for fast query sorting and filtering
CREATE INDEX IF NOT EXISTS idx_studio_projects_updated_at ON public.studio_projects (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_studio_projects_status ON public.studio_projects (status);

-- Optional trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_studio_projects_updated_at ON public.studio_projects;
CREATE TRIGGER trigger_studio_projects_updated_at
    BEFORE UPDATE ON public.studio_projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
