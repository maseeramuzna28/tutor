CREATE TABLE IF NOT EXISTS public.ai_rate_limits (
    key TEXT PRIMARY KEY,
    window_started_at TIMESTAMPTZ NOT NULL,
    request_count INTEGER NOT NULL CHECK (request_count >= 0)
);

CREATE INDEX IF NOT EXISTS idx_ai_rate_limits_window
    ON public.ai_rate_limits(window_started_at);

ALTER TABLE public.ai_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.consume_ai_rate_limit(
    p_key TEXT,
    p_window_seconds INTEGER,
    p_max_requests INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_count INTEGER;
    v_window_started_at TIMESTAMPTZ;
BEGIN
    IF p_key IS NULL OR p_window_seconds < 1 OR p_max_requests < 1 THEN
        RAISE EXCEPTION 'Invalid rate limit parameters.';
    END IF;

    INSERT INTO public.ai_rate_limits (key, window_started_at, request_count)
    VALUES (p_key, NOW(), 1)
    ON CONFLICT (key) DO UPDATE
    SET window_started_at = CASE
            WHEN public.ai_rate_limits.window_started_at <= NOW() - make_interval(secs => p_window_seconds)
            THEN NOW()
            ELSE public.ai_rate_limits.window_started_at
        END,
        request_count = CASE
            WHEN public.ai_rate_limits.window_started_at <= NOW() - make_interval(secs => p_window_seconds)
            THEN 1
            ELSE public.ai_rate_limits.request_count + 1
        END
    RETURNING request_count, window_started_at
    INTO v_count, v_window_started_at;

    DELETE FROM public.ai_rate_limits
    WHERE window_started_at < NOW() - INTERVAL '1 day';

    RETURN jsonb_build_object(
        'allowed', v_count <= p_max_requests,
        'remaining', GREATEST(0, p_max_requests - v_count),
        'reset_at', v_window_started_at + make_interval(secs => p_window_seconds)
    );
END;
$$;

REVOKE ALL ON FUNCTION public.consume_ai_rate_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_rate_limit(TEXT, INTEGER, INTEGER) TO service_role;
