// GET /api/pulse?days=7 - Faculty Pulse Aggregate Analytics
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { getAuthContext } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return apiError('Unauthorized. Please log in.', 401);
    }

    // Role check: Strictly faculty-only
    if (auth.profile.role !== 'faculty') {
      return apiError('Forbidden. Faculty Pulse analytics are strictly reserved for verified faculty.', 403);
    }

    const { searchParams } = new URL(req.url);
    const daysParam = parseInt(searchParams.get('days') || '7', 10);
    const days = [7, 30].includes(daysParam) ? daysParam : 7;

    const minCluster = parseInt(process.env.MIN_CLUSTER || '3', 10);

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const admin = createAdminClient();

    // Query questions created within the reporting window
    // Only select aggregate dimensions: concept, college, visibility, resolution_status
    // STRICT PRIVACY: NEVER SELECT text, author_id, or personal metadata!
    const { data: questions, error } = await admin
      .from('questions')
      .select('concept, college, visibility, resolution_status')
      .gte('created_at', sinceDate.toISOString());

    if (error) {
      console.error('Failed to query questions for faculty pulse:', error);
      return apiError('Failed to generate pulse analytics.', 500);
    }

    const allDoubts = questions || [];
    const totalDoubts = allDoubts.length;

    // 1. Calculate colleges represented
    const collegesSet = new Set(allDoubts.map((q: any) => q.college).filter(Boolean));
    const collegesRepresented = collegesSet.size;

    // 2. Calculate Silent Doubt Rate:
    // Defined as doubts that were kept private or marked still_stuck
    const silentDoubtsCount = allDoubts.filter(
      (q: any) => q.visibility === 'private' || q.resolution_status === 'still_stuck'
    ).length;

    const silentDoubtRate = totalDoubts > 0
      ? Math.round((silentDoubtsCount / totalDoubts) * 1000) / 10
      : 0;

    // 3. Aggregate counts per concept
    const conceptCounts: Record<string, number> = {};
    for (const q of allDoubts as any[]) {
      const c = (q.concept || 'General Doubt').trim();
      conceptCounts[c] = (conceptCounts[c] || 0) + 1;
    }

    // 4. Enforce MIN_CLUSTER grouping: concepts with < minCluster grouped into "Other"
    const clusteredConcepts: { concept: string; count: number }[] = [];
    let otherCount = 0;

    for (const [conceptName, count] of Object.entries(conceptCounts)) {
      if (count >= minCluster) {
        clusteredConcepts.push({ concept: conceptName, count });
      } else {
        otherCount += count;
      }
    }

    // Sort descending by doubt frequency
    clusteredConcepts.sort((a, b) => b.count - a.count);

    if (otherCount > 0) {
      clusteredConcepts.push({
        concept: 'Other Concepts (< threshold)',
        count: otherCount,
      });
    }

    return apiSuccess({
      period_days: days,
      total_doubts: totalDoubts,
      colleges_represented: collegesRepresented,
      silent_doubt_rate: silentDoubtRate,
      min_cluster_applied: minCluster,
      concepts: clusteredConcepts,
    }, 200);
  } catch (err: any) {
    console.error('API /api/pulse error:', err);
    return apiError(err?.message || 'Server error loading faculty pulse.', 500);
  }
}
