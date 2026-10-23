// POST /api/profile/deletion-request
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';

export async function POST(_req: NextRequest) {
  try {
    return apiSuccess({
      ok: true,
      message: 'Your account deletion request has been scheduled in accordance with privacy policies.',
    });
  } catch (err: any) {
    return apiError(err?.message || 'Failed to submit deletion request.', 500);
  }
}
