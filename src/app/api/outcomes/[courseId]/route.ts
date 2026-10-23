// GET /api/outcomes/[courseId]
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

    const { data: outcomes } = await admin
      .from('outcomes')
      .select('*')
      .eq('courseId', courseId);

    const defaultOutcomes: Record<string, any[]> = {
      cs201: [
        { code: 'CO1', text: 'Analyse the time complexity of algorithms', target: 60, attainment: 68 },
        { code: 'CO2', text: 'Implement linear and tree data structures', target: 60, attainment: 52 },
        { code: 'CO3', text: 'Apply recursion to divide and conquer problems', target: 60, attainment: 47 },
        { code: 'CO4', text: 'Select hash based structures for lookup problems', target: 60, attainment: 71 },
      ],
      cs204: [
        { code: 'CO1', text: 'Design entity relationship models', target: 60, attainment: 74 },
        { code: 'CO2', text: 'Write SQL queries across multiple tables', target: 60, attainment: 58 },
        { code: 'CO3', text: 'Normalize relational schemas', target: 60, attainment: 49 },
        { code: 'CO4', text: 'Reason about transactions and concurrency', target: 60, attainment: 55 },
      ],
      cs210: [
        { code: 'CO1', text: 'Compare CPU scheduling algorithms', target: 60, attainment: 66 },
        { code: 'CO2', text: 'Solve synchronization problems', target: 60, attainment: 46 },
        { code: 'CO3', text: 'Explain memory management techniques', target: 60, attainment: 59 },
        { code: 'CO4', text: 'Describe file system structures', target: 60, attainment: 72 },
      ],
    };

    const result = outcomes && outcomes.length > 0 ? outcomes : (defaultOutcomes[courseId] || []);
    return apiSuccess(result);
  } catch (err: any) {
    return apiError(err?.message || 'Failed to fetch course outcomes.', 500);
  }
}
