import { GoogleGenAI } from '@google/genai';
import {
  SolveRequest,
  SolveResponse,
  QuestionStep,
  TutorIntent,
  LearningSolveResponse,
} from '../types/database';

const SYSTEM_INSTRUCTION = `You are TUTO, an empathetic academic tutor for college students in India.
For every user message, first classify its intent as exactly one of: question, learning_request, greeting, acknowledgement, clarification, unrelated.
Use the recent conversation context to resolve follow-ups such as "explain that with an example". Do not treat an unrelated message as an academic request.
Reply naturally and concisely to greetings and acknowledgements. Ask a short helpful follow-up for unrelated messages, without pretending they are academic questions.
For question, learning_request, and clarification intents, explain accurately and step by step. Identify the primary concept and likely prerequisite gap; include an example when useful.
Format mathematics with KaTeX-compatible LaTeX ($...$ or $$...$$) and code in fenced markdown blocks.
Support Mathematics, Computer Science, Engineering, Economics, Biology, Physics, Chemistry, Law, and Medicine.
Treat medical and legal questions as educational only, not professional advice.
Return only a JSON object with this shape:
{
  "intent": "one of the six intent labels",
  "topic": "Short topic label, or empty string if not applicable",
  "response": "The user-facing response; concise conversational reply for non-academic intents, answer summary for learning intents",
  "concept": "Primary concept for academic intents, otherwise empty string",
  "root_cause": "Likely prerequisite gap for academic intents, otherwise empty string",
  "refresher": "Short refresher for academic intents, otherwise empty string",
  "subject": "Primary academic domain for academic intents, otherwise empty string",
  "steps": [
    {
      "step": 1,
      "title": "Title for this step",
      "explanation": "Detailed explanation",
      "equation_or_code": "Optional math equation or code snippet"
    }
  ]
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
    };
  });

  const subject = requiredText(parsed.subject, 'subject');
  const isMedicalOrLegal = /medicine|medical|symptom|legal|law|statute/i.test(`${subject} ${question}`);
  const learningResponse: LearningSolveResponse = {
    intent,
    topic,
    response,
    spoken_answer: response,
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
  if (!apiKey) {
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
