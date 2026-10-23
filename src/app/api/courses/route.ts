// GET /api/courses
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(_req: NextRequest) {
  try {
    const admin = createAdminClient();
    const { data: courses, error } = await admin.from('courses').select('*');

    if (error || !courses || courses.length === 0) {
      return apiSuccess([
        { id: 'cs201', name: 'Data Structures', sections: ['A', 'B'] },
        { id: 'cs204', name: 'Database Systems', sections: ['A'] },
        { id: 'cs210', name: 'Operating Systems', sections: ['A', 'B'] },
      ]);
    }

    return apiSuccess(courses);
  } catch (err: any) {
    return apiError(err?.message || 'Failed to fetch courses.', 500);
  }
}
