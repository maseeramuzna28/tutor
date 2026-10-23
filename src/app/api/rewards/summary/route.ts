// GET /api/rewards/summary
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthContext } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    const admin = createAdminClient();

    const { data: badges } = await admin.from('badges').select('*');

    const defaultBadges = [
      { id: 'b1', name: 'First question', text: 'Asked your first question.', earned: true },
      { id: 'b2', name: 'Three day streak', text: 'Studied three days in a row.', earned: true },
      { id: 'b3', name: 'Lesson finisher', text: 'Completed a micro lesson.', earned: false },
      { id: 'b4', name: 'Helper', text: 'Replied to five community posts.', earned: false },
      { id: 'b5', name: 'Project starter', text: 'Posted a college project.', earned: false },
      { id: 'b6', name: 'Pulse sender', text: 'Sent a Live Confusion Pulse.', earned: false },
    ];

    return apiSuccess({
      points: auth?.profile?.points ?? 240,
      streak: 4,
      badges: badges && badges.length > 0 ? badges : defaultBadges,
    });
  } catch (err: any) {
    return apiError(err?.message || 'Failed to fetch rewards summary.', 500);
  }
}
