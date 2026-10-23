// GET /api/dashboard/faculty
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(_req: NextRequest) {
  try {
    const admin = createAdminClient();

    const [
      { data: sections },
      { data: topics },
      { data: questions },
    ] = await Promise.all([
      admin.from('sections').select('*'),
      admin.from('topics').select('*'),
      admin.from('questions').select('text').limit(10),
    ]);

    const defaultSections = [
      { course: 'Data Structures', section: 'A', enrolled: 58, openDoubts: 6, flagged: 3 },
      { course: 'Data Structures', section: 'B', enrolled: 54, openDoubts: 4, flagged: 2 },
      { course: 'Database Systems', section: 'A', enrolled: 60, openDoubts: 5, flagged: 2 },
      { course: 'Operating Systems', section: 'A', enrolled: 57, openDoubts: 8, flagged: 4 },
    ];

    const sortedTopics = [...(topics || [])].sort((a: any, b: any) => (b.heat || 0) - (a.heat || 0));
    const recentQuestions = (questions || []).map((q: any) => q.text).filter(Boolean);

    return apiSuccess({
      sections: sections && sections.length > 0 ? sections : defaultSections,
      flagged: sortedTopics.slice(0, 5),
      recentQuestions: recentQuestions.length > 0 ? recentQuestions : [
        'Why does my recursive function never stop?',
        'What is the difference between a process and a thread?',
      ],
    });
  } catch (err: any) {
    return apiError(err?.message || 'Failed to fetch faculty dashboard.', 500);
  }
}
