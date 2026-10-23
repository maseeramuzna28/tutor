// PATCH /api/questions/:id/visibility - Publish question anonymously
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { getAuthContext } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { awardPoints, REWARD_AMOUNTS } from '@/lib/points/engine';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questionId } = await params;
    const auth = await getAuthContext(req);
    if (!auth) {
      return apiError('Unauthorized. Please log in.', 401);
    }

    if (!questionId) {
      return apiError('Question ID is required.', 400);
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body can be empty if the intent is to toggle or set to anonymous
    }

    const targetVisibility = body.visibility || 'anonymous';
    if (!['private', 'anonymous'].includes(targetVisibility)) {
      return apiError("Visibility must be 'private' or 'anonymous'.", 400);
    }

    const admin = createAdminClient();

    // 1. Fetch question and verify ownership
    const { data: question, error: fetchError } = await admin
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (fetchError || !question) {
      return apiError('Question not found.', 404);
    }

    if (question.author_id !== auth.user.id) {
      return apiError('Forbidden. You can only modify your own questions.', 403);
    }

    // Check if publication reward was already awarded for this question
    const alreadyPublished = question.visibility === 'anonymous' || Boolean(question.published_at);

    // 2. Update visibility
    const { data: updated, error: updateError } = await admin
      .from('questions')
      .update({
        visibility: targetVisibility,
        published_at: question.published_at || (targetVisibility === 'anonymous' ? new Date().toISOString() : null),
      })
      .eq('id', questionId)
      .select()
      .single();

    if (updateError || !updated) {
      return apiError('Failed to update question visibility.', 500);
    }

    let pointsAwarded = 0;
    // Award +5 points ONLY ONCE when transition to anonymous occurs for the first time
    if (targetVisibility === 'anonymous' && !alreadyPublished) {
      const award = await awardPoints(
        auth.user.id,
        `PUBLISH_ANONYMOUS:${questionId}`,
        REWARD_AMOUNTS.PUBLISH_ANONYMOUS
      );
      pointsAwarded = award.awarded;
    }

    return apiSuccess({
      id: updated.id,
      visibility: updated.visibility,
      published_at: updated.published_at,
      points_awarded: pointsAwarded,
      message: 'Question published anonymously to the campus feed.',
    }, 200);
  } catch (err: any) {
    console.error('API /api/questions/[id]/visibility error:', err);
    return apiError(err?.message || 'Server error updating visibility.', 500);
  }
}
