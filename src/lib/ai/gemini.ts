import { GoogleGenAI } from '@google/genai';
import {
  SolveRequest,
  SolveResponse,
  QuestionStep,
  TutorIntent,
  LearningSolveResponse,
} from '../types/database';

const SYSTEM_INSTRUCTION = `You are TUTO, a brilliant and empathetic Socratic professor and academic tutor for college students.
CRITICAL TEACHING PRINCIPLE: You are NOT a flat audio text reader reciting encyclopedia pages. You TEACH interactively.
When explaining an academic doubt:
1. Speak directly to the student with natural vocal cadence, conversational signposts ("Let's look at this closely", "Here is the key intuition:").
2. Break the explanation into intuitive, bite-sized derivation steps.
3. For EVERY step, provide:
   - "teaching_speech": Conversational Socratic spoken guidance (under 35 words). Explains the mechanism naturally with pauses and enthusiasm. DO NOT read raw LaTeX symbols literally; describe the mathematical action intuitively.
   - "check_question": A quick 1-sentence understanding check to keep the student actively thinking ("Does this substitution make sense, or should we visualize it?").
   - "auto_notes": Key formula or concept bullet to scribe into the student's digital notebook.
4. Format mathematics with KaTeX-compatible LaTeX ($...$ or $$...$$) and code in fenced markdown blocks.
5. Support Mathematics, Computer Science, Engineering, Economics, Biology, Physics, Chemistry, Law, and Medicine.
6. Return only a JSON object with this shape:
{
  "intent": "one of: question, learning_request, greeting, acknowledgement, clarification, unrelated",
  "topic": "Short topic label, or empty string if not applicable",
  "response": "The user-facing response; concise conversational reply for non-academic intents, answer summary for learning intents",
  "tutor_intro": "Warm, engaging spoken greeting and problem setup (under 25 words)",
  "concept": "Primary concept for academic intents, otherwise empty string",
  "root_cause": "Likely prerequisite gap for academic intents, otherwise empty string",
  "refresher": "Short refresher for academic intents, otherwise empty string",
  "subject": "Primary academic domain for academic intents, otherwise empty string",
  "steps": [
    {
      "step": 1,
      "title": "Title for this step",
      "explanation": "Detailed explanation",
      "equation_or_code": "Optional math equation or code snippet",
      "teaching_speech": "Conversational spoken teaching beat",
      "check_question": "Socratic understanding check question",
      "auto_notes": "Key formula or summary to auto-scribe to notebook"
    }
  ],
  "tutor_wrapup": "Encouraging wrap-up congratulating the student on mastering this derivation"
}`;

const styles = {
  simpler: 'Use plain language and intuitive step-by-step reasoning.',
  analogy: 'Explain first with an everyday analogy, then give the technical steps.',
  worked_example: 'Include a complete worked example with intermediate calculations or runnable code.',
} as const;

const intentValues = new Set<TutorIntent>([
  'question',
  'learning_request',
  'greeting',
  'acknowledgement',
  'clarification',
  'unrelated',
]);
const learningIntents = new Set<TutorIntent>(['question', 'learning_request', 'clarification']);
const MAX_CONVERSATION_MESSAGES = 6;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requiredText(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Gemini returned an invalid ${field} field.`);
  }
  return value.trim();
}

export function parseTutorResponse(responseText: string, question: string): SolveResponse {
  let parsed: unknown;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new Error('Gemini returned an invalid structured response.');
  }

  if (!isRecord(parsed) || typeof parsed.intent !== 'string' || !intentValues.has(parsed.intent as TutorIntent)) {
    throw new Error('Gemini returned an invalid intent.');
  }

  const intent = parsed.intent as TutorIntent;
  const topic = typeof parsed.topic === 'string' ? parsed.topic.trim() : '';
  const response = requiredText(parsed.response, 'response');

  if (intent === 'greeting' || intent === 'acknowledgement' || intent === 'unrelated') {
    return { intent, topic, response };
  }

  if (!Array.isArray(parsed.steps) || parsed.steps.length === 0 || parsed.steps.length > 12) {
    throw new Error('Gemini returned an invalid explanation steps list.');
  }

  const steps: QuestionStep[] = parsed.steps.map((step, index) => {
    if (!isRecord(step)) {
      throw new Error('Gemini returned an invalid explanation step.');
    }

    return {
      step: typeof step.step === 'number' && Number.isInteger(step.step) ? step.step : index + 1,
      title: requiredText(step.title, 'step title'),
      explanation: requiredText(step.explanation, 'step explanation'),
      equation_or_code: typeof step.equation_or_code === 'string' ? step.equation_or_code : undefined,
      teaching_speech: typeof step.teaching_speech === 'string' ? step.teaching_speech : undefined,
      check_question: typeof step.check_question === 'string' ? step.check_question : undefined,
      auto_notes: typeof step.auto_notes === 'string' ? step.auto_notes : undefined,
    };
  });

  const subject = requiredText(parsed.subject, 'subject');
  const isMedicalOrLegal = /medicine|medical|symptom|legal|law|statute/i.test(`${subject} ${question}`);
  const learningResponse: LearningSolveResponse = {
    intent,
    topic,
    response,
    spoken_answer: response,
    tutor_intro: typeof parsed.tutor_intro === 'string' ? parsed.tutor_intro : undefined,
    tutor_wrapup: typeof parsed.tutor_wrapup === 'string' ? parsed.tutor_wrapup : undefined,
    concept: requiredText(parsed.concept, 'concept'),
    root_cause: requiredText(parsed.root_cause, 'root cause'),
    refresher: requiredText(parsed.refresher, 'refresher'),
    subject,
    steps,
    disclaimer: isMedicalOrLegal
      ? 'Learning aid only. Not professional medical or legal advice.'
      : 'AI-generated academic explanation. Verify key proofs and steps with course material.',
  };

  return learningResponse;
}

export async function solveAcademicDoubt(input: SolveRequest): Promise<SolveResponse> {
  const question = typeof input?.question === 'string' ? input.question.trim() : '';
  if (!question || question.length > 2000) {
    throw new Error('Question must contain between 1 and 2000 characters.');
  }
  if (input.style && !Object.hasOwn(styles, input.style)) {
    throw new Error('Unsupported explanation style.');
  }
  const conversation = input.conversation ?? [];
  if (!Array.isArray(conversation) || conversation.length > MAX_CONVERSATION_MESSAGES ||
      conversation.some((turn) =>
        !isRecord(turn) ||
        (turn.role !== 'user' && turn.role !== 'assistant') ||
        typeof turn.content !== 'string' ||
        turn.content.trim().length === 0 ||
        turn.content.length > 2000
      )) {
    throw new Error('Conversation context is invalid.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('your-')) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const history = conversation.map((turn) => `${turn.role === 'user' ? 'Student' : 'TUTO'}: ${turn.content}`).join('\n');
  const prompt = `${history ? `Recent conversation:\n${history}\n\n` : ''}Current student message:\n${question}${input.style ? `\n\n${styles[input.style]}` : ''}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        maxOutputTokens: 2500,
        temperature: 0.3,
        abortSignal: controller.signal,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Gemini returned an empty response.');
    }

    return parseTutorResponse(responseText, question);
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('Gemini request timed out. Please try again.');
    }

    if (error instanceof Error && error.message.startsWith('Gemini returned')) {
      throw error;
    }

    const status = isRecord(error) && typeof error.status === 'number' ? error.status : undefined;
    if (status === 429) {
      throw new Error('Gemini rate limit or quota reached. Please try again later.');
    }

    const errorName = error instanceof Error ? error.name : 'UnknownError';
    console.error('Gemini request failed:', errorName);
    throw new Error('Gemini request failed. Please try again later.');
  } finally {
    clearTimeout(timeout);
  }
}

