# Database Schema & Data Architecture Specification

# Project: AutoReel Studio
**Version:** 1.0.0  
**Status:** Approved Architecture Baseline  
**Target Database:** PostgreSQL 15+ (Compatible with Supabase, Neon, AWS RDS, self-hosted)  
**ORM / Data Layer:** Drizzle ORM / Prisma / Kysely (TypeScript-first)

---

## 1. Architectural Principles & State Dimensions

To prevent race conditions, silent data corruption, and accidental duplicate publications, the data architecture enforces five foundational principles:

1. **Strict Multi-Tenant Workspace Isolation:** Every query and write operation derives the `workspace_id` and `user_id` directly from the authenticated session context. Foreign key cascades enforce private boundaries.
2. **Immutable Approval Snapshots:** When a creator approves a storyboard or a video, that snapshot is frozen with a unique version ID. Subsequent revisions generate new versions—they never mutate an approved record in place.
3. **5 Decoupled State Dimensions:** The project lifecycle does not depend on a single, overloaded `status` column. Instead, five independent state machines govern the lifecycle:
   - **`StoryboardVersion.status`**: `draft` | `planning` | `review_ready` | `approved` | `superseded` | `failed`
   - **`GenerationJob.status`**: `queued` | `running` | `cancel_requested` | `cancelled` | `succeeded` | `failed`
   - **`VideoVersion.status`**: `building` | `validating` | `ready_for_review` | `approved` | `failed`
   - **`PublishIntent.status`**: `draft` | `scheduled` | `preparing_media` | `publishing` | `published` | `failed` | `needs_attention` | `outcome_unknown` | `cancelled`
   - **`InstagramConnection.status`**: `connected` | `reauth_required` | `disconnected`
4. **Atomic Worker Leases & Idempotency:** Background workers (Inngest / BullMQ) acquire timed leases using database-level atomic updates (`FOR UPDATE SKIP LOCKED`) to prevent concurrent duplicate renders or duplicate social postings.
5. **SHA-256 Asset Deduplication:** All generated speech audio and visual assets are indexed by content hashes, enabling instant cache hits during conversational revisions.

---

## 2. Entity-Relationship Diagram (ERD)

```
┌─────────────────┐
│      users      │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐        1:1        ┌────────────────────────┐
│   workspaces    │───────────────────│ instagram_connections  │
└────────┬────────┘                   └────────────────────────┘
         │ 1:N
         ▼
┌─────────────────┐
│    projects     │
└────────┬────────┘
         │ 1:N
         ├──────────────────────────────────────────┐
         │                                          │
         ▼                                          ▼
┌───────────────────────┐                  ┌──────────────────┐
│  storyboard_versions  │                  │ generation_jobs  │
└────────┬──────────────┘                  └────────┬─────────┘
         │ 1:N                                      │ 1:1
         ├────────────────────┐                     ▼
         │                    │            ┌──────────────────┐
         ▼                    ▼            │  video_versions  │
┌─────────────────┐  ┌─────────────────┐   └────────┬─────────┘
│     scenes      │  │  audio_assets   │            │ 1:N
└────────┬────────┘  └─────────────────┘            ▼
         │ 1:N                             ┌──────────────────┐
         ▼                                 │ publish_intents  │
┌─────────────────┐                        └──────────────────┘
│  visual_assets  │
└─────────────────┘
```

---

## 3. PostgreSQL DDL (Data Definition Language)

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE duration_target_enum AS ENUM ('30', '60', '90');

CREATE TYPE pacing_mode_enum AS ENUM (
    'fast_punchy', 
    'balanced', 
    'deep_dive'
);

CREATE TYPE motion_pattern_enum AS ENUM (
    'title_hook',
    'labeled_diagram',
    'process_flow',
    'comparison',
    'timeline',
    'dynamic_chart',
    'step_sequence',
    'kinetic_summary'
);

CREATE TYPE visual_asset_type_enum AS ENUM (
    'lucide_icon',
    'flux_image',
    'code_snippet',
    'none'
);

CREATE TYPE sfx_cue_enum AS ENUM (
    'whoosh',
    'pop',
    'click',
    'none'
);

CREATE TYPE storyboard_status_enum AS ENUM (
    'draft',
    'planning',
    'review_ready',
    'approved',
    'superseded',
    'failed'
);

