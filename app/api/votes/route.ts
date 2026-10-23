// POST /api/votes - Upvoting with self-vote prevention and unique vote enforcement
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { getAuthContext } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { awardPoints, REWARD_AMOUNTS } from '@/lib/points/engine';

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return apiError('Unauthorized. Please log in to vote.', 401);
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError('Invalid JSON body. Expected { target_type: "question"|"answer", target_id: string }.', 400);
    }

    const { target_type, target_id } = body;
    if (!target_type || !['question', 'answer'].includes(target_type)) {
      return apiError("target_type must be 'question' or 'answer'.", 400);
    }
    if (!target_id || typeof target_id !== 'string') {
      return apiError('target_id is required.', 400);
    }

    const admin = createAdminClient();

    // 1. Fetch target and verify author (self-vote prevention)
    let authorId: string | null = null;
    if (target_type === 'question') {
      const { data: q } = await admin.from('questions').select('author_id').eq('id', target_id).single();
      authorId = q?.author_id || null;
    } else {
      const { data: a } = await admin.from('answers').select('author_id').eq('id', target_id).single();
      authorId = a?.author_id || null;
    }

    if (!authorId) {
      return apiError(`${target_type} not found.`, 404);
    }

    // Prevent self-voting
    if (authorId === auth.user.id) {
      return apiError('Self-voting is not allowed.', 400);
    }

    // 2. Check for duplicate vote
    const { data: existingVote } = await admin
      .from('votes')
      .select('id')
      .eq('user_id', auth.user.id)
      .eq('target_type', target_type)
      .eq('target_id', target_id)
      .maybeSingle();

    if (existingVote) {
      return apiError('You have already voted on this item.', 400);
    }

    // 3. Insert vote
    const { error: insertError } = await admin.from('votes').insert({
      user_id: auth.user.id,
      target_type,
      target_id,
    });

    if (insertError) {
      if (insertError.code === '23505') {
        return apiError('You have already voted on this item.', 400);
      }
      return apiError('Failed to record vote.', 500);
    }

    // 4. Award +2 points to the author of the target
    const award = await awardPoints(
      authorId,
      `RECEIVE_UPVOTE:${target_type}:${target_id}`,
      REWARD_AMOUNTS.RECEIVE_UPVOTE
    );

    return apiSuccess({
      message: 'Vote recorded.',
      target_type,
      target_id,
      points_awarded_to_author: award.awarded,
    }, 200);
  } catch (err: any) {
    console.error('API /api/votes error:', err);
    return apiError(err?.message || 'Server error recording vote.', 500);
  }
}
