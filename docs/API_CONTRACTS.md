# API Contracts & Interface Specification

# Project: AutoReel Studio
**Version:** 1.0.0  
**Status:** Approved Baseline  
**Base URL:** `/api/v1`  
**Communication Protocols:** HTTPS REST / Next.js Server Actions / Inngest Event Triggers  

---

## 1. Global Conventions & Standards

### 1.1. Headers
Every API request must include the following headers:
- `Content-Type: application/json`
- `Authorization: Bearer <session_token>` (handled automatically via Next.js session cookies for client-to-server calls)
- `X-Correlation-ID: <uuid>` (client or gateway generated UUIDv4 for distributed request tracing)

### 1.2. Standard Response Envelope
All endpoints return a uniform JSON envelope:

#### Successful Response (`200 OK`, `201 Created`, `202 Accepted`)
```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  meta: {
    requestId: string;
    correlationId: string;
    timestamp: string; // ISO 8601
  };
}
```

#### Error Response (`400`, `401`, `403`, `404`, `409`, `422`, `500`)
```typescript
interface ApiErrorResponse {
  success: false;
  error: {
    code: StandardErrorCode;
    message: string;
    details?: Record<string, any>;
  };
  meta: {
    requestId: string;
    correlationId: string;
    timestamp: string;
  };
}
```

### 1.3. Standard Error Codes
- `UNAUTHORIZED`: Session is missing, expired, or invalid.
- `FORBIDDEN`: User does not own the requested workspace or project.
- `VALIDATION_ERROR`: Request payload fails Zod schema validation (returns specific field errors in `details`).
- `RESOURCE_NOT_FOUND`: Target entity ID does not exist or has been deleted.
- `STATE_CONFLICT`: Action is invalid for the entity's current state (e.g. attempting to generate video from an unapproved storyboard).
- `RATE_LIMITED`: Upstream provider or internal rate limit exceeded.
- `WORKER_TIMEOUT`: Video render or audio synthesis worker exceeded execution budget.
- `META_API_ERROR`: Meta Graph API rejected the container creation or publishing request.
- `INTERNAL_SERVER_ERROR`: Unhandled exception caught by global boundary.

---

## 2. Workspace & Project Management Endpoints

### 2.1. List Projects
Retrieves paginated projects owned by the authenticated workspace.

