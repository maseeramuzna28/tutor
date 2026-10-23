// POST /api/projects/[id]/interest
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = createAdminClient();

    await admin.from('projects').update({ interested: true }).eq('id', id);

    return apiSuccess({ id, interested: true });
  } catch (err: any) {
    return apiError(err?.message || 'Failed to express interest.', 500);
  }
}
