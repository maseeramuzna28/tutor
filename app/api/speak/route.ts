// POST /api/speak - Text to Speech
import { NextRequest, NextResponse } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { synthesizeSpeech } from '@/lib/voice/speech';

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return apiError('Invalid JSON request body. Expected { text: string }.', 400);
    }

    if (!body || typeof body.text !== 'string' || body.text.trim().length === 0) {
      return apiError('The "text" field is required.', 400);
    }

    const result = await synthesizeSpeech(body.text);

    if (result.audioBuffer) {
      return new NextResponse(result.audioBuffer, {
        status: 200,
        headers: {
          'Content-Type': result.contentType || 'audio/mpeg',
          'Content-Length': result.audioBuffer.length.toString(),
        },
      });
    }

    // Fallback indicator for frontend browser speech synthesis (window.speechSynthesis)
    return apiSuccess({
      fallback: 'browser_speech_synthesis',
      text: body.text,
      message: 'Gradium credentials not configured. Please use browser speech synthesis API (window.speechSynthesis).',
    }, 200);
  } catch (err: any) {
    console.error('API /api/speak error:', err);
    return apiError(err?.message || 'Text-to-speech failed.', 500);
  }
}
