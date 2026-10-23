# TUTO — Backend & Integration Documentation

> *"Just Tuto it. Ask out loud, without fear."*

Tuto is a voice-first academic learning platform for college students across India. Students ask academic doubts privately, receive step-by-step AI explanations, discover likely prerequisite gaps, and request alternative explanations when still stuck. They can publish doubts anonymously, answer peers, earn points, and collaborate on projects with students from other colleges.

Faculty receive aggregate concept-confusion statistics without access to student identities or private question text.

---

## 1. System Architecture

- **Framework:** Next.js 14+ (App Router, Server-side API Route Handlers, TypeScript)
- **Database & Auth:** Supabase PostgreSQL with strict Row Level Security (RLS)
- **AI Root-Cause Reasoning:** Google Gemini Developer API using the supported `@google/genai` SDK and `gemini-2.5-flash` by default
- **Speech & Detection:** Browser Web Speech recognition and synthesis where available; local academic-request intent heuristic
- **Mathematical Rendering:** KaTeX-compatible LaTeX equations (`$...$`, `$$...$$`)
- **Gamification Engine:** Concurrency-safe points ledger with daily cap (100 pts/day) and dynamic badge computation

---

## 2. Getting Started

### Prerequisites
- Node.js v20+ (required by the Google Gen AI SDK; tested on Node.js v24.16.0)
- npm v10+

### Installation
```bash
# Clone the repository
git clone https://github.com/maseeramuzna28/tutor.git
cd tutor

# Install dependencies
npm install
```

### Environment Configuration
Copy `.env.example` to `.env.local` and configure your credentials:
```bash
cp .env.example .env.local
```

Required & optional environment variables:
| Variable | Description | Default / Required |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | Cloud Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon or publishable key | Supabase project API keys |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (Server-only) | Required for privileged points & moderation |
| `GEMINI_API_KEY` | Google Gemini API Key | Server-side AI Tutor |
| `GEMINI_MODEL` | Gemini model identifier | `gemini-2.5-flash` |
| `MIN_CLUSTER` | Faculty Pulse cluster threshold | `3` |

*Note: The seeded in-memory database is only used in non-production development/test mode when no Supabase URL or service-role key is configured. Partial Supabase configuration fails explicitly instead of silently falling back. Browser speech APIs vary by browser and may use browser-provided online services; manual text input remains available.*

Gemini API free-tier access, quotas, data-use terms, and model availability depend on your account and Google's current policies. Check the [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) and [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits); do not assume unlimited free production use.

---

## 3. Database Schema & Migrations

The complete, version-controlled PostgreSQL migration is located at:
`supabase/migrations/20261023000001_initial_schema.sql`

### Tables
1. **`users`**: User profiles linked to Supabase Auth (`id`, `display_name`, `role`, `college`, `points`, `created_at`).
2. **`questions`**: Academic doubts (`id`, `author_id`, `text`, `spoken_answer`, `steps JSONB`, `refresher`, `subject`, `concept`, `root_cause`, `visibility`, `resolution_status`, `college`, `report_count`, `is_hidden`).
3. **`answers`**: Peer & AI responses (`id`, `question_id`, `author_id`, `text`, `is_ai`, `is_staff_verified`, `report_count`, `is_hidden`).
4. **`votes`**: Unique upvotes with self-vote protection (`id`, `user_id`, `target_type`, `target_id`).
5. **`projects`**: Cross-college project listings (`id`, `owner_id`, `title`, `description`, `tags TEXT[]`, `roles_needed TEXT[]`, `link`).
6. **`contributions`**: Project collaboration requests (`id`, `project_id`, `user_id`, `message`, `status`).
7. **`points_log`**: Transactional points audit log (`id`, `user_id`, `action`, `points`, `created_at`).
8. **`curriculum_posts`**: Faculty announcements & guidance (`id`, `faculty_id`, `title`, `body`).
9. **`reports`**: Community moderation records (`id`, `user_id`, `target_type`, `target_id`, `reason`).

