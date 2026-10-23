-- ==============================================================
-- TUTO FULL PRODUCTION DATABASE SCHEMA
-- PostgreSQL / Supabase Migration & Seed Script
-- ==============================================================

-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'faculty')) DEFAULT 'student',
    college TEXT NOT NULL DEFAULT 'Demo College of Engineering',
    department TEXT DEFAULT 'Computer Science',
    year TEXT DEFAULT '2nd year',
    bio TEXT DEFAULT '',
    points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
    streak INTEGER NOT NULL DEFAULT 1 CHECK (streak >= 0),
    anonymous_by_default BOOLEAN NOT NULL DEFAULT FALSE,
    notify_email BOOLEAN NOT NULL DEFAULT TRUE,
    notify_pulse BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_points ON public.users(points DESC);
CREATE INDEX IF NOT EXISTS idx_users_college ON public.users(college);

-- 2. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sections TEXT[] NOT NULL DEFAULT '{"A"}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. QUESTIONS (DOUBTS) TABLE
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    text TEXT NOT NULL,
    spoken_answer TEXT,
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    refresher TEXT,
    subject TEXT DEFAULT 'Computer Science',
    concept TEXT DEFAULT 'General',
    root_cause TEXT DEFAULT 'Foundational gap',
    visibility TEXT NOT NULL CHECK (visibility IN ('private', 'anonymous')) DEFAULT 'private',
    resolution_status TEXT NOT NULL CHECK (resolution_status IN ('open', 'resolved', 'still_stuck')) DEFAULT 'open',
    college TEXT NOT NULL DEFAULT 'Demo College of Engineering',
    report_count INTEGER NOT NULL DEFAULT 0 CHECK (report_count >= 0),
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_author ON public.questions(author_id);
CREATE INDEX IF NOT EXISTS idx_questions_feed ON public.questions(visibility, is_hidden, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_concept ON public.questions(concept);

-- 4. ANSWERS TABLE
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    text TEXT NOT NULL,
    is_ai BOOLEAN NOT NULL DEFAULT FALSE,
    is_staff_verified BOOLEAN NOT NULL DEFAULT FALSE,
    report_count INTEGER NOT NULL DEFAULT 0 CHECK (report_count >= 0),
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_answers_question ON public.answers(question_id);

-- 5. VOTES TABLE
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('question', 'answer')),
    target_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_vote_user_target UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_target ON public.votes(target_type, target_id);

