// POST /api/contributions/:id/decide - Project owner accepts or declines join requests
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

    const contributionId = params.id;
    if (!contributionId) {
      return apiError('Contribution ID is required.', 400);
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError('Invalid JSON body. Expected { status: "accepted" | "declined" }.', 400);
    }

    const { status } = body;
    if (!status || !['accepted', 'declined'].includes(status)) {
      return apiError("Decision status must be 'accepted' or 'declined'.", 400);
    }

    const admin = createAdminClient();

    // 1. Fetch contribution and join with project to check owner
    const { data: contribution, error: fetchError } = await admin
      .from('contributions')
      .select(`
        id,
        project_id,
        user_id,
        status,
        project:projects (
          id,
          owner_id,
          title
        )
      `)
      .eq('id', contributionId)
      .single();

    if (fetchError || !contribution) {
      return apiError('Contribution request not found.', 404);
    }

    const projectOwnerId = (contribution.project as any)?.owner_id;
    if (projectOwnerId !== auth.user.id) {
      return apiError('Forbidden. Only the project owner can decide join requests.', 403);
    }

    const wasAlreadyAccepted = contribution.status === 'accepted';

    // 2. Update status
    const { data: updated, error: updateError } = await admin
      .from('contributions')
      .update({ status })
      .eq('id', contributionId)
      .select()
      .single();

    if (updateError || !updated) {
      return apiError('Failed to update contribution status.', 500);
    }

    let pointsAwarded = 0;
    // 3. Award +20 points to the accepted contributor (exactly once)
    if (status === 'accepted' && !wasAlreadyAccepted) {
      const award = await awardPoints(
        contribution.user_id,
        `ACCEPTED_CONTRIBUTION:${contribution.project_id}`,
        REWARD_AMOUNTS.ACCEPTED_CONTRIBUTION
      );
      pointsAwarded = award.awarded;
    }

    return apiSuccess({
      id: updated.id,
      project_id: updated.project_id,
      status: updated.status,
      points_awarded_to_contributor: pointsAwarded,
      message: `Contribution request ${status}.`,
    }, 200);
  } catch (err: any) {
    console.error('API /api/contributions/[id]/decide error:', err);
    return apiError(err?.message || 'Server error deciding contribution.', 500);
  }
}
