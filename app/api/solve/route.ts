// POST /api/solve - Root-Cause AI Tutor
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { solveAcademicDoubt } from '@/lib/ai/gemini';
import { SolveRequest } from '@/lib/types/database';

export async function POST(req: NextRequest) {
  try {
    let body: SolveRequest;
    try {
      body = await req.json();
    } catch {
      return apiError('Invalid JSON request body. Expected { question: string, style?: string }.', 400);
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

    const clientKey = req.headers.get('x-gemini-api-key');
    const response = await solveAcademicDoubt(body, clientKey);
    return apiSuccess(response, 200);
  } catch (err: any) {
    console.error('API /api/solve error:', err);
    const message = err?.message || 'Failed to solve academic doubt.';
    return apiError(message, 500);
  }
}