CREATE TYPE job_status_enum AS ENUM (
    'queued',
    'running',
    'cancel_requested',
    'cancelled',
    'succeeded',
    'failed'
);

CREATE TYPE video_status_enum AS ENUM (
    'building',
    'validating',
    'ready_for_review',
    'approved',
    'failed'
);

CREATE TYPE publish_status_enum AS ENUM (
    'draft',
    'scheduled',
    'preparing_media',
    'publishing',
    'published',
    'failed',
    'needs_attention',
    'outcome_unknown',
    'cancelled'
);

CREATE TYPE ig_connection_status_enum AS ENUM (
    'connected',
    'reauth_required',
    'disconnected'
);

-- ============================================================================
-- 1. USERS & WORKSPACES
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email CITEXT UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(100),
    preferred_timezone VARCHAR(50) DEFAULT 'UTC' NOT NULL,
    preferred_voice_preset VARCHAR(50) DEFAULT 'en-US-ChristopherNeural' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_personal BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_workspace_owner_personal UNIQUE (owner_id, is_personal)
);

CREATE INDEX idx_workspaces_owner ON workspaces(owner_id);

-- ============================================================================
-- 2. PROJECTS
-- ============================================================================

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    seed_topic TEXT NOT NULL,
    source_notes TEXT,
    duration_target duration_target_enum DEFAULT '60' NOT NULL,
    pacing_mode pacing_mode_enum DEFAULT 'balanced' NOT NULL,
    voice_preset VARCHAR(50) DEFAULT 'en-US-ChristopherNeural' NOT NULL,
    theme_config JSONB DEFAULT '{
        "palette": {
            "primary": "#3B82F6",
            "secondary": "#1E293B",
            "background": "#0F172A",
            "text": "#F8FAFC",
            "accent": "#F59E0B"
        },
        "fontFamily": "Inter",
        "soundDesignEnabled": true,
        "backgroundMusicTrackId": "lofi-ambient",
        "musicVolume": 0.25
    }'::JSONB NOT NULL,
    active_storyboard_version_id UUID, -- References approved/active storyboard
    latest_video_version_id UUID,      -- References latest successful video render
    is_archived BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_projects_workspace ON projects(workspace_id);
CREATE INDEX idx_projects_updated ON projects(updated_at DESC);

-- ============================================================================
-- 3. STORYBOARD VERSIONS & SCENES
-- ============================================================================

CREATE TABLE storyboard_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    parent_version_id UUID REFERENCES storyboard_versions(id) ON DELETE SET NULL,
    version_number INTEGER NOT NULL,
    status storyboard_status_enum DEFAULT 'draft' NOT NULL,
    title VARCHAR(150) NOT NULL,
    learning_objective VARCHAR(300) NOT NULL,
    hook_type VARCHAR(50) DEFAULT 'curiosity_gap' NOT NULL,
    approved_at TIMESTAMPTZ,
    revision_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_project_version_number UNIQUE (project_id, version_number)
);

CREATE INDEX idx_storyboard_versions_project ON storyboard_versions(project_id, status);

CREATE TABLE scenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    storyboard_version_id UUID NOT NULL REFERENCES storyboard_versions(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    voiceover_text TEXT NOT NULL,
    pronunciation_notes JSONB DEFAULT '{}'::JSONB NOT NULL,
    motion_pattern motion_pattern_enum NOT NULL,
    pattern_params JSONB NOT NULL,
    highlight_keywords TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
    visual_asset_type visual_asset_type_enum DEFAULT 'none' NOT NULL,
    visual_asset_value TEXT,
    sfx_cue sfx_cue_enum DEFAULT 'whoosh' NOT NULL,
    estimated_duration_seconds NUMERIC(4,2) NOT NULL,
    measured_duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_scene_order UNIQUE (storyboard_version_id, order_index)
);

CREATE INDEX idx_scenes_version ON scenes(storyboard_version_id, order_index);

-- ============================================================================
-- 4. AUDIO ASSETS & ALIGNMENT
-- ============================================================================

CREATE TABLE audio_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
    content_hash VARCHAR(64) NOT NULL, -- SHA256(text + voice_id + pronunciation_notes)
    provider VARCHAR(50) NOT NULL,    -- 'edge_tts' | 'elevenlabs'
    voice_id VARCHAR(100) NOT NULL,
    storage_url TEXT NOT NULL,
    duration_ms INTEGER NOT NULL,
    word_timestamps JSONB NOT NULL,   -- Array of { word, startMs, endMs }
    file_size_bytes INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_audio_content_hash UNIQUE (content_hash)
);

