// POST /api/transcribe is retired: recognition now runs in the browser.
import { NextRequest } from 'next/server';
import { apiError } from '@/lib/errors';

export async function POST(_req: NextRequest) {
  return apiError('Speech recognition is handled by the browser. Use SpeechRecognition or type your doubt.', 410);
}