-- 6. COMMUNITY POSTS & REPLIES
CREATE TABLE IF NOT EXISTS public.community_posts (
    id TEXT PRIMARY KEY,
    author TEXT NOT NULL,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    tag TEXT NOT NULL DEFAULT 'Question',
    body TEXT NOT NULL,
    upvotes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.community_replies (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    author TEXT NOT NULL,
    author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PROJECTS & CONTRIBUTIONS
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    description TEXT,
    skills TEXT[] NOT NULL DEFAULT '{}',
    tags TEXT[] NOT NULL DEFAULT '{}',
    team_size INTEGER NOT NULL DEFAULT 3,
    members INTEGER NOT NULL DEFAULT 1,
    link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_contribution_project_user UNIQUE (project_id, user_id)
);

-- 8. CONFUSION TOPICS
CREATE TABLE IF NOT EXISTS public.confusion_topics (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    heat INTEGER NOT NULL DEFAULT 20 CHECK (heat BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. LESSONS
CREATE TABLE IF NOT EXISTS public.lessons (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    concept TEXT NOT NULL,
    minutes INTEGER NOT NULL DEFAULT 5,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. BADGES
CREATE TABLE IF NOT EXISTS public.badges (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    text TEXT NOT NULL,
    earned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. CURRICULUM UPDATES
CREATE TABLE IF NOT EXISTS public.curriculum_updates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    course TEXT NOT NULL,
    section TEXT NOT NULL DEFAULT 'A',
    effective DATE NOT NULL,
    body TEXT NOT NULL,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    audience TEXT NOT NULL CHECK (audience IN ('student', 'faculty')),
    type TEXT NOT NULL,
    text TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. OUTCOMES
CREATE TABLE IF NOT EXISTS public.outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    text TEXT NOT NULL,
    target INTEGER NOT NULL DEFAULT 60,
    attainment INTEGER NOT NULL DEFAULT 50
);

-- 14. SECTIONS
CREATE TABLE IF NOT EXISTS public.sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course TEXT NOT NULL,
    section TEXT NOT NULL,
    enrolled INTEGER NOT NULL DEFAULT 50,
    open_doubts INTEGER NOT NULL DEFAULT 0,
    flagged INTEGER NOT NULL DEFAULT 0
);

-- 15. POINTS LOG & RATE LIMITS
CREATE TABLE IF NOT EXISTS public.points_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    points INTEGER NOT NULL CHECK (points >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_rate_limits (
    key TEXT PRIMARY KEY,
    window_started_at TIMESTAMPTZ NOT NULL,
    request_count INTEGER NOT NULL CHECK (request_count >= 0)
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confusion_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- Allow read access for application data
CREATE POLICY "Public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public read courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Public read questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Public read answers" ON public.answers FOR SELECT USING (true);
CREATE POLICY "Public read votes" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Public read posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Public read replies" ON public.community_replies FOR SELECT USING (true);
CREATE POLICY "Public read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public read contributions" ON public.contributions FOR SELECT USING (true);
CREATE POLICY "Public read topics" ON public.confusion_topics FOR SELECT USING (true);
CREATE POLICY "Public read lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Public read badges" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Public read curriculum" ON public.curriculum_updates FOR SELECT USING (true);
CREATE POLICY "Public read notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Public read outcomes" ON public.outcomes FOR SELECT USING (true);
CREATE POLICY "Public read sections" ON public.sections FOR SELECT USING (true);

-- Allow write for authenticated / service role
CREATE POLICY "Allow write users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow write questions" ON public.questions FOR ALL USING (true);
CREATE POLICY "Allow write answers" ON public.answers FOR ALL USING (true);
CREATE POLICY "Allow write votes" ON public.votes FOR ALL USING (true);
CREATE POLICY "Allow write posts" ON public.community_posts FOR ALL USING (true);
CREATE POLICY "Allow write replies" ON public.community_replies FOR ALL USING (true);
CREATE POLICY "Allow write projects" ON public.projects FOR ALL USING (true);
CREATE POLICY "Allow write contributions" ON public.contributions FOR ALL USING (true);
CREATE POLICY "Allow write topics" ON public.confusion_topics FOR ALL USING (true);
CREATE POLICY "Allow write lessons" ON public.lessons FOR ALL USING (true);
CREATE POLICY "Allow write badges" ON public.badges FOR ALL USING (true);
CREATE POLICY "Allow write curriculum" ON public.curriculum_updates FOR ALL USING (true);
CREATE POLICY "Allow write notifications" ON public.notifications FOR ALL USING (true);

-- ==========================================================
-- STORED PROCEDURES & REWARDS LEDGER
-- ==========================================================
CREATE OR REPLACE FUNCTION public.award_user_points(
    p_user_id UUID,
    p_action TEXT,
    p_points INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_today_start TIMESTAMPTZ := date_trunc('day', NOW());
    v_points_today INTEGER := 0;
    v_allowable_points INTEGER := 0;
    v_new_total INTEGER := 0;
    v_already_awarded BOOLEAN := FALSE;
BEGIN
    SELECT points INTO v_new_total FROM public.users WHERE id = p_user_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('awarded', 0, 'error', 'User not found');
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.points_log WHERE user_id = p_user_id AND action = p_action
    ) INTO v_already_awarded;

    IF v_already_awarded THEN
        SELECT points INTO v_new_total FROM public.users WHERE id = p_user_id;
        RETURN jsonb_build_object('awarded', 0, 'duplicate', true, 'total_points', v_new_total);
    END IF;

    SELECT COALESCE(SUM(points), 0) INTO v_points_today
    FROM public.points_log WHERE user_id = p_user_id AND created_at >= v_today_start;

    IF v_points_today >= 100 THEN
        v_allowable_points := 0;
    ELSE
        v_allowable_points := LEAST(p_points, 100 - v_points_today);
    END IF;

    IF v_allowable_points > 0 THEN
        INSERT INTO public.points_log (user_id, action, points) VALUES (p_user_id, p_action, v_allowable_points);
        UPDATE public.users SET points = points + v_allowable_points WHERE id = p_user_id RETURNING points INTO v_new_total;
    ELSE
        SELECT points INTO v_new_total FROM public.users WHERE id = p_user_id;
    END IF;

    RETURN jsonb_build_object(
        'awarded', v_allowable_points,
        'requested', p_points,
        'points_today', v_points_today + v_allowable_points,
        'daily_cap', 100,
        'total_points', v_new_total,
        'duplicate', false
    );
END;
$$;

-- Rate limiter function
CREATE OR REPLACE FUNCTION public.consume_ai_rate_limit(
    p_key TEXT,
    p_window_seconds INTEGER,
    p_max_requests INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
    v_window_started_at TIMESTAMPTZ;
BEGIN
    INSERT INTO public.ai_rate_limits (key, window_started_at, request_count)
    VALUES (p_key, NOW(), 1)
    ON CONFLICT (key) DO UPDATE
    SET window_started_at = CASE
            WHEN public.ai_rate_limits.window_started_at <= NOW() - make_interval(secs => p_window_seconds)
            THEN NOW() ELSE public.ai_rate_limits.window_started_at END,
        request_count = CASE
            WHEN public.ai_rate_limits.window_started_at <= NOW() - make_interval(secs => p_window_seconds)
            THEN 1 ELSE public.ai_rate_limits.request_count + 1 END
    RETURNING request_count, window_started_at INTO v_count, v_window_started_at;

    RETURN jsonb_build_object(
        'allowed', v_count <= p_max_requests,
        'remaining', GREATEST(0, p_max_requests - v_count),
        'reset_at', v_window_started_at + make_interval(secs => p_window_seconds)
    );
END;
$$;

-- ==========================================================
-- SEED DATA
-- ==========================================================
INSERT INTO public.users (id, display_name, role, college, department, points, streak)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Demo Student', 'student', 'Demo College of Engineering', 'Computer Science', 240, 4),
    ('00000000-0000-0000-0000-000000000002', 'Riya Patel', 'student', 'COEP Tech University, Pune', 'Computer Science', 40, 2),
    ('00000000-0000-0000-0000-000000000003', 'Dr. Anand Rao', 'faculty', 'IIT Bombay', 'Computer Science', 100, 10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.courses (id, name, sections)
VALUES
    ('cs201', 'Data Structures', '{"A", "B"}'),
    ('cs204', 'Database Systems', '{"A"}'),
    ('cs210', 'Operating Systems', '{"A", "B"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.confusion_topics (id, course_id, name, heat)
VALUES
    ('t1', 'cs201', 'Recursion', 62),
    ('t2', 'cs201', 'Linked lists', 28),
    ('t3', 'cs201', 'Binary trees', 36),
    ('t4', 'cs201', 'Hashing', 18),
    ('t5', 'cs201', 'Big O', 30),
    ('t6', 'cs201', 'Graph traversal', 48),
    ('t7', 'cs204', 'Normalization', 44),
    ('t8', 'cs204', 'SQL joins', 24),
    ('t9', 'cs204', 'Transactions', 52),
    ('t10', 'cs204', 'Indexing', 38),
    ('t11', 'cs204', 'ER diagrams', 20),
    ('t12', 'cs204', 'Query planning', 58),
    ('t13', 'cs210', 'Deadlocks', 52),
    ('t14', 'cs210', 'Paging', 40),
    ('t15', 'cs210', 'Scheduling', 34),
    ('t16', 'cs210', 'Semaphores', 66),
    ('t17', 'cs210', 'Virtual memory', 46),
    ('t18', 'cs210', 'File systems', 22)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.badges (id, name, text, earned)
VALUES
    ('b1', 'First question', 'Asked your first question.', true),
    ('b2', 'Three day streak', 'Studied three days in a row.', true),
    ('b3', 'Lesson finisher', 'Completed a micro lesson.', false),
    ('b4', 'Helper', 'Replied to five community posts.', false),
    ('b5', 'Project starter', 'Posted a college project.', false),
    ('b6', 'Pulse sender', 'Sent a Live Confusion Pulse.', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.lessons (id, title, concept, minutes, completed, steps)
VALUES
    ('l1', 'Recursion in four steps', 'Recursion', 6, false, '[
        {"title": "Find the base case", "body": "Every recursive function needs a case it can answer without calling itself."},
        {"title": "Shrink the problem", "body": "Each call must move toward the base case, e.g. passing n - 1."},
        {"title": "Trust the call", "body": "Assume the recursive call returns the correct smaller answer."},
        {"title": "Trace a small input", "body": "Walk factorial of 3 by hand: 3 * 2 * 1 * 1 = 6."}
    ]'::jsonb),
    ('l2', 'Pointers without panic', 'Pointers', 7, false, '[
        {"title": "A pointer stores an address", "body": "A variable holds a value. A pointer holds where that value lives."},
        {"title": "Dereference to reach value", "body": "The star operator reads or writes the value at that address."},
        {"title": "Pass an address to change original", "body": "Passing a pointer lets a function modify the callers variable."},
        {"title": "Avoid dangling pointers", "body": "Check for null before dereferencing and do not use freed memory."}
    ]'::jsonb)
ON CONFLICT (id) DO NOTHING;