CREATE INDEX idx_audio_assets_scene ON audio_assets(scene_id);
CREATE INDEX idx_audio_assets_hash ON audio_assets(content_hash);

-- ============================================================================
-- 5. VISUAL ASSETS (FLUX AI / VECTORS)
-- ============================================================================

CREATE TABLE visual_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
    content_hash VARCHAR(64) NOT NULL, -- SHA256(prompt/icon_identifier + type)
    asset_type visual_asset_type_enum NOT NULL,
    storage_url TEXT NOT NULL,
    mime_type VARCHAR(50) NOT NULL,
    width INTEGER DEFAULT 1080 NOT NULL,
    height INTEGER DEFAULT 1920 NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_visual_content_hash UNIQUE (content_hash)
);

CREATE INDEX idx_visual_assets_scene ON visual_assets(scene_id);
CREATE INDEX idx_visual_assets_hash ON visual_assets(content_hash);

-- ============================================================================
-- 6. GENERATION JOBS (DURABLE WORKFLOW EXECUTION)
-- ============================================================================

CREATE TABLE generation_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    storyboard_version_id UUID NOT NULL REFERENCES storyboard_versions(id) ON DELETE CASCADE,
    status job_status_enum DEFAULT 'queued' NOT NULL,
    stage VARCHAR(50) DEFAULT 'preparing_scenes' NOT NULL,
    progress_percentage SMALLINT DEFAULT 0 NOT NULL,
    worker_lease_id VARCHAR(100),
    lease_expires_at TIMESTAMPTZ,
    attempt_count SMALLINT DEFAULT 0 NOT NULL,
    max_attempts SMALLINT DEFAULT 3 NOT NULL,
    error_category VARCHAR(50),
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_jobs_status_lease ON generation_jobs(status, lease_expires_at);
CREATE INDEX idx_jobs_project ON generation_jobs(project_id);

-- ============================================================================
-- 7. VIDEO VERSIONS (RENDERED OUTPUTS)
-- ============================================================================

CREATE TABLE video_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    storyboard_version_id UUID NOT NULL REFERENCES storyboard_versions(id) ON DELETE CASCADE,
    generation_job_id UUID REFERENCES generation_jobs(id) ON DELETE SET NULL,
    status video_status_enum DEFAULT 'building' NOT NULL,
    storage_url TEXT,
    thumbnail_url TEXT,
    duration_frames INTEGER NOT NULL,
    fps SMALLINT DEFAULT 30 NOT NULL,
    duration_seconds NUMERIC(5,2) NOT NULL,
    width INTEGER DEFAULT 1080 NOT NULL,
    height INTEGER DEFAULT 1920 NOT NULL,
    file_size_bytes BIGINT,
    render_duration_ms INTEGER,
    validation_results JSONB DEFAULT '{
        "audioPresenceValid": true,
        "captionBoundsValid": true,
        "durationCompliant": true,
        "integrityCheckPassed": true
    }'::JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_video_versions_project ON video_versions(project_id, status);

-- Add foreign key constraints back to projects
ALTER TABLE projects 
    ADD CONSTRAINT fk_projects_active_storyboard 
    FOREIGN KEY (active_storyboard_version_id) 
    REFERENCES storyboard_versions(id) 
    ON DELETE SET NULL;

ALTER TABLE projects 
    ADD CONSTRAINT fk_projects_latest_video 
    FOREIGN KEY (latest_video_version_id) 
    REFERENCES video_versions(id) 
    ON DELETE SET NULL;

-- ============================================================================
-- 8. INSTAGRAM CONNECTIONS & PUBLISH INTENTS
-- ============================================================================

CREATE TABLE instagram_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID UNIQUE NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    ig_user_id VARCHAR(100) NOT NULL,
    ig_username VARCHAR(100) NOT NULL,
    account_type VARCHAR(50) DEFAULT 'CREATOR' NOT NULL, -- 'CREATOR' | 'BUSINESS'
    encrypted_access_token TEXT NOT NULL,
    token_expires_at TIMESTAMPTZ NOT NULL,
    status ig_connection_status_enum DEFAULT 'connected' NOT NULL,
    connected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_ig_connections_workspace ON instagram_connections(workspace_id);

