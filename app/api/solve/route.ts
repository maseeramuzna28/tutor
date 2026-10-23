// POST /api/solve - Root-Cause AI Tutor
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { solveAcademicDoubt } from '@/lib/ai/gemini';
import { isAiRateLimited } from '@/lib/rateLimit';
import { SolveRequest } from '@/lib/types/database';

export async function POST(req: NextRequest) {
  try {
    const contentLength = Number(req.headers.get('content-length') || 0);
    if (contentLength > 16_384) {
      return apiError('Request body is too large.', 413);
    }

    let body: SolveRequest;
    try {
      body = await req.json();
    } catch {
      return apiError('Invalid JSON request body. Expected { question: string, style?: string }.', 400);
    }

    if (new TextEncoder().encode(JSON.stringify(body)).length > 16_384) {
      return apiError('Request body is too large.', 413);
    }

    if (!body || !body.question || typeof body.question !== 'string' || body.question.trim().length === 0) {
      return apiError('Question text is required.', 400);
    }

    if (body.question.length > 2000) {
      return apiError('Question is too long (maximum 2000 characters).', 400);
    }

    if (body.style && !['simpler', 'analogy', 'worked_example'].includes(body.style)) {
      return apiError("Invalid style. Must be 'simpler', 'analogy', or 'worked_example'.", 400);
    }
    if (body.conversation !== undefined && (
      !Array.isArray(body.conversation) ||
      body.conversation.length > 6 ||
      body.conversation.some((turn) =>
        !turn ||
        (turn.role !== 'user' && turn.role !== 'assistant') ||
        typeof turn.content !== 'string' ||
        turn.content.trim().length === 0 ||
        turn.content.length > 2000
      )
    )) {
      return apiError('Conversation context is invalid.', 400);
    }

    if (!process.env.GEMINI_API_KEY) {
      return apiError('GEMINI_API_KEY is not configured in the server environment.', 503);
    }

    let rateLimited: boolean;
    try {
      rateLimited = await isAiRateLimited(req);
    } catch {
      return apiError('AI service is temporarily unavailable.', 503);
    }
    if (rateLimited) {
      const response = apiError('Too many tutoring requests. Please wait a minute and try again.', 429);
      response.headers.set('Retry-After', '60');
      return response;
    }

    const response = await solveAcademicDoubt(body);
    return apiSuccess(response, 200);
  } catch (err: any) {
    const message = err instanceof Error ? err.message : 'Failed to solve academic doubt.';
    if (message === 'GEMINI_API_KEY is not configured in the server environment.') {
      return apiError(message, 503);
    }
    if (message.includes('rate limit or quota')) {
      return apiError(message, 429);
    }
    console.error('API /api/solve error:', message);
    return apiError(message, message.includes('timed out') ? 504 : 502);
  }
}
