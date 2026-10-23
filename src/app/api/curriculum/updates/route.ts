// GET & POST /api/curriculum/updates
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(_req: NextRequest) {
  try {
    const admin = createAdminClient();
    const { data: updates } = await admin
      .from('curriculum_updates')
      .select('*')
      .order('publishedAt', { ascending: false });

    const defaultUpdates = [
      {
        id: 'u1',
        title: 'Unit 3 now includes balanced trees',
        course: 'Data Structures',
        section: 'A',
        effective: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        body: 'AVL trees are added to Unit 3. Rotations will be covered in the lecture and assessed in the internal test.',
        publishedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
      },
      {
        id: 'u2',
        title: 'Lab schedule moved',
        course: 'Database Systems',
        section: 'A',
        effective: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
        body: 'The SQL lab moves from Thursday to Friday this week because of the seminar.',
        publishedAt: new Date(Date.now() - 72 * 3600000).toISOString(),
      },
    ];

    const list = updates && updates.length > 0 ? updates : defaultUpdates;
    return apiSuccess(list);
  } catch (err: any) {
    return apiError(err?.message || 'Failed to fetch curriculum updates.', 500);
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

    const { title, course, section, effective, body: updateBody } = body;
    if (!title || !course) {
      return apiError('Title and course are required.', 400);
    }

    const admin = createAdminClient();
    const updateId = crypto.randomUUID ? crypto.randomUUID() : `u-${Date.now()}`;

    const newUpdate = {
      id: updateId,
      title: title.trim(),
      course: course.trim(),
      section: section || 'A',
      effective: effective || new Date().toISOString().slice(0, 10),
      body: updateBody || '',
      publishedAt: new Date().toISOString(),
    };

    await admin.from('curriculum_updates').insert(newUpdate);

    return apiSuccess(newUpdate, 201);
  } catch (err: any) {
    return apiError(err?.message || 'Failed to publish curriculum update.', 500);
  }
}
