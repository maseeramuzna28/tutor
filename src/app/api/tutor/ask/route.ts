// POST /api/tutor/ask - AI Tutor Question Solver powered by TUTO LLM Engine
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { tutoEngine } from '@/lib/ai/tutoEngine';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthContext } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError('Invalid JSON request body. Expected { question: string }.', 400);
    }

    const question = typeof body?.question === 'string' ? body.question.trim() : '';
    if (!question) {
      return apiError('Question text is required.', 400);
    }

    const auth = await getAuthContext(req);
    const hasGeminiKey = Boolean(
      process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your-')
    );

    // Solve question using TUTO's specialized academic multi-tier engine
    const solution = await tutoEngine.solveDoubt({ question });

    const admin = createAdminClient();
    const questionId = crypto.randomUUID ? crypto.randomUUID() : `doubt-${Date.now()}`;

    // Store doubt in database
    await admin.from('questions').insert({
      id: questionId,
      author_id: auth?.user?.id || '00000000-0000-0000-0000-000000000001',
      text: question,
      spoken_answer: solution.spoken_answer || solution.response,
      steps: solution.steps || [],
      refresher: solution.refresher || '',
      subject: solution.subject || 'Computer Science',
      concept: solution.concept || 'General Concept',
      root_cause: solution.root_cause || 'Fundamental Prerequisite',
      visibility: 'private',
      resolution_status: 'open',
      college: auth?.profile?.college || 'National Institute of Technology',
      created_at: new Date().toISOString(),
    });

    const steps = solution.steps.map((s: any) => ({
      title: s.title || `Step ${s.step || 1}`,
      body: s.explanation + (s.equation_or_code ? `\n\n${s.equation_or_code}` : ''),
      latex: s.equation_or_code || (s.explanation.includes('$') ? s.explanation : undefined),
    }));

    // Ensure flowchart nodes have stepIndex mapped for interactive stepping
    const flowchartNodes = (solution.flowchart?.nodes || []).map((node: any, idx: number) => ({
      ...node,
      stepIndex: node.stepIndex !== undefined ? node.stepIndex : Math.max(0, idx - 1),
    }));

    const flowchartEdges = solution.flowchart?.edges || [];

    return apiSuccess({
      id: questionId,
      question,
      isDemo: false,
      provider: solution.provider,
      model: solution.model,
      subject: solution.subject,
      concept: solution.concept,
      root_cause: solution.root_cause,
      spoken_answer: solution.spoken_answer,
      analogy: solution.analogy,
      flowchart: {
        title: solution.flowchart?.title || `${solution.concept} — Pipeline Flowchart`,
        nodes: flowchartNodes,
        edges: flowchartEdges,
      },
      steps,
    });
  } catch (err: any) {
    console.error('API /api/tutor/ask error:', err);
    return apiError(err?.message || 'Failed to process question.', 500);
  }
}
