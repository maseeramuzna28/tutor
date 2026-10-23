import { createHash } from 'node:crypto';
import { NextRequest } from 'next/server';
import { createAdminClient } from './supabase/admin';

const AI_RATE_LIMIT = 10;
const AI_RATE_WINDOW_SECONDS = 60;

export async function isAiRateLimited(req: NextRequest): Promise<boolean> {
  const forwardedFor = req.headers.get('x-forwarded-for')?.split(',').map((part) => part.trim()).filter(Boolean);
  const clientAddress = req.headers.get('x-real-ip') || forwardedFor?.at(-1) || 'unknown';
  const key = createHash('sha256').update(clientAddress).digest('hex');
  const admin = createAdminClient();

  const { data, error } = await admin.rpc('consume_ai_rate_limit', {
    p_key: key,
    p_window_seconds: AI_RATE_WINDOW_SECONDS,
    p_max_requests: AI_RATE_LIMIT,
  });

  if (error || typeof data?.allowed !== 'boolean') {
    console.error('AI rate limit check failed:', error?.message || 'invalid rate limit response');
    throw new Error('AI service is temporarily unavailable.');
  }

  return !data.allowed;
}
