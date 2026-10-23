-- TUTO SCHEMA & ROW LEVEL SECURITY MIGRATION
-- Migration: 20261023000001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'faculty')) DEFAULT 'student',
    college TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for leaderboard and college filters
CREATE INDEX IF NOT EXISTS idx_users_points ON public.users(points DESC);
CREATE INDEX IF NOT EXISTS idx_users_college ON public.users(college);

-- 2. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    spoken_answer TEXT,
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    refresher TEXT,
    subject TEXT,
    concept TEXT,
    root_cause TEXT,
    visibility TEXT NOT NULL CHECK (visibility IN ('private', 'anonymous')) DEFAULT 'private',
    resolution_status TEXT NOT NULL CHECK (resolution_status IN ('open', 'resolved', 'still_stuck')) DEFAULT 'open',
    college TEXT NOT NULL,
    report_count INTEGER NOT NULL DEFAULT 0 CHECK (report_count >= 0),
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_author ON public.questions(author_id);
CREATE INDEX IF NOT EXISTS idx_questions_feed ON public.questions(visibility, is_hidden, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_concept ON public.questions(concept);
CREATE INDEX IF NOT EXISTS idx_questions_college ON public.questions(college);

-- 3. ANSWERS TABLE
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_ai BOOLEAN NOT NULL DEFAULT FALSE,
    is_staff_verified BOOLEAN NOT NULL DEFAULT FALSE,
    report_count INTEGER NOT NULL DEFAULT 0 CHECK (report_count >= 0),
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_answers_question ON public.answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_author ON public.answers(author_id);

-- 4. VOTES TABLE
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('question', 'answer')),
    target_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_vote_user_target UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_target ON public.votes(target_type, target_id);

-- 5. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    roles_needed TEXT[] NOT NULL DEFAULT '{}',
    link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_owner ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- 6. CONTRIBUTIONS TABLE
CREATE TABLE IF NOT EXISTS public.contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_contribution_project_user UNIQUE (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_contributions_project ON public.contributions(project_id);
CREATE INDEX IF NOT EXISTS idx_contributions_user ON public.contributions(user_id);

-- 7. POINTS_LOG TABLE
CREATE TABLE IF NOT EXISTS public.points_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    points INTEGER NOT NULL CHECK (points >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_points_log_user_date ON public.points_log(user_id, created_at);

-- 8. CURRICULUM_POSTS TABLE
CREATE TABLE IF NOT EXISTS public.curriculum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_curriculum_posts_faculty ON public.curriculum_posts(faculty_id);

-- 9. REPORTS TABLE (Tracking user reports and hiding at threshold = 3)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('question', 'answer')),
    target_id UUID NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_report_user_target UNIQUE (user_id, target_type, target_id)
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
-- Anyone authenticated can view public profiles
CREATE POLICY "Users can read profiles"
    ON public.users FOR SELECT
    TO authenticated
    USING (true);

-- Users can only insert their own record upon registration
CREATE POLICY "Users can insert their own profile"
    ON public.users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Users can only update their own display_name/college; cannot self-promote to faculty, cannot alter points directly
CREATE POLICY "Users can update non-sensitive profile info"
    ON public.users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        AND role = (SELECT u.role FROM public.users u WHERE u.id = auth.uid())
        AND points = (SELECT u.points FROM public.users u WHERE u.id = auth.uid())
    );

-- QUESTIONS POLICIES
-- Select: author can view their questions; others can view non-hidden anonymous questions
CREATE POLICY "Authors can view all their own questions"
    ON public.questions FOR SELECT
    TO authenticated
    USING (
        auth.uid() = author_id
        OR (visibility = 'anonymous' AND is_hidden = false)
    );

-- Insert: authenticated user as author
CREATE POLICY "Users can insert their own question"
    ON public.questions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

-- Update: only author can update (e.g. resolution_status, visibility)
CREATE POLICY "Authors can update their own questions"
    ON public.questions FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

-- ANSWERS POLICIES
-- Select: answers to visible questions that are not hidden
CREATE POLICY "Users can view answers of visible questions"
    ON public.answers FOR SELECT
    TO authenticated
    USING (
        is_hidden = false
        OR auth.uid() = author_id
    );

-- Insert: authenticated user can post answer
CREATE POLICY "Users can insert answers"
    ON public.answers FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

-- Update: author can edit text; faculty can verify
CREATE POLICY "Users can update own answer or faculty verify"
    ON public.answers FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = author_id
        OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'faculty')
    );

-- VOTES POLICIES
-- Select: user can see votes
CREATE POLICY "Users can view votes"
    ON public.votes FOR SELECT
    TO authenticated
    USING (true);

-- Insert: user must match auth.uid()
CREATE POLICY "Users can insert their own vote"
    ON public.votes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Delete: user can revoke own vote
CREATE POLICY "Users can remove their own vote"
    ON public.votes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- PROJECTS POLICIES
-- Select: all authenticated users can view projects
CREATE POLICY "Users can view projects"
    ON public.projects FOR SELECT
    TO authenticated
    USING (true);

