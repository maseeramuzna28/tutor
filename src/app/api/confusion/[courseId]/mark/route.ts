// POST /api/confusion/[courseId]/mark
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError('Invalid JSON request body.', 400);
    }

    const topicId = typeof body?.topicId === 'string' ? body.topicId : '';
    if (!topicId) {
      return apiError('topicId is required.', 400);
    }

    const admin = createAdminClient();
    const { data: topics } = await admin
      .from('topics')
      .select('*')
      .eq('id', topicId);

    const topic = topics && topics[0];
    const newHeat = Math.min(100, (topic?.heat || 50) + 8);

    if (topic) {
      await admin.from('topics').update({ heat: newHeat }).eq('id', topicId);
      return apiSuccess({ ...topic, heat: newHeat });
    }

    return apiSuccess({ id: topicId, name: topicId, heat: newHeat });
  } catch (err: any) {
    return apiError(err?.message || 'Failed to mark topic confusion.', 500);
  }
}
