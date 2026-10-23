# TUTO — Backend API Contract & Integration Guide
> **For Teammate P2 (Backend) & P3 (AI)**  
> Prepared by **P1 (Frontend)** — All frontend components are fully wired to `src/lib/apiClient.ts`.  
> When you deploy the API routes listed below, the frontend seamlessly connects with **zero changes required**!

---

## 1. Environment Variables Needed (`.env.local`)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Voice & AI Gateways (Server-side only)
GRADIUM_API_KEY=your_gradium_api_key
JEV_API_KEY=your_jev_api_key
GEMINI_API_KEY=your_google_gemini_api_key

# Innovation Engine Threshold
MIN_CLUSTER=3 # Minimum doubts to form an aggregated cluster (group below this as "Other")
```

---

## 2. Supabase Tables (From Section 6 Shared Contract)

1. `users`: `(id, display_name, role 'student'|'faculty', college, points)`
2. `questions`: `(id, author_id, text, spoken_answer, steps jsonb, subject, concept, root_cause, visibility 'private'|'anonymous', resolution_status 'open'|'resolved'|'still_stuck', college, created_at)`
3. `answers`: `(id, question_id, author_id, text, is_ai, is_staff_verified, report_count, created_at)`
4. `votes`: `(id, user_id, target_type, target_id)` — *UNIQUE per user+target*
5. `projects`: `(id, owner_id, title, description, tags text[], roles_needed text[], link, created_at)`
6. `contributions`: `(id, project_id, user_id, message, status 'pending'|'accepted'|'declined')`
7. `points_log`: `(id, user_id, action, points, created_at)`
8. `curriculum_posts`: `(id, faculty_id, title, body, concept, created_at)`
9. `clarifications`: `(id, faculty_id, concept, title, body, spoken_text, created_at)`
10. `notifications`: `(id, user_id, clarification_id, status 'unread'|'helped'|'still_stuck', created_at)`

---

## 3. Required Endpoints & Response Shapes

### 🎙️ AI Voice & Gateways
- **`POST /api/transcribe`**
  - Input: `FormData` with audio blob
  - Output: `{ transcript: string }`
- **`POST /api/detect`**
  - Input: `{ text: string }`
  - Output: `{ isQuestion: boolean }` *(fail open on error)*
- **`POST /api/solve`**
  - Input: `{ question: string }`
  - Output:
    ```json
    {
      "spoken_answer": "Under 100 words plain speech explanation",
      "concept": "Eigenvalues & Diagonalization",
      "root_cause": "Matrix subtraction vs scalar subtraction",
      "subject": "Engineering Mathematics",
      "steps": [
        {
          "step_number": 1,
          "title": "Transformation Relation",
          "explanation": "Brief explanation",
          "latex": "A\\mathbf{v} = \\lambda\\mathbf{v}"
        }
      ]
    }
    ```
- **`POST /api/speak`**
  - Input: `{ text: string }`
  - Output: Audio stream / URL

---

### ❓ Questions & Anonymity
- **`POST /api/questions`**
  - Creates a question with `visibility: 'private'`. Returns full `Question`.
- **`PATCH /api/questions/:id/visibility`**
  - Input: `{ visibility: 'anonymous' }`
  - Action: Updates visibility, awards author +5 points. Returns `{ success: true, pointsAwarded: 5 }`.
- **`PATCH /api/questions/:id/resolution`**
  - Input: `{ resolution_status: 'open' | 'resolved' | 'still_stuck' }`
- **`GET /api/feed?subject=&college=`**
  - Returns array of public questions.
  - **CRITICAL PRIVACY RULE**: Strip `author_id` completely. Never return user identity.

---

### 💬 Community & Faculty Verification
- **`GET /api/answers?question_id=:id`**
- **`POST /api/answers`**
  - Input: `{ question_id: string, text: string }`
  - Awards author +10 points. Returns `Answer`.
- **`POST /api/answers/:id/verify`** *(Faculty only)*
  - Toggles `is_staff_verified`. Awards original answer author +25 points.
- **`POST /api/votes`**
  - Input: `{ target_type: 'question' | 'answer', target_id: string }`
  - Awards target author +2 points. No self-votes. Daily cap 100.
- **`POST /api/report`**
  - Increments `report_count`. Hide doubt if `report_count >= 3`.

---

### 🚀 Innovation: The Anonymity Bridge
- **`GET /api/pulse?minutes=15`**
  - Returns counts per concept in the last 15 min. No user data!
  - `[{ concept: string, count: number, subject: string, threshold: 5, is_alert: boolean, last_question_time: string }]`
- **`GET /api/clusters`**
  - Returns concept, root_cause, count, colleges[], silent_doubt_rate.
  - Concepts with `< MIN_CLUSTER` doubts grouped into "Other".
- **`POST /api/microlesson`** *(Faculty only)*
  - Input: `{ concept: string, root_cause: string }`
  - Output: `{ title: string, body: string, spoken_text: string }`
  - **PRIVACY RULE**: Generated strictly from concept + root_cause, NOT raw questions.
- **`POST /api/clarifications`** *(Faculty sends)*
  - Input: `{ concept: string, title: string, body: string, spoken_text: string }`
  - Server function: Generates notification for every student with a question on that concept.
  - Returns `{ delivered: number, clarification_id: string }`. **Never return user IDs.**
- **`GET /api/clarifications/:id/outcome`**
  - Returns counts only: `{ delivered: number, helped: number, still_stuck: number }`.
- **`GET /api/notifications`** (Student's private clarifications)
- **`PATCH /api/notifications/:id`**
  - Input: `{ status: 'helped' | 'still_stuck' }`

---

## 4. Points System Ledger Reference
- Ask and post: **+5**
- Answer: **+10**
- Upvote received: **+2**
- Staff Verified answer: **+25**
- Post project: **+15**
- Accepted contribution: **+20**
- Daily Cap: **100 points**
