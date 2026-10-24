// GET /api/me/points - Points balance and computed badges
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { getAuthContext } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { computeUserBadges, DAILY_POINTS_CAP } from '@/lib/points/engine';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return apiError('Unauthorized. Please log in.', 401);
    }

    const admin = createAdminClient();

    // 1. Fetch user profile for total points
    const { data: userProfile, error: profileError } = await admin
      .from('users')
      .select('points, display_name, college, role')
      .eq('id', auth.user.id)
      .single();

    if (profileError || !userProfile) {
      return apiError('User profile not found.', 404);
    }

    // 2. Fetch points earned today
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const { data: todayLogs } = await admin
      .from('points_log')
      .select('points')
      .eq('user_id', auth.user.id)
      .gte('created_at', startOfDay.toISOString());

    const pointsToday = (todayLogs || []).reduce((acc: number, log: any) => acc + (log.points || 0), 0);

    // 3. Fetch recent points log history (last 10)
    const { data: recentLogs } = await admin
      .from('points_log')
      .select('id, action, points, created_at')
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // 4. Compute badges dynamically
    const badges = await computeUserBadges(auth.user.id);

    return apiSuccess({
      points: userProfile.points,
      points_today: pointsToday,
      daily_cap: DAILY_POINTS_CAP,
      badges,
      recent_logs: recentLogs || [],
    }, 200);
  } catch (err: any) {
    console.error('API /api/me/points error:', err);
    return apiError(err?.message || 'Server error loading points.', 500);
  }
}
