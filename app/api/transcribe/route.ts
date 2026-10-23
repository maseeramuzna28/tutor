// POST /api/transcribe - Audio speech-to-text
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/errors';
import { transcribeAudio } from '@/lib/voice/speech';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let audioBuffer: Buffer | null = null;
    let mimeType = 'audio/webm';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('audio') || formData.get('file');

      if (!file || typeof file === 'string') {
        return apiError('Missing audio file in multipart form under "audio" or "file" field.', 400);
      }

      const fileObj = file as File;
      mimeType = fileObj.type || 'audio/webm';
      const arrayBuffer = await fileObj.arrayBuffer();
      audioBuffer = Buffer.from(arrayBuffer);
    } else if (contentType.includes('application/json')) {
      const body = await req.json();
      if (!body.audio) {
        return apiError('Missing "audio" base64 string in JSON payload.', 400);
      }
      audioBuffer = Buffer.from(body.audio, 'base64');
      if (body.mimeType) {
        mimeType = body.mimeType;
      }
    } else {
      return apiError('Unsupported Content-Type. Please use multipart/form-data or application/json.', 400);
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      return apiError('Audio payload is empty.', 400);
    }

    const result = await transcribeAudio(audioBuffer, mimeType);

    if (result.provider === 'browser_speech_fallback_required') {
      return apiSuccess({
        transcript: '',
        fallback: 'browser_web_speech',
        message: 'Gradium credentials not configured. Please use browser Web Speech API (webkitSpeechRecognition) on the frontend.',
      }, 200);
    }

    return apiSuccess({ transcript: result.transcript }, 200);
  } catch (err: any) {
    console.error('API /api/transcribe error:', err);
    return apiError(err?.message || 'Transcription failed.', 500);
  }
}
