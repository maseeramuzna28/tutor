// GET /api/leaderboard?scope=college|national - Gamified Top 20 Leaderboard
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { getAuthContext } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope') || 'national';

    if (!['college', 'national'].includes(scope)) {
      return apiError("Invalid scope. Must be 'college' or 'national'.", 400);
    }

    const auth = await getAuthContext(req);
    // College scope requires authentication to know the user's college
    if (scope === 'college' && !auth) {
      return apiError('Unauthorized. Please log in to view your college leaderboard.', 401);
    }

    const admin = createAdminClient();

    let query = admin
      .from('users')
      .select('id, display_name, college, points')
      .order('points', { ascending: false })
      .limit(20);

    if (scope === 'college' && auth) {
      query = query.eq('college', auth.profile.college);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error('Failed to query leaderboard:', error);
      return apiError('Failed to load leaderboard.', 500);
    }

    // Sanitize user output: only return public gaming stats
    const leaderboard = (users || []).map((u: any, index: number) => ({
      rank: index + 1,
      display_name: u.display_name,
      college: u.college,
      points: u.points,
      is_current_user: auth ? u.id === auth.user.id : false,
    }));

    return apiSuccess({
      scope,
      college: scope === 'college' ? auth?.profile.college : null,
      leaderboard,
    }, 200);
  } catch (err: any) {
    console.error('API /api/leaderboard error:', err);
    return apiError(err?.message || 'Server error loading leaderboard.', 500);
  }
}
