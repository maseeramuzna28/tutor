// POST /api/answers - Post an answer to a doubt
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
      return apiError('Unauthorized. Please log in to answer.', 401);
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError('Invalid JSON body. Expected { question_id: string, text: string }.', 400);
    }

    if (!body.question_id || typeof body.question_id !== 'string') {
      return apiError('question_id is required.', 400);
    }

    if (!body.text || typeof body.text !== 'string' || body.text.trim().length === 0) {
      return apiError('Answer text is required.', 400);
    }

    if (containsProfanity(body.text)) {
      return apiError('Answer contains prohibited or inappropriate content.', 400);
    }

    const admin = createAdminClient();

    // Verify question exists and is not hidden
    const { data: question, error: qError } = await admin
      .from('questions')
      .select('id, visibility, is_hidden')
      .eq('id', body.question_id)
      .single();

    if (qError || !question) {
      return apiError('Question not found.', 404);
    }

    if (question.is_hidden) {
      return apiError('Question has been removed or hidden by moderation.', 400);
    }

    // Insert answer
    const { data: newAnswer, error: ansError } = await admin
      .from('answers')
      .insert({
        question_id: body.question_id,
        author_id: auth.user.id,
        text: body.text.trim(),
        is_ai: false,
        is_staff_verified: false,
        report_count: 0,
        is_hidden: false,
      })
      .select(`
        id,
        question_id,
        text,
        is_ai,
        is_staff_verified,
        created_at
      `)
      .single();

    if (ansError || !newAnswer) {
      console.error('Failed to post answer:', ansError);
      return apiError('Failed to post answer.', 500);
    }

    // Award +10 points to answering student
    const award = await awardPoints(
      auth.user.id,
      `ANSWER_QUESTION:${newAnswer.id}`,
      REWARD_AMOUNTS.ANSWER_QUESTION
    );

    return apiSuccess({
      id: newAnswer.id,
      question_id: newAnswer.question_id,
      text: newAnswer.text,
      is_staff_verified: newAnswer.is_staff_verified,
      created_at: newAnswer.created_at,
      points_awarded: award.awarded,
      author: {
        display_name: auth.profile.display_name,
        role: auth.profile.role,
        college: auth.profile.college,
      },
    }, 201);
  } catch (err: any) {
    console.error('API /api/answers error:', err);
    return apiError(err?.message || 'Server error posting answer.', 500);
  }
}