- **Route:** `GET /api/v1/projects`
- **Query Parameters:**
  - `page` (optional integer, default `1`)
  - `limit` (optional integer, default `10`, max `50`)
  - `status` (optional string: `draft` | `ready` | `scheduled` | `published`)
  - `search` (optional string)

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "e7b1a23c-84d9-4b6e-a320-bfd91e604f81",
        "title": "Why Postgres Is Eating the Database World",
        "seedTopic": "Explain why PostgreSQL became the default database choice for startups.",
        "durationTarget": "60",
        "pacingMode": "balanced",
        "voicePreset": "en-US-ChristopherNeural",
        "thumbnailUrl": "https://storage.autoreel.studio/previews/thumb-e7b1a23c.jpg",
        "activeStoryboardVersion": 2,
        "latestVideoStatus": "ready_for_review",
        "publishStatus": "draft",
        "createdAt": "2026-10-30T10:00:00Z",
        "updatedAt": "2026-10-30T10:15:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalRecords": 1
    }
  },
  "meta": { "requestId": "req_01", "correlationId": "cor_01", "timestamp": "2026-10-30T10:15:01Z" }
}
```

---

### 2.2. Create Project
Initializes a new project workspace.

- **Route:** `POST /api/v1/projects`
- **Request Body:**
```json
{
  "title": "Understanding Vector Databases",
  "seedTopic": "How embeddings and vector similarity search enable modern RAG systems.",
  "sourceNotes": "Optional pasted documentation notes...",
  "durationTarget": "60",
  "pacingMode": "balanced",
  "voicePreset": "en-US-JennyNeural"
}
```

#### Response (`201 Created`)
```json
{
  "success": true,
  "data": {
    "id": "f8c2b34d-95e0-4c7f-b431-cfe02f715a92",
    "title": "Understanding Vector Databases",
    "status": "draft",
    "createdAt": "2026-10-30T10:20:00Z"
  },
  "meta": { "requestId": "req_02", "correlationId": "cor_02", "timestamp": "2026-10-30T10:20:01Z" }
}
```

---

## 3. AI Director & Storyboard Endpoints

### 3.1. Brainstorm Hooks & Angles
Invokes the AI Director to generate 3 high-retention viral hook variations from an initial idea.

- **Route:** `POST /api/v1/ai/brainstorm`
- **Request Body:**
```json
{
  "topic": "Explain Kubernetes pods to junior developers",
  "durationTarget": "60",
  "pacingMode": "balanced",
  "sourceNotes": "Pods are the smallest deployable units in K8s..."
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "topic": "Kubernetes Pods Explained",
    "learningObjective": "Understand why containers run inside pods rather than directly on nodes.",
    "hookOptions": [
      {
        "id": "hook_1",
        "type": "curiosity_gap",
        "headline": "Why Kubernetes Never Runs Containers Directly",
        "spokenHook": "If you think Kubernetes runs Docker containers, you've been lied to.",
        "retentionRationale": "Challenges common developer misconception within the first 2 seconds."
      },
      {
        "id": "hook_2",
        "type": "direct_problem",
        "headline": "The Pod Mystery Solved in 60 Seconds",
        "spokenHook": "Here is the exact reason Kubernetes wraps your containers inside Pods.",
        "retentionRationale": "Promises rapid, concise clarity for an intimidating concept."
      },
      {
        "id": "hook_3",
        "type": "contrarian_metaphor",
        "headline": "Containers are Peas. Pods are the Shell.",
        "spokenHook": "Think of a container as a single pea, and Kubernetes as a pod that holds them together.",
        "retentionRationale": "Instant visual metaphor that simplifies complex architectural abstractions."
      }
    ]
  },
  "meta": { "requestId": "req_03", "correlationId": "cor_03", "timestamp": "2026-10-30T10:25:00Z" }
}
```

---

### 3.2. Generate Structured Storyboard
Generates the complete card-by-card scene sequence mapped to the 8 parameterized motion patterns.

- **Route:** `POST /api/v1/projects/:projectId/storyboard/generate`
- **Request Body:**
```json
{
  "selectedHook": {
    "type": "curiosity_gap",
    "headline": "Why Kubernetes Never Runs Containers Directly",
    "spokenHook": "If you think Kubernetes runs Docker containers, you've been lied to."
  },
  "durationTarget": "60",
  "pacingMode": "balanced"
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "storyboardVersionId": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    "versionNumber": 1,
    "title": "Why Kubernetes Never Runs Containers Directly",
    "estimatedDurationSeconds": 58.5,
    "scenes": [
      {
        "id": "scene_01",
        "orderIndex": 0,
        "voiceoverText": "If you think Kubernetes runs Docker containers directly, you've been lied to.",
        "motionPattern": "title_hook",
        "patternParams": {
          "headline": "The Kubernetes Container Lie",
          "subheadline": "Why Pods Exist",
          "badgeText": "Cloud Architecture"
        },
        "highlightKeywords": ["lied to", "containers"],
        "visualAsset": { "type": "lucide_icon", "value": "Boxes" },
        "sfxCue": "whoosh",
        "estimatedDurationSeconds": 4.5
      },
      {
        "id": "scene_02",
        "orderIndex": 1,
        "voiceoverText": "Instead, Kubernetes only understands Pods. A Pod is a shared environment holding one or more containers.",
        "motionPattern": "labeled_diagram",
        "patternParams": {
          "centralNode": { "label": "K8s Pod", "icon": "Layers" },
          "satelliteNodes": [
            { "id": "n1", "label": "App Container", "icon": "Server", "connectionType": "arrow_in" },
            { "id": "n2", "label": "Sidecar Proxy", "icon": "Shield", "connectionType": "arrow_in" }
          ]
        },
        "highlightKeywords": ["Pods", "shared environment"],
        "visualAsset": { "type": "none", "value": "" },
        "sfxCue": "pop",
        "estimatedDurationSeconds": 6.0
      }
    ]
  },
  "meta": { "requestId": "req_04", "correlationId": "cor_04", "timestamp": "2026-10-30T10:26:00Z" }
}
```

---

### 3.3. Conversational Storyboard Revision
Applies a natural language edit to the draft storyboard and returns the new version with scene diffs.

- **Route:** `POST /api/v1/projects/:projectId/storyboard/revise`
- **Request Body:**
```json
{
  "baseVersionId": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "userPrompt": "Make scene 2 simpler and explain it using a Comparison frame instead of a diagram.",
  "targetSceneId": "scene_02" // optional
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "newVersionId": "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
    "versionNumber": 2,
    "changeSummary": "Converted scene 2 into a split Comparison frame: 'Single Container' vs 'Pod Environment'.",
    "affectedSceneIds": ["scene_02"],
    "scenes": [ /* Full updated scene array */ ]
  },
  "meta": { "requestId": "req_05", "correlationId": "cor_05", "timestamp": "2026-10-30T10:28:00Z" }
}
```

---

### 3.4. Approve Storyboard
Freezes the current storyboard version into an immutable state and unlocks video generation.

- **Route:** `POST /api/v1/projects/:projectId/storyboard/:versionId/approve`
- **Request Body:** `{}`

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "storyboardVersionId": "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
    "status": "approved",
    "approvedAt": "2026-10-30T10:30:00Z"
  },
  "meta": { "requestId": "req_06", "correlationId": "cor_06", "timestamp": "2026-10-30T10:30:01Z" }
}
```

