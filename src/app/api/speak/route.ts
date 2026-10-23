// POST /api/speak is retired: speech synthesis now runs in the browser.
import { NextRequest } from 'next/server';
import { apiError } from '@/lib/errors';

export async function POST(_req: NextRequest) {
  return apiError('Speech synthesis is handled by the browser. Use window.speechSynthesis.', 410);
}
