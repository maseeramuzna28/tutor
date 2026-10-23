// POST /api/confusion/[courseId]/pulse
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const admin = createAdminClient();

    // Unlock pulse badge if present
    await admin.from('badges').update({ earned: true }).eq('id', 'b6');

    return apiSuccess({
      ok: true,
      courseId,
      sentAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return apiError(err?.message || 'Failed to trigger confusion pulse.', 500);
  }
}
