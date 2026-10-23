# TUTO — Backend & Integration Documentation

> *"Just Tuto it. Ask out loud, without fear."*

Tuto is a voice-first academic learning platform for college students across India. Students ask academic doubts privately, receive step-by-step AI explanations, discover likely prerequisite gaps, and request alternative explanations when still stuck. They can publish doubts anonymously, answer peers, earn points, and collaborate on projects with students from other colleges.

Faculty receive aggregate concept-confusion statistics without access to student identities or private question text.

---

## 1. System Architecture

- **Framework:** Next.js 14+ (App Router, Server-side API Route Handlers, TypeScript)
- **Database & Auth:** Supabase PostgreSQL with strict Row Level Security (RLS)
- **AI Root-Cause Reasoning:** Google Gemini API (`gemini-1.5-flash` / `gemini-2.0-flash`)
- **Speech & Detection:** Gradium speech services with automatic browser Web Speech API fallback; Jev question detection with fail-open guarantee
- **Mathematical Rendering:** KaTeX-compatible LaTeX equations (`$...$`, `$$...$$`)
- **Gamification Engine:** Concurrency-safe points ledger with daily cap (100 pts/day) and dynamic badge computation

---

## 2. Getting Started

### Prerequisites
- Node.js v18+ (tested on Node.js v24.16.0)
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
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | Cloud Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (Server-only) | Required for privileged points & moderation |
| `GEMINI_API_KEY` | Google Gemini API Key | Server-side AI Tutor |
| `GRADIUM_API_KEY` | Gradium Speech API Key | Optional (falls back to Web Speech API) |
| `JEV_API_KEY` | Jev Question Detection API Key | Optional (fails open to true) |
| `MIN_CLUSTER` | Faculty Pulse cluster threshold | `3` |

*Note: In local or offline testing mode, an in-memory database store is active whenever Supabase keys are not configured, allowing tests and the demo UI to run out of the box.*

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
   - Copy the contents of `supabase/migrations/20261023000001_initial_schema.sql` and run it.
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
- `POST /api/solve`: Root-Cause AI reasoning.
  - Input: `{ "question": "string", "style"?: "simpler" | "analogy" | "worked_example" }`
  - Output: `{ "spoken_answer", "steps": [], "concept", "root_cause", "refresher", "subject", "disclaimer" }`
- `POST /api/detect`: Question detection. Returns `{ "isQuestion": true }`.
- `POST /api/transcribe`: Audio STT transcription with Gradium/browser fallback.
- `POST /api/speak`: TTS audio generation with Gradium/browser fallback.

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

### Verified Test Results (18/18 Passing)
```
> npx tsx scripts/test-runner.mjs && npx tsx scripts/test-api-routes.mjs

✔ 1. Moderation & Profanity Filtering
✔ 2. Voice Question Detection & Fail-Open Guarantee
✔ 3. Gamification Engine & Daily Cap (100 points/day)
✔ 4. Question Creation, Private Isolation, and History
✔ 5. Anonymous Visibility Transition & Reward Isolation
✔ 6. Prevention of Self-Voting
✔ 7. Faculty-Only Answer Verification
✔ 8. Cross-College Projects & Contribution Decision
✔ 9. Faculty Pulse Analytics & MIN_CLUSTER Threshold

✔ API: POST /api/solve input validations
✔ API: POST /api/detect question detection
✔ API: POST /api/speak text to speech response
✔ API: POST /api/questions authorization & creation
✔ API: GET /api/feed strips author identity
✔ API: Community Answers, Self-Vote Prevention, and Faculty Verification
✔ API: Cross-College Project Hub & Owner-Only Decisions
✔ API: Leaderboard & Badges Calculation
✔ API: Faculty Pulse Analytics & Role Protection

Tests: 18 passed, 0 failed
```

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
