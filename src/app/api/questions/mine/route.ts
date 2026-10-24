// GET /api/questions/mine - Return only the authenticated user's question history
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { getAuthContext } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return apiError('Unauthorized. Please log in to view your question history.', 401);
    }

    const admin = createAdminClient();

    const { data: questions, error } = await admin
      .from('questions')
      .select('*')
      .eq('author_id', auth.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch user questions:', error);
      return apiError('Failed to fetch your questions.', 500);
    }

    return apiSuccess({ questions: questions || [] }, 200);
  } catch (err: any) {
    console.error('API /api/questions/mine error:', err);
    return apiError(err?.message || 'Server error fetching questions.', 500);
  }
}
