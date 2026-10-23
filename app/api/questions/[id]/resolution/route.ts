// PATCH /api/questions/:id/resolution - Update question resolution status
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { getAuthContext } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

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

    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError('Invalid JSON request body. Expected { status: "open" | "resolved" | "still_stuck" }.', 400);
    }

    const status = body.status || body.resolution_status;
    if (!status || !['open', 'resolved', 'still_stuck'].includes(status)) {
      return apiError("Resolution status must be one of: 'open', 'resolved', 'still_stuck'.", 400);
    }

    const admin = createAdminClient();

    // 1. Check ownership
    const { data: question, error: fetchError } = await admin
      .from('questions')
      .select('author_id')
      .eq('id', questionId)
      .single();

    if (fetchError || !question) {
      return apiError('Question not found.', 404);
    }

    if (question.author_id !== auth.user.id) {
      return apiError('Forbidden. You can only update the resolution status of your own doubts.', 403);
    }

    // 2. Update status
    const { data: updated, error: updateError } = await admin
      .from('questions')
      .update({ resolution_status: status })
      .eq('id', questionId)
      .select('id, resolution_status')
      .single();

    if (updateError || !updated) {
      return apiError('Failed to update resolution status.', 500);
    }

    return apiSuccess({
      id: updated.id,
      resolution_status: updated.resolution_status,
      message: `Resolution status updated to ${updated.resolution_status}.`,
    }, 200);
  } catch (err: any) {
    console.error('API /api/questions/[id]/resolution error:', err);
    return apiError(err?.message || 'Server error updating resolution status.', 500);
  }
}
