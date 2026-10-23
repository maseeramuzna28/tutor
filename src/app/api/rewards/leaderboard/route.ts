// GET /api/rewards/leaderboard?scope=class|college&range=week|all
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { getAuthContext } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scope = (searchParams.get('scope') || 'class') as 'class' | 'college';
    const range = (searchParams.get('range') || 'week') as 'week' | 'all';
    const auth = await getAuthContext(req);

    const baseData: Record<string, Record<string, [string, number][]>> = {
      class: {
        week: [
          ['Demo Student A', 180],
          ['Demo Student B', 150],
          ['Demo Student C', 120],
          ['Demo Student D', 90],
          ['Demo Student E', 60],
        ],
        all: [
          ['Demo Student A', 1240],
          ['Demo Student B', 980],
          ['Demo Student C', 760],
          ['Demo Student D', 410],
          ['Demo Student E', 300],
        ],
      },
      college: {
        week: [
          ['Demo Student F', 260],
          ['Demo Student A', 180],
          ['Demo Student G', 170],
          ['Demo Student B', 150],
          ['Demo Student H', 140],
        ],
        all: [
          ['Demo Student F', 2100],
          ['Demo Student G', 1500],
          ['Demo Student A', 1240],
          ['Demo Student H', 1100],
          ['Demo Student B', 980],
        ],
      },
    };

    const myPoints = auth?.profile?.points ?? 240;
    const userPoints = range === 'week' ? Math.min(myPoints, 130) : myPoints;

    const list = baseData[scope]?.[range] || baseData.class.week;
    const rows = list.map(([name, points]) => ({
      name,
      points,
      you: false,
    }));

    rows.push({
      name: auth?.profile?.display_name ? `${auth.profile.display_name} (You)` : 'You',
      points: userPoints,
      you: true,
    });

    const ranked = rows
      .sort((a, b) => b.points - a.points)
      .map((r, i) => ({ ...r, rank: i + 1 }));

    return apiSuccess(ranked);
  } catch (err: any) {
    return apiError(err?.message || 'Failed to fetch leaderboard.', 500);
  }
}
