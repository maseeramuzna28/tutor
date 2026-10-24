// POST /api/tutor/chat - Dynamic Multi-Turn Socratic Tutor Chat powered by TUTO Engine
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { tutoEngine } from '@/lib/ai/tutoEngine';
import { isAiRateLimited } from '@/lib/rateLimit';
import { SocraticChatRequest } from '@/lib/types/database';

export async function POST(req: NextRequest) {
  try {
    const contentLength = Number(req.headers.get('content-length') || 0);
    if (contentLength > 16_384) {
      return apiError('Request payload too large.', 413);
    }

    let body: SocraticChatRequest;
    try {
      body = await req.json();
    } catch {
      return apiError('Invalid JSON request body. Expected { message: string }.', 400);
    }

    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    if (!message) {
      return apiError('Message is required.', 400);
    }
    if (message.length > 2000) {
      return apiError('Message is too long (maximum 2000 characters).', 400);
    }

    // Rate limiting guard
    try {
      const rateLimited = await isAiRateLimited(req);
      if (rateLimited) {
        const response = apiError('Tutoring limit reached. Please wait a moment.', 429);
        response.headers.set('Retry-After', '30');
        return response;
      }
    } catch {
      // Proceed on rate limiter lookup failure
    }

    // Call Socratic Tutor
    const turnResult = await tutoEngine.interactiveSocraticChat({
      message,
      conversation: body.conversation,
      sessionState: body.sessionState,
      style: body.style,
    });

    return apiSuccess(turnResult, 200);
  } catch (err: any) {
    console.error('API /api/tutor/chat error:', err);
    return apiError(err?.message || 'Failed to process Socratic tutor turn.', 500);
  }
}