---

## 4. Audio & Speech Alignment Endpoints

### 4.1. Curated Voices List
Fetches available speech presets with instant audio preview samples.

- **Route:** `GET /api/v1/audio/voices`

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "voices": [
      {
        "id": "en-US-ChristopherNeural",
        "name": "Christopher (Global Male)",
        "accent": "US / International",
        "gender": "male",
        "tone": "Authoritative & Confident",
        "previewAudioUrl": "https://storage.autoreel.studio/previews/voices/christopher.mp3"
      },
      {
        "id": "en-US-JennyNeural",
        "name": "Jenny (Global Female)",
        "accent": "US / International",
        "gender": "female",
        "tone": "Warm & Energetic",
        "previewAudioUrl": "https://storage.autoreel.studio/previews/voices/jenny.mp3"
      },
      {
        "id": "en-IN-PrabhatNeural",
        "name": "Prabhat (Indian Male)",
        "accent": "Indian English",
        "gender": "male",
        "tone": "Professional & Articulate",
        "previewAudioUrl": "https://storage.autoreel.studio/previews/voices/prabhat.mp3"
      },
      {
        "id": "en-IN-NeerjaNeural",
        "name": "Neerja (Indian Female)",
        "accent": "Indian English",
        "gender": "female",
        "tone": "Clear & Explanatory",
        "previewAudioUrl": "https://storage.autoreel.studio/previews/voices/neerja.mp3"
      }
    ]
  },
  "meta": { "requestId": "req_07", "correlationId": "cor_07", "timestamp": "2026-10-30T10:31:00Z" }
}
```

---

### 4.2. Synthesize Audio & Word Timestamps (Single / Batch)
Synthesizes speech and returns millisecond-exact word boundaries. Leverages SHA-256 caching.

- **Route:** `POST /api/v1/audio/synthesize`
- **Request Body:**
```json
{
  "sceneId": "scene_01",
  "text": "If you think Kubernetes runs Docker containers directly, you've been lied to.",
  "voiceId": "en-US-ChristopherNeural",
  "pronunciationNotes": {
    "K8s": "Kubernetes"
  }
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "audioUrl": "https://storage.autoreel.studio/workspaces/ws_01/audio/hash_9f8a2b.mp3",
    "durationMs": 4200,
    "wordTimestamps": [
      { "word": "If", "startMs": 0, "endMs": 180 },
      { "word": "you", "startMs": 190, "endMs": 320 },
      { "word": "think", "startMs": 330, "endMs": 600 },
      { "word": "Kubernetes", "startMs": 620, "endMs": 1250 },
      { "word": "runs", "startMs": 1270, "endMs": 1540 },
      { "word": "Docker", "startMs": 1560, "endMs": 1920 },
      { "word": "containers", "startMs": 1940, "endMs": 2500 },
      { "word": "directly,", "startMs": 2520, "endMs": 3100 },
      { "word": "you've", "startMs": 3250, "endMs": 3500 },
      { "word": "been", "startMs": 3510, "endMs": 3720 },
      { "word": "lied", "startMs": 3740, "endMs": 4020 },
      { "word": "to.", "startMs": 4040, "endMs": 4200 }
    ],
    "cacheHit": true
  },
  "meta": { "requestId": "req_08", "correlationId": "cor_08", "timestamp": "2026-10-30T10:32:00Z" }
}
```

---

## 5. Video Generation & Durable Jobs

### 5.1. Start Video Generation
Dispatches a durable Inngest background workflow to synthesize all speech, resolve visual assets, compute synchronization frames, and trigger Remotion composition.

- **Route:** `POST /api/v1/projects/:projectId/render`
- **Request Body:**
```json
{
  "storyboardVersionId": "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e"
}
```

#### Response (`202 Accepted`)
```json
{
  "success": true,
  "data": {
    "jobId": "job_c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
    "status": "queued",
    "stage": "preparing_scenes",
    "estimatedDurationSeconds": 45,
    "pollUrl": "/api/v1/video/jobs/job_c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f"
  },
  "meta": { "requestId": "req_09", "correlationId": "cor_09", "timestamp": "2026-10-30T10:35:00Z" }
}
```

---

### 5.2. Poll Job Progress
Provides live status updates for the generation progress bar.

- **Route:** `GET /api/v1/video/jobs/:jobId`

#### Response (`200 OK` - In Progress)
```json
{
  "success": true,
  "data": {
    "jobId": "job_c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
    "status": "running",
    "stage": "composing_motion_graphics",
    "progressPercentage": 68,
    "elapsedSeconds": 18,
    "error": null
  },
  "meta": { "requestId": "req_10", "correlationId": "cor_10", "timestamp": "2026-10-30T10:35:18Z" }
}
```

#### Response (`200 OK` - Completed)
```json
{
  "success": true,
  "data": {
    "jobId": "job_c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f",
    "status": "succeeded",
    "stage": "completed",
    "progressPercentage": 100,
    "videoVersion": {
      "id": "vid_d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a",
      "status": "ready_for_review",
      "videoUrl": "https://storage.autoreel.studio/workspaces/ws_01/videos/reel_final.mp4",
      "thumbnailUrl": "https://storage.autoreel.studio/workspaces/ws_01/videos/reel_thumb.jpg",
      "durationSeconds": 58.2,
      "fps": 30,
      "dimensions": { "width": 1080, "height": 1920 },
      "fileSizeBytes": 14250880
    }
  },
  "meta": { "requestId": "req_11", "correlationId": "cor_11", "timestamp": "2026-10-30T10:35:42Z" }
}
```

---

## 6. Instagram Reels Delivery & Scheduling

### 6.1. Generate Meta OAuth Login URL
Starts the official Instagram Login flow for Professional (Creator/Business) accounts.

- **Route:** `GET /api/v1/social/instagram/auth-url`

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "authUrl": "https://www.facebook.com/v20.0/dialog/oauth?client_id=123456789&redirect_uri=https%3A%2F%2Fapp.autoreel.studio%2Fapi%2Fv1%2Fsocial%2Finstagram%2Fcallback&scope=instagram_basic%2Cinstagram_content_publish&state=csrf_anti_forgery_token_8a2b",
    "state": "csrf_anti_forgery_token_8a2b"
  },
  "meta": { "requestId": "req_12", "correlationId": "cor_12", "timestamp": "2026-10-30T10:40:00Z" }
}
```