CREATE TABLE publish_intents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    video_version_id UUID NOT NULL REFERENCES video_versions(id) ON DELETE CASCADE,
    instagram_connection_id UUID NOT NULL REFERENCES instagram_connections(id) ON DELETE CASCADE,
    status publish_status_enum DEFAULT 'draft' NOT NULL,
    post_caption TEXT NOT NULL,
    hashtags TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
    scheduled_utc TIMESTAMPTZ,
    origin_timezone VARCHAR(50) NOT NULL,
    meta_container_id VARCHAR(100),
    meta_media_id VARCHAR(100),
    permalink TEXT,
    error_message TEXT,
    retry_count SMALLINT DEFAULT 0 NOT NULL,
    worker_lease_id VARCHAR(100),
    lease_expires_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_publish_intents_due ON publish_intents(status, scheduled_utc) 
    WHERE status = 'scheduled';
CREATE INDEX idx_publish_intents_lease ON publish_intents(status, lease_expires_at);

-- ============================================================================
-- 9. AUDIT & DIAGNOSTIC OPERATION LOGS
-- ============================================================================

CREATE TABLE operation_events (
    id BIGSERIAL PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- 'storyboard' | 'generation_job' | 'publish'
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,      -- 'created' | 'approved' | 'failed' | 'published'
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    correlation_id UUID NOT NULL,
    metadata JSONB DEFAULT '{}'::JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_operation_events_entity ON operation_events(entity_type, entity_id);
CREATE INDEX idx_operation_events_correlation ON operation_events(correlation_id);
```

---

## 4. TypeScript Drizzle Schema Definitions

To ensure complete type safety across Next.js API routes and Inngest workflows, here is the corresponding **Drizzle ORM** schema file (`src/lib/db/schema.ts`):

```typescript
import { pgTable, uuid, varchar, text, boolean, timestamp, integer, numeric, smallint, bigint, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const durationTargetEnum = pgEnum('duration_target_enum', ['30', '60', '90']);
export const pacingModeEnum = pgEnum('pacing_mode_enum', ['fast_punchy', 'balanced', 'deep_dive']);
export const motionPatternEnum = pgEnum('motion_pattern_enum', [
  'title_hook', 'labeled_diagram', 'process_flow', 'comparison',
  'timeline', 'dynamic_chart', 'step_sequence', 'kinetic_summary'
]);
export const visualAssetTypeEnum = pgEnum('visual_asset_type_enum', ['lucide_icon', 'flux_image', 'code_snippet', 'none']);
export const sfxCueEnum = pgEnum('sfx_cue_enum', ['whoosh', 'pop', 'click', 'none']);
export const storyboardStatusEnum = pgEnum('storyboard_status_enum', ['draft', 'planning', 'review_ready', 'approved', 'superseded', 'failed']);
export const jobStatusEnum = pgEnum('job_status_enum', ['queued', 'running', 'cancel_requested', 'cancelled', 'succeeded', 'failed']);
export const videoStatusEnum = pgEnum('video_status_enum', ['building', 'validating', 'ready_for_review', 'approved', 'failed']);
export const publishStatusEnum = pgEnum('publish_status_enum', [
  'draft', 'scheduled', 'preparing_media', 'publishing', 'published', 
  'failed', 'needs_attention', 'outcome_unknown', 'cancelled'
]);
export const igConnectionStatusEnum = pgEnum('ig_connection_status_enum', ['connected', 'reauth_required', 'disconnected']);

// Users Table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }),
  fullName: varchar('full_name', { length: 100 }),
  preferredTimezone: varchar('preferred_timezone', { length: 50 }).default('UTC').notNull(),
  preferredVoicePreset: varchar('preferred_voice_preset', { length: 50 }).default('en-US-ChristopherNeural').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Workspaces Table
export const workspaces = pgTable('workspaces', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  isPersonal: boolean('is_personal').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Projects Table
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 150 }).notNull(),
  seedTopic: text('seed_topic').notNull(),
  sourceNotes: text('source_notes'),
  durationTarget: durationTargetEnum('duration_target').default('60').notNull(),
  pacingMode: pacingModeEnum('pacing_mode').default('balanced').notNull(),
  voicePreset: varchar('voice_preset', { length: 50 }).default('en-US-ChristopherNeural').notNull(),
  themeConfig: jsonb('theme_config').notNull(),
  activeStoryboardVersionId: uuid('active_storyboard_version_id'),
  latestVideoVersionId: uuid('latest_video_version_id'),
  isArchived: boolean('is_archived').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Storyboard Versions Table
export const storyboardVersions = pgTable('storyboard_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  parentVersionId: uuid('parent_version_id'),
  versionNumber: integer('version_number').notNull(),
  status: storyboardStatusEnum('status').default('draft').notNull(),
  title: varchar('title', { length: 150 }).notNull(),
  learningObjective: varchar('learning_objective', { length: 300 }).notNull(),
  hookType: varchar('hook_type', { length: 50 }).default('curiosity_gap').notNull(),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  revisionReason: text('revision_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Scenes Table
export const scenes = pgTable('scenes', {
  id: uuid('id').defaultRandom().primaryKey(),
  storyboardVersionId: uuid('storyboard_version_id').notNull().references(() => storyboardVersions.id, { onDelete: 'cascade' }),
  orderIndex: integer('order_index').notNull(),
  voiceoverText: text('voiceover_text').notNull(),
  pronunciationNotes: jsonb('pronunciation_notes').notNull(),
  motionPattern: motionPatternEnum('motion_pattern').notNull(),
  patternParams: jsonb('pattern_params').notNull(),
  highlightKeywords: text('highlight_keywords').array().notNull(),
  visualAssetType: visualAssetTypeEnum('visual_asset_type').default('none').notNull(),
  visualAssetValue: text('visual_asset_value'),
  sfxCue: sfxCueEnum('sfx_cue').default('whoosh').notNull(),
  estimatedDurationSeconds: numeric('estimated_duration_seconds', { precision: 4, scale: 2 }).notNull(),
  measuredDurationMs: integer('measured_duration_ms'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Audio Assets Table
export const audioAssets = pgTable('audio_assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  sceneId: uuid('scene_id').notNull().references(() => scenes.id, { onDelete: 'cascade' }),
  contentHash: varchar('content_hash', { length: 64 }).unique().notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  voiceId: varchar('voice_id', { length: 100 }).notNull(),
  storageUrl: text('storage_url').notNull(),
  durationMs: integer('duration_ms').notNull(),
  wordTimestamps: jsonb('word_timestamps').notNull(),
  fileSizeBytes: integer('file_size_bytes').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Generation Jobs Table
export const generationJobs = pgTable('generation_jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  storyboardVersionId: uuid('storyboard_version_id').notNull().references(() => storyboardVersions.id, { onDelete: 'cascade' }),
  status: jobStatusEnum('status').default('queued').notNull(),
  stage: varchar('stage', { length: 50 }).default('preparing_scenes').notNull(),
  progressPercentage: smallint('progress_percentage').default(0).notNull(),
  workerLeaseId: varchar('worker_lease_id', { length: 100 }),
  leaseExpiresAt: timestamp('lease_expires_at', { withTimezone: true }),
  attemptCount: smallint('attempt_count').default(0).notNull(),
  maxAttempts: smallint('max_attempts').default(3).notNull(),
  errorCategory: varchar('error_category', { length: 50 }),
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Video Versions Table
export const videoVersions = pgTable('video_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  storyboardVersionId: uuid('storyboard_version_id').notNull().references(() => storyboardVersions.id, { onDelete: 'cascade' }),
  generationJobId: uuid('generation_job_id').references(() => generationJobs.id, { onDelete: 'set null' }),
  status: videoStatusEnum('status').default('building').notNull(),
  storageUrl: text('storage_url'),
  thumbnailUrl: text('thumbnail_url'),
  durationFrames: integer('duration_frames').notNull(),
  fps: smallint('fps').default(30).notNull(),
  durationSeconds: numeric('duration_seconds', { precision: 5, scale: 2 }).notNull(),
  width: integer('width').default(1080).notNull(),
  height: integer('height').default(1920).notNull(),
  fileSizeBytes: bigint('file_size_bytes', { mode: 'number' }),
  renderDurationMs: integer('render_duration_ms'),
  validationResults: jsonb('validation_results').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Instagram Connections Table
export const instagramConnections = pgTable('instagram_connections', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id').unique().notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  igUserId: varchar('ig_user_id', { length: 100 }).notNull(),
  igUsername: varchar('ig_username', { length: 100 }).notNull(),
  accountType: varchar('account_type', { length: 50 }).default('CREATOR').notNull(),
  encryptedAccessToken: text('encrypted_access_token').notNull(),
  tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true }).notNull(),
  status: igConnectionStatusEnum('status').default('connected').notNull(),
  connectedAt: timestamp('connected_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Publish Intents Table
export const publishIntents = pgTable('publish_intents', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  videoVersionId: uuid('video_version_id').notNull().references(() => videoVersions.id, { onDelete: 'cascade' }),
  instagramConnectionId: uuid('instagram_connection_id').notNull().references(() => instagramConnections.id, { onDelete: 'cascade' }),
  status: publishStatusEnum('status').default('draft').notNull(),
  postCaption: text('post_caption').notNull(),
  hashtags: text('hashtags').array().notNull(),
  scheduledUtc: timestamp('scheduled_utc', { withTimezone: true }),
  originTimezone: varchar('origin_timezone', { length: 50 }).notNull(),
  metaContainerId: varchar('meta_container_id', { length: 100 }),
  metaMediaId: varchar('meta_media_id', { length: 100 }),
  permalink: text('permalink'),
  errorMessage: text('error_message'),
  retryCount: smallint('retry_count').default(0).notNull(),
  workerLeaseId: varchar('worker_lease_id', { length: 100 }),
  leaseExpiresAt: timestamp('lease_expires_at', { withTimezone: true }),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
```

---

## 5. Atomic State Transitions & Worker Lease Patterns

### 5.1. The Atomic Generation Job Claim
To ensure that multiple parallel serverless instances (or Inngest step retries) never render the same video simultaneously, workers execute an atomic claim with a 5-minute lease:

```sql
-- Worker queries and locks the next available generation job
UPDATE generation_jobs
SET 
    status = 'running',
    worker_lease_id = $1,                                    -- e.g. 'worker-pod-8a1f'
    lease_expires_at = NOW() + INTERVAL '5 minutes',
    started_at = COALESCE(started_at, NOW()),
    attempt_count = attempt_count + 1,
    updated_at = NOW()
WHERE id = (
    SELECT id
    FROM generation_jobs
    WHERE status = 'queued'
       OR (status = 'running' AND lease_expires_at < NOW()) -- Stale lease recovery
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
)
RETURNING *;
```

### 5.2. The Atomic Publish Intent Claim
Similarly, when a scheduled post becomes due, only one worker can claim the delivery window:

```sql
UPDATE publish_intents
SET 
    status = 'preparing_media',
    worker_lease_id = $1,
    lease_expires_at = NOW() + INTERVAL '3 minutes',
    updated_at = NOW()
WHERE id = (
    SELECT id
    FROM publish_intents
    WHERE status = 'scheduled'
      AND scheduled_utc <= NOW()
      AND (lease_expires_at IS NULL OR lease_expires_at < NOW())
    ORDER BY scheduled_utc ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
)
RETURNING *;
```

### 5.3. Handling the `outcome_unknown` Publishing State
If a call to `POST https://graph.facebook.com/v20.0/{ig_user_id}/media_publish` times out or drops the TCP socket:
1. The worker **never retries immediately**.
2. It executes:
   ```sql
   UPDATE publish_intents
   SET 
       status = 'outcome_unknown',
       worker_lease_id = NULL,
       lease_expires_at = NULL,
       error_message = 'Network timeout waiting for Meta publish confirmation. Reconciling before retry.',
       updated_at = NOW()
   WHERE id = $1;
   ```
3. A reconciliation task queries `GET /{meta_container_id}?fields=status_code`. If Meta confirms `status_code = FINISHED`, the record is marked `published`. If `EXPIRED` or `ERROR`, it is safely re-attempted.

---

## 6. Data Integrity & Retention Rules

1. **Cascade vs. Restrict Rules:**
   - Deleting a `workspace` cascades to all `projects`, `storyboard_versions`, and `generation_jobs`.
   - Deleting a `storyboard_version` is **restricted** if referenced by an active `publish_intent`.
2. **Media URL Expiry & Refresh:**
   - Media URLs stored in `audio_assets` and `video_versions` are canonical storage paths (e.g., `s3://autoreel-media/workspaces/{id}/...` or `r2://...`).
   - The application generates signed URLs with a **15-minute TTL** when sending to the client browser, and a **24-hour TTL** when handing off to Meta's container upload endpoint.
3. **Audit Trail Retention:**
   - `operation_events` records are partitioned by month and retained for 90 days during production for performance analysis and debugging.