### How to Apply Migrations to Supabase
1. **Via Supabase Dashboard**:
   - Open your project on [Supabase Dashboard](https://supabase.com/dashboard).
   - Navigate to the **SQL Editor**.
   - For a new project, apply `supabase/migrations/20261023000001_initial_schema.sql`, then `supabase/migrations/20261023000002_ai_rate_limits.sql`.
   - For an existing project that already has the initial schema, apply only the additive `20261023000002_ai_rate_limits.sql` migration.
2. **Via Supabase CLI**:
   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

---

## 4. API Endpoints & Contracts

All endpoints return JSON. Errors follow the strict format:
```json
{ "error": "Clear explanation" }
```

### AI Tutor & Speech
- `POST /api/solve`: One Gemini request classifies intent and creates a response, using recent conversation context when provided.
  - Input: `{ "question": "string", "style"?: "simpler" | "analogy" | "worked_example", "conversation"?: [{ "role": "user" | "assistant", "content": "string" }] }`
  - Output always includes `{ "intent", "topic", "response" }`. Academic intents (`question`, `learning_request`, `clarification`) additionally include `spoken_answer`, `steps`, `concept`, `root_cause`, `refresher`, `subject`, and `disclaimer`.
- `POST /api/detect`: Retired with HTTP 410; intent classification is part of `/api/solve` so each message uses a single Gemini request.
- `POST /api/transcribe` and `POST /api/speak`: Retired with HTTP 410; the UI uses browser speech APIs directly where available.
- `POST /api/solve` is limited to 10 requests per client address per minute. The database-backed limiter requires the additive `supabase/migrations/20261023000002_ai_rate_limits.sql` migration. Gemini provider rate limits/quotas may additionally apply.

### Doubt Management & Feed
- `POST /api/questions`: Submit private doubt (+5 pts). Returns `{ "id": "uuid" }`.
- `GET /api/questions/mine`: Fetch authenticated user's question history.
- `PATCH /api/questions/:id/visibility`: Transition private doubt to anonymous on campus feed (+5 pts once).
- `PATCH /api/questions/:id/resolution`: Update status to `open`, `resolved`, or `still_stuck`.
- `GET /api/feed?subject=&college=`: Public anonymous campus feed. **Zero author identity or PII exposure.** Hides items with $\ge 3$ reports.

### Community & Moderation
- `POST /api/answers`: Submit peer answer (+10 pts).
- `POST /api/answers/:id/verify`: Faculty-only verification (+25 pts to answer author).
- `POST /api/votes`: Upvote with self-voting prevention and unique constraint (+2 pts to author).
- `POST /api/report`: Moderation with profanity filter; auto-hides at 3 reports.

### Cross-College Hub
- `GET /api/projects`: Browse cross-college projects with tag and college filtering.
- `POST /api/projects`: Create project listing (+15 pts).
- `POST /api/projects/:id/request`: Submit join request to project owner.
- `POST /api/contributions/:id/decide`: Project owner accepts or declines (+20 pts to accepted contributor).

### Gamification & Analytics
- `GET /api/me/points`: Points balance, points earned today, daily cap (100), and computed badges (*First Doubt*, *Helper*, *Builder*).
- `GET /api/leaderboard?scope=college|national`: Top 20 ranked students.
- `GET /api/pulse?days=7`: Faculty Pulse aggregate confusion signals. Minimum cluster threshold enforced (`MIN_CLUSTER`), zero student PII.

---

## 5. Gamification Rewards Table

| Action | Points | Rules |
| :--- | :--- | :--- |
| Ask private doubt | **+5** | Maximum 100 points/day total cap |
| Publish anonymously | **+5** | Awarded once per question |
| Answer peer doubt | **+10** | Must not contain profanity |
| Receive upvote | **+2** | Self-votes blocked; unique per user |
| Faculty verification | **+25** | Faculty role only; awarded to author |
| Post project | **+15** | Cross-college collaboration |
| Accepted contribution | **+20** | Awarded to contributor on acceptance |

---

## 6. Testing & Verification

Run the automated test suite covering unit logic, security rules, and all Next.js API routes:
```bash
npm test
```

The suite exercises API validation, local browser speech feature detection, Gemini response-shape/intent validation, missing-key handling, rate limits, and existing backend/API behavior. These tests do not call Gemini or a live Supabase project.

---

## 7. Running the Application

```bash
# Start Next.js development server
npm run dev

# Or build and run production server
npm run build
npm start
```

Visit `http://localhost:3000` to interact with the full 15-step demo journey.
