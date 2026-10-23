// POST /api/lessons/[id]/complete
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthContext } from '@/lib/auth';
import { awardPoints } from '@/lib/points/engine';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getAuthContext(req);
    const admin = createAdminClient();

    const { data: lessons } = await admin.from('lessons').select('*').eq('id', id);
    const lesson = lessons && lessons[0];

    const isFirstTime = !lesson || !lesson.completed;
    if (lesson) {
      await admin.from('lessons').update({ completed: true }).eq('id', id);
    }

    let pointsAwarded = 0;
    let newTotal = 240;

    if (isFirstTime) {
      pointsAwarded = 10;
      // Unlock badge b3 (Lesson finisher)
      await admin.from('badges').update({ earned: true }).eq('id', 'b3');

      if (auth?.user?.id) {
        const award = await awardPoints(auth.user.id, `COMPLETE_LESSON:${id}`, 10);
        newTotal = award.totalPoints;
      } else {
        newTotal += pointsAwarded;
      }
    }

    return apiSuccess({
      id,
      pointsAwarded,
      points: newTotal,
    });
  } catch (err: any) {
    return apiError(err?.message || 'Failed to complete lesson.', 500);
  }
}