---

### 6.2. Publish Reel Immediately (Post Now)
Publishes an approved video to Instagram Reels with atomic deduplication.

- **Route:** `POST /api/v1/social/instagram/post-now`
- **Request Body:**
```json
{
  "videoVersionId": "vid_d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a",
  "postCaption": "Why Kubernetes never runs Docker containers directly 🚢💡 #kubernetes #devops #cloud #softwareengineering",
  "hashtags": ["kubernetes", "devops", "cloud", "softwareengineering"]
}
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "publishIntentId": "pub_e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b",
    "status": "published",
    "metaMediaId": "18042918239012345",
    "permalink": "https://www.instagram.com/reel/DBabc123xyz/",
    "publishedAt": "2026-10-30T10:42:15Z"
  },
  "meta": { "requestId": "req_13", "correlationId": "cor_13", "timestamp": "2026-10-30T10:42:16Z" }
}
```

---

### 6.3. Schedule Reel Publication
Schedules an approved video for automated release at a future date and time.

- **Route:** `POST /api/v1/social/instagram/schedule`
- **Request Body:**
```json
{
  "videoVersionId": "vid_d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a",
  "postCaption": "Why Kubernetes never runs Docker containers directly 🚢💡",
  "hashtags": ["kubernetes", "devops", "cloud"],
  "scheduledDate": "2026-11-01",
  "scheduledTime": "18:30",
  "originTimezone": "Asia/Kolkata" // Explicit user timezone
}
```

#### Response (`201 Created`)
```json
{
  "success": true,
  "data": {
    "publishIntentId": "pub_f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c",
    "status": "scheduled",
    "scheduledUtc": "2026-11-01T13:00:00Z", // Computed UTC timestamp
    "localTimeDisplay": "November 1, 2026 at 6:30 PM (Asia/Kolkata)",
    "minimumLeadTimeMet": true
  },
  "meta": { "requestId": "req_14", "correlationId": "cor_14", "timestamp": "2026-10-30T10:45:00Z" }
}
```

---

### 6.4. Cancel Scheduled Publication
Atomically cancels a pending scheduled post before delivery claims it.

- **Route:** `DELETE /api/v1/social/instagram/schedule/:publishIntentId`

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "publishIntentId": "pub_f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c",
    "status": "cancelled",
    "cancelledAt": "2026-10-30T10:46:00Z"
  },
  "meta": { "requestId": "req_15", "correlationId": "cor_15", "timestamp": "2026-10-30T10:46:01Z" }
}
```
