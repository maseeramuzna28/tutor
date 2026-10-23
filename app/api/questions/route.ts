// POST /api/questions - Create a private doubt for the authenticated user
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { getAuthContext } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { awardPoints, REWARD_AMOUNTS } from '@/lib/points/engine';
import { containsProfanity } from '@/lib/moderation/profanity';

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return apiError('Unauthorized. Please log in to submit a question.', 401);
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError('Invalid JSON request body.', 400);
    }

    if (!body.text || typeof body.text !== 'string' || body.text.trim().length === 0) {
      return apiError('Question text is required.', 400);
    }

    if (containsProfanity(body.text)) {
      return apiError('Question contains prohibited or abusive language.', 400);
    }

    const admin = createAdminClient();

    // Insert private question
    const { data: newQuestion, error: insertError } = await admin
      .from('questions')
      .insert({
        author_id: auth.user.id,
        text: body.text.trim(),
        spoken_answer: body.spoken_answer || null,
        steps: Array.isArray(body.steps) ? body.steps : [],
        refresher: body.refresher || null,
        subject: body.subject || 'General',
        concept: body.concept || 'General Concept',
        root_cause: body.root_cause || 'Foundational prerequisite',
        visibility: 'private',
        resolution_status: 'open',
        college: auth.profile.college,
        report_count: 0,
        is_hidden: false,
      })
      .select('id, created_at')
      .single();

    if (insertError || !newQuestion) {
      console.error('Failed to insert question:', insertError);
      return apiError(insertError?.message || 'Failed to save question.', 500);
    }

    // Award +5 points for asking doubt
    const awardResult = await awardPoints(
      auth.user.id,
      'ASK_QUESTION',
      REWARD_AMOUNTS.ASK_QUESTION
    );

    return apiSuccess({
      id: newQuestion.id,
      created_at: newQuestion.created_at,
      points_awarded: awardResult.awarded,
      total_points: awardResult.totalPoints,
    }, 201);
  } catch (err: any) {
    console.error('API /api/questions error:', err);
    return apiError(err?.message || 'Server error creating question.', 500);
  }
}
