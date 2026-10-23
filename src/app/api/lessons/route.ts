// GET & POST /api/lessons - Micro-Lesson Bot
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { createAdminClient } from '@/lib/supabase/admin';
import { tutoEngine } from '@/lib/ai/tutoEngine';

export async function GET(_req: NextRequest) {
  try {
    const admin = createAdminClient();
    const { data: lessons } = await admin.from('lessons').select('*');

    const defaultLessons = [
      {
        id: 'l1',
        title: 'Recursion in four steps',
        concept: 'Recursion',
        minutes: 6,
        completed: false,
        steps: [
          { title: 'Find the base case', body: 'Every recursive function needs a case it can answer without calling itself. Write that first.' },
          { title: 'Shrink the problem', body: 'Each call must move toward the base case, for example by passing n minus 1.' },
          { title: 'Trust the call', body: 'Assume the recursive call returns the right answer for the smaller input, then use it to build your answer.' },
          { title: 'Trace a small input', body: 'Walk factorial of 3 by hand: 3 times factorial of 2, then 2 times factorial of 1, then 1 times factorial of 0, which is 1.' },
        ],
      },
      {
        id: 'l2',
        title: 'Pointers without panic',
        concept: 'Pointers',
        minutes: 7,
        completed: false,
        steps: [
          { title: 'A pointer stores an address', body: 'A variable holds a value. A pointer holds the memory address where a value lives.' },
          { title: 'Dereference to reach the value', body: 'Using the pointer with the star operator reads or writes the value at that address.' },
          { title: 'Pass an address to change the original', body: 'Passing a pointer to a function lets it modify the caller\'s variable instead of a copy.' },
          { title: 'Avoid null and dangling pointers', body: 'Check for null before dereferencing, and never use a pointer after the memory it points to has been freed.' },
        ],
      },
      {
        id: 'l3',
        title: 'Reading Big O',
        concept: 'Big O',
        minutes: 5,
        completed: false,
        steps: [
          { title: 'Count the basic steps', body: 'Count how many basic operations the algorithm does as the input size n grows.' },
          { title: 'Ignore constants', body: 'Doing 3n steps and doing n steps grow the same way, so both are O of n.' },
          { title: 'Keep the fastest growing term', body: 'n squared plus n is O of n squared, because the squared term dominates for large n.' },
          { title: 'Compare growth rates', body: 'From slowest to fastest growth: constant, logarithmic, linear, n log n, quadratic, exponential.' },
        ],
      },
    ];

    const result = lessons && lessons.length > 0 ? lessons : defaultLessons;
    return apiSuccess(result);
  } catch (err: any) {
    return apiError(err?.message || 'Failed to fetch lessons.', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError('Invalid JSON request body.', 400);
    }

    const concept = typeof body?.concept === 'string' ? body.concept.trim() : '';
    if (!concept) {
      return apiError('concept is required.', 400);
    }

    const rootCause = typeof body?.root_cause === 'string' ? body.root_cause.trim() : undefined;
    const lesson = await tutoEngine.generateMicroLesson(concept, rootCause);

    return apiSuccess(lesson, 201);
  } catch (err: any) {
    console.error('API POST /api/lessons error:', err);
    return apiError(err?.message || 'Failed to generate micro-lesson.', 500);
  }
}
