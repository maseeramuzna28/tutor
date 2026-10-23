// POST /api/answers/:id/verify - Faculty-only answer verification
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { getAuthContext } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { awardPoints, REWARD_AMOUNTS } from '@/lib/points/engine';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return apiError('Unauthorized. Please log in.', 401);
    }

    // Role check: Strictly faculty-only
    if (auth.profile.role !== 'faculty') {
      return apiError('Forbidden. Only faculty members can verify academic answers.', 403);
    }

    const answerId = params.id;
    if (!answerId) {
      return apiError('Answer ID is required.', 400);
    }

    const admin = createAdminClient();

    // 1. Fetch answer
    const { data: answer, error: fetchError } = await admin
      .from('answers')
      .select('*')
      .eq('id', answerId)
      .single();

    if (fetchError || !answer) {
      return apiError('Answer not found.', 404);
    }

    if (answer.is_staff_verified) {
      return apiSuccess({
        id: answer.id,
        is_staff_verified: true,
        message: 'Answer is already verified.',
        points_awarded: 0,
      }, 200);
    }

    // 2. Mark as verified
    const { error: updateError } = await admin
      .from('answers')
      .update({ is_staff_verified: true })
      .eq('id', answerId);

    if (updateError) {
      return apiError('Failed to verify answer.', 500);
    }

    // 3. Award +25 points to the answer author (not the faculty)
    const award = await awardPoints(
      answer.author_id,
      `FACULTY_VERIFIED:${answer.id}`,
      REWARD_AMOUNTS.FACULTY_VERIFIED
    );

    return apiSuccess({
      id: answer.id,
      is_staff_verified: true,
      points_awarded_to_author: award.awarded,
      message: 'Answer successfully verified with staff endorsement.',
    }, 200);
  } catch (err: any) {
    console.error('API /api/answers/[id]/verify error:', err);
    return apiError(err?.message || 'Server error verifying answer.', 500);
  }
}
