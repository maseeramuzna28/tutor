// GET /api/confusion/[courseId]
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const admin = createAdminClient();

    const { data: topics } = await admin
      .from('topics')
      .select('*')
      .eq('courseId', courseId);

    const defaultTopics: Record<string, Array<{ id: string; name: string; heat: number }>> = {
      cs201: [
        { id: 't1', name: 'Recursion', heat: 62 },
        { id: 't2', name: 'Linked lists', heat: 28 },
        { id: 't3', name: 'Binary trees', heat: 36 },
        { id: 't4', name: 'Hashing', heat: 18 },
        { id: 't5', name: 'Big O', heat: 30 },
        { id: 't6', name: 'Graph traversal', heat: 48 },
      ],
      cs204: [
        { id: 't7', name: 'Normalization', heat: 44 },
        { id: 't8', name: 'SQL joins', heat: 24 },
        { id: 't9', name: 'Transactions', heat: 52 },
        { id: 't10', name: 'Indexing', heat: 38 },
        { id: 't11', name: 'ER diagrams', heat: 20 },
        { id: 't12', name: 'Query planning', heat: 58 },
      ],
      cs210: [
        { id: 't13', name: 'Deadlocks', heat: 52 },
        { id: 't14', name: 'Paging', heat: 40 },
        { id: 't15', name: 'Scheduling', heat: 34 },
        { id: 't16', name: 'Semaphores', heat: 66 },
        { id: 't17', name: 'Virtual memory', heat: 46 },
        { id: 't18', name: 'File systems', heat: 22 },
      ],
    };

    const result = topics && topics.length > 0 ? topics : (defaultTopics[courseId] || []);
    return apiSuccess(result);
  } catch (err: any) {
    return apiError(err?.message || 'Failed to fetch course confusion topics.', 500);
  }
}
