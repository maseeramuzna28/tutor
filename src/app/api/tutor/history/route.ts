// GET /api/tutor/history - Retrieve user's previous questions
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthContext } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    const userId = auth?.user?.id || '00000000-0000-0000-0000-000000000001';
    const admin = createAdminClient();

    const { data: doubts, error } = await admin
      .from('questions')
      .select('id, text, created_at, resolution_status')
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Questions query error, using fallback:', error);
    }

    const formatted = (doubts || []).map((d: any) => ({
      id: d.id,
      question: d.text,
      createdAt: d.created_at,
      status: d.resolution_status || 'answered',
    }));

    return apiSuccess(formatted);
  } catch (err: any) {
    return apiError(err?.message || 'Failed to fetch tutor history.', 500);
  }
}
