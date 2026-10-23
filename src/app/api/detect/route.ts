// Intent classification and answer generation now share the single /api/solve request.
import { NextRequest } from 'next/server';
import { apiError } from '@/lib/errors';

export async function POST(_req: NextRequest) {
  return apiError('Intent detection is included in the /api/solve response.', 410);
}