-- Insert: authenticated user is owner
CREATE POLICY "Users can create projects"
    ON public.projects FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

-- Update: only owner can edit
CREATE POLICY "Project owners can update projects"
    ON public.projects FOR UPDATE
    TO authenticated
    USING (auth.uid() = owner_id);

-- CONTRIBUTIONS POLICIES
-- Select: project owner or applicant can view
CREATE POLICY "Owners and applicants can view contributions"
    ON public.contributions FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id
        OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
    );

-- Insert: applicant can submit request
CREATE POLICY "Users can submit contribution requests"
    ON public.contributions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Update: only project owner can accept/decline
CREATE POLICY "Project owners can decide contributions"
    ON public.contributions FOR UPDATE
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
    );

-- POINTS LOG POLICIES
-- Select: user can view their own points history
CREATE POLICY "Users can view their own points log"
    ON public.points_log FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Insert: only service role can insert directly into points_log
-- (Normal users cannot write to points_log directly)

-- CURRICULUM POSTS POLICIES
-- Select: all authenticated users can read curriculum posts
CREATE POLICY "Users can view curriculum posts"
    ON public.curriculum_posts FOR SELECT
    TO authenticated
    USING (true);

-- Insert/Update: only faculty can create/update
CREATE POLICY "Only faculty can manage curriculum posts"
    ON public.curriculum_posts FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'faculty')
    );

-- REPORTS POLICIES
CREATE POLICY "Users can view own reports"
    ON public.reports FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can submit reports"
    ON public.reports FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- ==========================================================
-- STORED FUNCTIONS, CONSTRAINTS & SECURITY TRIGGERS
-- ==========================================================

-- Trigger to prevent self-voting at the database level
CREATE OR REPLACE FUNCTION public.check_self_vote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_author_id UUID;
BEGIN
    IF NEW.target_type = 'question' THEN
        SELECT author_id INTO v_author_id FROM public.questions WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'answer' THEN
        SELECT author_id INTO v_author_id FROM public.answers WHERE id = NEW.target_id;
    END IF;

    IF v_author_id IS NOT NULL AND v_author_id = NEW.user_id THEN
        RAISE EXCEPTION 'Self-voting is strictly prohibited.';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_self_vote ON public.votes;
CREATE TRIGGER trg_check_self_vote
    BEFORE INSERT ON public.votes
    FOR EACH ROW EXECUTE FUNCTION public.check_self_vote();

-- Function to safely award points with duplicate prevention and 100 points/day limit
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
    -- Serialize rewards for each user so concurrent actions cannot exceed the daily cap.
    SELECT points INTO v_new_total
    FROM public.users
    WHERE id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found.';
    END IF;

    -- 1. Idempotency check: prevent duplicate reward for the same action
    SELECT EXISTS (
        SELECT 1 FROM public.points_log
        WHERE user_id = p_user_id AND action = p_action
    ) INTO v_already_awarded;

    IF v_already_awarded THEN
        SELECT points INTO v_new_total FROM public.users WHERE id = p_user_id;
        SELECT COALESCE(SUM(points), 0) INTO v_points_today
        FROM public.points_log
        WHERE user_id = p_user_id AND created_at >= v_today_start;

        RETURN jsonb_build_object(
            'awarded', 0,
            'requested', p_points,
            'points_today', v_points_today,
            'daily_cap', 100,
            'total_points', v_new_total,
            'duplicate', true
        );
    END IF;

    -- 2. Calculate points earned today
    SELECT COALESCE(SUM(points), 0)
    INTO v_points_today
    FROM public.points_log
    WHERE user_id = p_user_id
      AND created_at >= v_today_start;

    -- 3. Calculate remaining quota under 100 pts/day cap
    IF v_points_today >= 100 THEN
        v_allowable_points := 0;
    ELSE
        v_allowable_points := LEAST(p_points, 100 - v_points_today);
    END IF;

    -- 4. Apply reward and log atomically
    IF v_allowable_points > 0 THEN
        INSERT INTO public.points_log (user_id, action, points)
        VALUES (p_user_id, p_action, v_allowable_points);

        UPDATE public.users
        SET points = points + v_allowable_points
        WHERE id = p_user_id
        RETURNING points INTO v_new_total;
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

-- Trigger to create public.users profile automatically on Supabase auth.users signup
-- Role cannot be self-assigned to faculty; it strictly defaults to 'student'
-- unless explicitly granted via server-side app_metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, display_name, role, college, points)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1), 'Student'),
        COALESCE(NEW.raw_app_meta_data->>'role', 'student'),
        COALESCE(NEW.raw_user_meta_data->>'college', 'Indian Institute of Technology'),
        0
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Secure View: Anonymous campus feed with ZERO author identity or PII exposure
CREATE OR REPLACE VIEW public.anonymous_questions AS
SELECT
    id,
    text,
    spoken_answer,
    steps,
    refresher,
    subject,
    concept,
    root_cause,
    resolution_status,
    college,
    published_at,
    created_at
FROM public.questions
WHERE visibility = 'anonymous' AND is_hidden = false AND report_count < 3;
