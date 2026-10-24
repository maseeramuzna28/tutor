// POST /api/solve - Root-Cause AI Tutor
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { solveAcademicDoubt } from '@/lib/ai/gemini';
import { tutoEngine } from '@/lib/ai/tutoEngine';
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

    const hasGeminiKey = Boolean(
      process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your-')
    );

    if (hasGeminiKey) {
      let rateLimited: boolean;
      try {
        rateLimited = await isAiRateLimited(req);
      } catch {
        rateLimited = false;
      }
      if (rateLimited) {
        const response = apiError('Too many tutoring requests. Please wait a minute and try again.', 429);
        response.headers.set('Retry-After', '60');
        return response;
      }

      try {
        const response = await solveAcademicDoubt(body);
        const formatted = {
          ...response,
          spoken_answer: response.spoken_answer || (response as any).response,
          steps: (response.steps || []).map((s: any, idx: number) => ({
            step_number: s.step_number || s.step || idx + 1,
            title: s.title || `Step ${idx + 1}`,
            explanation: s.explanation || '',
            latex: s.latex || s.equation_or_code || (s.explanation && s.explanation.includes('$') ? s.explanation : undefined),
            teaching_speech: s.teaching_speech,
            check_question: s.check_question,
            auto_notes: s.auto_notes,
          })),
        };
        return apiSuccess(formatted, 200);
      } catch (err: any) {
        console.warn('Gemini cloud solver failed or unconfigured, falling back to local TUTO engine:', err?.message);
      }
    }

    // High-precision local academic intelligence engine fallback
    const localSolution = await tutoEngine.solveDoubt({ question: body.question });
    const formattedSteps = (localSolution.steps || []).map((s: any, idx: number) => ({
      step_number: typeof s.step === 'number' ? s.step : idx + 1,
      title: s.title || `Step ${idx + 1}`,
      explanation: s.explanation || '',
      latex: s.equation_or_code || (s.explanation && s.explanation.includes('$') ? s.explanation : undefined),
      teaching_speech: s.teaching_speech,
      check_question: s.check_question,
      auto_notes: s.auto_notes,
    }));

    return apiSuccess({
      spoken_answer: localSolution.spoken_answer || localSolution.response,
      tutor_intro: localSolution.tutor_intro,
      tutor_wrapup: localSolution.tutor_wrapup,
      concept: localSolution.concept || 'Foundational Concept',
      root_cause: localSolution.root_cause || 'Core mathematical or conceptual relationship',
      subject: localSolution.subject || 'STEM / Academic',
      steps: formattedSteps,
      flowchart: localSolution.flowchart,
      analogy: localSolution.analogy,
    }, 200);
  } catch (err: any) {
    const message = err instanceof Error ? err.message : 'Failed to solve academic doubt.';
    console.error('API /api/solve error:', message);
    return apiError(message, 500);
  }
}
