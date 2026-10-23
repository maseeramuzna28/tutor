// GET /api/dashboard/student
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthContext } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    const admin = createAdminClient();

    const [
      { data: doubts },
      { data: lessons },
      { data: topics },
      { data: posts },
    ] = await Promise.all([
      admin.from('questions').select('*').limit(5),
      admin.from('lessons').select('*').limit(5),
      admin.from('topics').select('*'),
      admin.from('posts').select('*').limit(1),
    ]);

    const user = {
      id: auth?.user?.id || 'demo_student',
      name: auth?.profile?.display_name || 'Demo Student',
      role: 'student' as const,
      college: auth?.profile?.college || 'Demo College of Engineering',
      department: 'Computer Science',
      year: '2nd year',
      bio: '',
      anonymousByDefault: false,
      notifyEmail: true,
      notifyPulse: true,
    };

    const sortedTopics = [...(topics || [])].sort((a: any, b: any) => (b.heat || 0) - (a.heat || 0));
    const topFlagged = sortedTopics[0] || { id: 't1', name: 'Recursion', heat: 62 };

    const formattedDoubts = (doubts || []).map((d: any) => ({
      id: d.id,
      question: d.text || d.question,
      createdAt: d.created_at || d.createdAt || new Date().toISOString(),
      status: d.resolution_status || d.status || 'answered',
    }));

    const suggestedLesson = (lessons || []).find((l: any) => !l.completed) || (lessons || [])[0] || {
      id: 'l1',
      title: 'Recursion in four steps',
      concept: 'Recursion',
      minutes: 6,
      completed: false,
      steps: [],
    };

    const latestPost = (posts || [])[0] || {
      id: 'p1',
      author: 'Anonymous',
      anonymous: true,
      tag: 'Question',
      body: 'Is a stack overflow in recursion always caused by a missing base case, or can the input just be too deep?',
      createdAt: new Date().toISOString(),
      upvotes: 12,
      upvoted: false,
      replies: [],
    };

    return apiSuccess({
      user,
      openDoubts: formattedDoubts.slice(0, 3),
      suggestedLesson,
      topFlagged,
      points: auth?.profile?.points ?? 240,
      streak: 4,
      latestPost,
    });
  } catch (err: any) {
    return apiError(err?.message || 'Failed to fetch student dashboard.', 500);
  }
}
