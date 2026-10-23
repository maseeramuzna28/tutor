// POST /api/detect - Question Detection
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { detectQuestion } from '@/lib/voice/speech';

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError('Invalid JSON request body. Expected { text: string }.', 400);
    }

    if (!body || typeof body.text !== 'string') {
      return apiError('The "text" field is required as a string.', 400);
    }

    const result = await detectQuestion(body.text);

    return apiSuccess({
      isQuestion: result.isQuestion,
    }, 200);
  } catch (err: any) {
    console.error('API /api/detect error:', err);
    // Requirement: fail open
    return apiSuccess({ isQuestion: true }, 200);
  }
}
