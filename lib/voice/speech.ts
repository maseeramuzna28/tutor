// Voice & Speech Services (Gradium, Jev Question Detection, Web Speech fallbacks)

export interface DetectQuestionResponse {
  isQuestion: boolean;
  confidence?: number;
  provider: 'jev' | 'heuristic_fallback';
}

/**
 * Question Detection via Jev API with fail-open fallback
 */
export async function detectQuestion(text: string): Promise<DetectQuestionResponse> {
  const jevApiKey = process.env.JEV_API_KEY;
  const jevUrl = process.env.JEV_API_URL || 'https://api.jev.ai/v1/detect';

  if (!text || text.trim().length === 0) {
    return { isQuestion: false, provider: 'heuristic_fallback' };
  }

  // If Jev API key is provided, attempt detection
  if (jevApiKey && jevApiKey !== 'your-jev-api-key') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

      const res = await fetch(jevUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jevApiKey}`,
        },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return {
          isQuestion: Boolean(data.isQuestion ?? true),
          confidence: data.confidence,
          provider: 'jev',
        };
      }
    } catch (err) {
      console.warn('Jev API request failed or timed out. Failing open.', err);
    }
  }

  // Fail open by treating as question if it contains question words, question marks, or academic phrases
  const cleaned = text.trim();
  const endsWithQuestionMark = cleaned.endsWith('?');
  const questionWords = ['what', 'why', 'how', 'when', 'where', 'which', 'who', 'whom', 'can', 'could', 'explain', 'solve', 'calculate', 'prove', 'derive', 'evaluate', 'difference', 'state'];
  const firstWord = cleaned.split(/\s+/)[0]?.toLowerCase();
  const startsWithQWord = questionWords.includes(firstWord);

  // Requirement: "If Jev fails, times out, or is unavailable, fail open by treating the input as a question."
  return {
    isQuestion: true,
    confidence: endsWithQuestionMark || startsWithQWord ? 0.95 : 0.85,
    provider: 'heuristic_fallback',
  };
}

/**
 * Transcribe Audio via Gradium API with documented Web Speech fallback
 */
export async function transcribeAudio(audioBuffer: Buffer, mimeType: string = 'audio/webm'): Promise<{ transcript: string; provider: string }> {
  const gradiumApiKey = process.env.GRADIUM_API_KEY;
  const gradiumUrl = process.env.GRADIUM_API_URL || 'https://api.gradium.ai/v1/transcribe';

  if (gradiumApiKey && gradiumApiKey !== 'your-gradium-api-key') {
    try {
      const formData = new FormData();
      const blob = new Blob([audioBuffer], { type: mimeType });
      formData.append('file', blob, 'audio.webm');

      const res = await fetch(gradiumUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${gradiumApiKey}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        return {
          transcript: data.transcript || data.text || '',
          provider: 'gradium',
        };
      }
    } catch (err) {
      console.warn('Gradium transcription error. Falling back.', err);
    }
  }

  // If Gradium credentials are not configured, inform caller to use the browser Web Speech API (webkitSpeechRecognition)
  return {
    transcript: '',
    provider: 'browser_speech_fallback_required',
  };
}

/**
 * Text-to-Speech via Gradium API
 */
export async function synthesizeSpeech(text: string): Promise<{ audioBuffer?: Buffer; contentType?: string; fallbackToWebSpeech?: boolean }> {
  const gradiumApiKey = process.env.GRADIUM_API_KEY;
  const gradiumUrl = process.env.GRADIUM_API_URL || 'https://api.gradium.ai/v1/speak';

  if (gradiumApiKey && gradiumApiKey !== 'your-gradium-api-key') {
    try {
      const res = await fetch(gradiumUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${gradiumApiKey}`,
        },
        body: JSON.stringify({ text, voice: 'en-IN-female' }),
      });

      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        return {
          audioBuffer: Buffer.from(arrayBuf),
          contentType: res.headers.get('content-type') || 'audio/mpeg',
          fallbackToWebSpeech: false,
        };
      }
    } catch (err) {
      console.warn('Gradium TTS error. Falling back to Web Speech synthesis.', err);
    }
  }

  return {
    fallbackToWebSpeech: true,
  };
}
