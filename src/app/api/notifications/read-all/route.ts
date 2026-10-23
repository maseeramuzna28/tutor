// POST /api/notifications/read-all
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role') || 'student';
    const admin = createAdminClient();

    const { data: list } = await admin.from('notifications').select('*');
    if (list) {
      for (const item of list) {
        if (!item.audience || item.audience === role) {
          await admin.from('notifications').update({ read: true }).eq('id', item.id);
        }
      }
    }

    return apiSuccess({ ok: true });
  } catch (err: any) {
    return apiError(err?.message || 'Failed to mark all notifications read.', 500);
  }
}