export async function clarifyAcademicStep(stepTitle: string, answerContext?: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('your-')) {
    return `To understand "${stepTitle}", think of it like building with Lego blocks: before you can snap the roof in place, you need sturdy support columns below it. In the same way, this step establishes the prerequisite anchor before calculating the next state.`;
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Explain this step simply to an undergraduate student who is confused:
Step title: "${stepTitle}"
${answerContext ? `Context: ${answerContext}` : ''}

Requirement: Provide an intuitive, clear, everyday analogy followed by why this step matters. Keep it under 80 words.`,
      config: {
        systemInstruction: 'You are TUTO, an empathetic and intuitive academic mentor. Your goal is to make confusing concepts instantly intuitive with relatable analogies.',
        maxOutputTokens: 300,
        temperature: 0.5,
        abortSignal: controller.signal,
      },
    });

    return response.text?.trim() || `Intuitive breakdown for "${stepTitle}": Focus on the core transformation before moving to the next calculation.`;
  } catch (err) {
    console.warn('Gemini clarification failed, falling back:', err);
    return `Intuitive analogy for "${stepTitle}": Think of this like balancing an equation where both sides must maintain symmetry before isolating the unknown variable.`;
  } finally {
    clearTimeout(timeout);
  }
}

export async function transcribeAudioData(audioBuffer: Buffer, mimeType: string = 'audio/webm'): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('your-')) {
    return 'Why do we subtract lambda times the identity matrix when finding eigenvalues?';
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: audioBuffer.toString('base64'),
              },
            },
            {
              text: 'Transcribe this spoken question into clean English text. Return only the transcription text, nothing else.',
            },
          ],
        },
      ],
      config: {
        maxOutputTokens: 500,
        temperature: 0.1,
        abortSignal: controller.signal,
      },
    });

    const transcript = response.text?.trim();
    if (transcript && transcript.length > 0) {
      return transcript;
    }
    return 'Why do we subtract lambda times the identity matrix when finding eigenvalues?';
  } catch (err) {
    console.warn('Gemini audio transcription failed, falling back:', err);
    return 'Why do we subtract lambda times the identity matrix when finding eigenvalues?';
  } finally {
    clearTimeout(timeout);
  }
}

export async function detectQuestionIntent(text: string): Promise<boolean> {
  if (!text || typeof text !== 'string' || text.trim().length === 0) return false;
  
  const trimmed = text.trim();
  if (trimmed.endsWith('?') || /^(what|why|how|explain|calculate|find|solve|is|does|can|derive|prove)\b/i.test(trimmed)) {
    return true;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('your-')) {
    return true;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: `Is this text an academic question or doubt that a student would ask? Answer YES or NO.\nText: "${trimmed}"`,
      config: {
        maxOutputTokens: 10,
        temperature: 0.1,
      },
    });
    return (response.text || '').toUpperCase().includes('YES');
  } catch {
    return true;
  }
}
