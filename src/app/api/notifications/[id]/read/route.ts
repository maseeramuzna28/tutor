// POST /api/notifications/[id]/read
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

    await admin.from('notifications').update({ read: true }).eq('id', id);

    return apiSuccess({ id });
  } catch (err: any) {
    return apiError(err?.message || 'Failed to mark notification read.', 500);
  }
}
