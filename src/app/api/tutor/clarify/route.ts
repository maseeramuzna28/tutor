// POST /api/tutor/clarify - Clarify a step with intuitive analogy powered by TUTO Analogy Bot
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { tutoEngine } from '@/lib/ai/tutoEngine';

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError('Invalid JSON request body.', 400);
    }

    const stepTitle = typeof body?.stepTitle === 'string' ? body.stepTitle.trim() : '';
    if (!stepTitle) {
      return apiError('stepTitle is required.', 400);
    }

    const context = typeof body?.context === 'string' ? body.context.trim() : undefined;
    const explanation = await tutoEngine.clarifyStep(stepTitle, context);
    return apiSuccess({ text: explanation });
  } catch (err: any) {
    console.error('API /api/tutor/clarify error:', err);
    return apiError(err?.message || 'Failed to clarify step.', 500);
  }
}
