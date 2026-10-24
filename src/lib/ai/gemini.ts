import { GoogleGenAI } from '@google/genai';
import {
  SolveRequest,
  SolveResponse,
  QuestionStep,
  TutorIntent,
  LearningSolveResponse,
  SocraticChatRequest,
  SocraticChatResponse,
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
}
`;

export const SOCRATIC_SYSTEM_INSTRUCTION = `You are TUTO, a world-class, engaging, interactive Socratic academic tutor specializing in Data Structures and Algorithms (DSA) and collegiate STEM concepts.

CRITICAL TEACHING PRINCIPLES:
1. You are an INTERACTIVE TEACHER, NOT a lecturer and NOT a flat audio text-reader reciting an encyclopedia.
2. Teach in small steps: Explain ONE concept at a time using simple, student-friendly language. NEVER dump an entire lecture or multi-step solution in one message.
3. Use Socratic teaching: Ask short questions, give hints, and guide the student toward the answer instead of immediately revealing everything.
4. Make sessions interactive: After explaining a concept, ask a quick question such as "Why do you think this works?", "What do you think happens next?", or a targeted conceptual/numerical check.
5. Adapt dynamically to the student's actual response:
   - IF CORRECT: Enthusiastically acknowledge WHY their reasoning is correct, present the next small concept step, and ask the next question.
   - IF WRONG: Kindly identify the specific misconception without judgment, explain why that thought arises, offer a clear hint, and re-explain from another angle.
   - IF CONFUSED ("I don't understand", "I'm confused", "I don't know"): Simplify further, provide a vivid everyday analogy (e.g., dictionary, card deck, cafeteria trays, flashlight in a maze), break it down, and ask a simpler checkpoint question.
6. DSA Focus:
   - Anchor explanations with concrete DSA examples: small dry runs, arrays (e.g. [2, 5, 8, 12, 16]), pointer updates (low, mid, high), call stack frames, or compact code/pseudocode (under 8 lines).
7. Conversational Voice Delivery:
   - "spoken_text" MUST be punchy, warm, natural, and under 50 words.
   - NEVER read raw code, markdown, or LaTeX symbols word for word.
   - Speak naturally with conversational signposts ("Let's see what happens here", "Notice the middle item:").
   - Crucial: "spoken_text" MUST end with the question so the voice pauses naturally for the student to speak or respond.
8. Teaching Structure:
   - Introduce the concept briefly with an everyday hook.
   - Explain one small part with an example.
   - Ask the student a question.
   - Respond based on their answer.
   - Continue step by step.
   - Finish with a quick understanding check and congratulatory summary when complete.

OUTPUT FORMAT: Return ONLY a valid JSON object matching this schema:
{
  "feedback": "Warm, encouraging evaluation of student's response (or welcoming intro if turn 1)",
  "explanation": "Bite-sized pedagogical explanation for this step (1-2 clear paragraphs)",
  "code_snippet": "Optional concise code snippet, dry run, or trace (e.g. python/pseudocode/array)",
  "check_question": "Single focused Socratic question for the student to answer next",
  "spoken_text": "Short conversational voice script (under 50 words) that asks the question and pauses",
  "sessionState": {
    "concept": "Concept name",
    "step_index": 1,
    "total_steps": 4,
    "is_complete": false,
    "mastered_points": ["Key concept mastered so far"]
  },
  "quick_replies": ["Suggested Answer 1", "Suggested Answer 2", "I don't understand"]
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

  const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
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

  const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
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

  const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
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
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
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

export function parseSocraticResponse(responseText: string): SocraticChatResponse {
  let cleaned = responseText.trim();
  // Extract JSON object if surrounded by markdown or commentary
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  } else {
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/i, '').replace(/```\s*$/i, '');
    }
  }

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('Gemini returned an invalid JSON Socratic response.');
  }

  if (!isRecord(parsed)) {
    throw new Error('Gemini returned a non-object Socratic response.');
  }

  const feedback = typeof parsed.feedback === 'string' && parsed.feedback.trim().length > 0
    ? parsed.feedback.trim()
    : 'Great point!';
  const explanation = typeof parsed.explanation === 'string' && parsed.explanation.trim().length > 0
    ? parsed.explanation.trim()
    : 'Let us break this down step by step.';
  const check_question = typeof parsed.check_question === 'string' && parsed.check_question.trim().length > 0
    ? parsed.check_question.trim()
    : 'What do you think happens next?';
  const code_snippet = typeof parsed.code_snippet === 'string' && parsed.code_snippet.trim().length > 0
    ? parsed.code_snippet.trim()
    : undefined;

  let spoken_text = typeof parsed.spoken_text === 'string' ? parsed.spoken_text.trim() : '';
  if (!spoken_text) {
    spoken_text = `${feedback} ${check_question}`.slice(0, 200);
  }

  const rawState = isRecord(parsed.sessionState) ? parsed.sessionState : {};
  const concept = typeof rawState.concept === 'string' && rawState.concept.trim().length > 0
    ? rawState.concept.trim()
    : 'Data Structures & Algorithms';
  const step_index = typeof rawState.step_index === 'number' && Number.isInteger(rawState.step_index)
    ? Math.max(1, rawState.step_index)
    : 1;
  const total_steps = typeof rawState.total_steps === 'number' && Number.isInteger(rawState.total_steps)
    ? Math.max(step_index, rawState.total_steps)
    : 4;
  const is_complete = Boolean(rawState.is_complete || step_index >= total_steps);
  const mastered_points = Array.isArray(rawState.mastered_points)
    ? rawState.mastered_points.filter((p: unknown) => typeof p === 'string' && p.trim().length > 0)
    : [];

  let quick_replies: string[] = Array.isArray(parsed.quick_replies)
    ? parsed.quick_replies.filter((r: unknown) => typeof r === 'string' && r.trim().length > 0).slice(0, 4)
    : [];
  if (quick_replies.length === 0) {
    quick_replies = ['I understand, next step!', 'Could you explain simpler?', "I don't know"];
  }

  return {
    feedback,
    explanation,
    code_snippet,
    check_question,
    spoken_text,
    sessionState: {
      concept,
      step_index,
      total_steps,
      is_complete,
      mastered_points,
    },
    quick_replies,
  };
}

export async function interactiveSocraticChat(input: SocraticChatRequest): Promise<SocraticChatResponse> {
  const message = typeof input?.message === 'string' ? input.message.trim() : '';
  if (!message || message.length > 2000) {
    throw new Error('Message must be between 1 and 2000 characters.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('your-')) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  const historyText = (input.conversation || [])
    .slice(-8)
    .map((turn) => `${turn.role === 'user' ? 'Student' : 'Tutor'}: ${turn.content}`)
    .join('\n');

  const stateContext = input.sessionState ? `
Session Tracking:
- Target Concept: ${input.sessionState.concept || 'Data Structures & Algorithms'}
- Current Step: ${input.sessionState.step_index || 1} of ${input.sessionState.total_steps || 4}
- Pending Question previously asked to student: "${input.sessionState.pending_question || 'None'}"
- Mastered points so far: ${(input.sessionState.mastered_points || []).join('; ') || 'None'}
` : '';

  const prompt = `${historyText ? `Recent Dialogue:\n${historyText}\n\n` : ''}${stateContext}
Student's latest reply:
"${message}"

Evaluate the student's response Socratically:
1. Did they answer the pending question correctly, incorrectly, or express confusion ("I don't understand")?
2. Acknowledge their response explicitly in "feedback".
3. Teach ONE bite-sized step with a DSA example/dry-run/analogy.
4. Ask ONE focused question that invites the next response.
5. Provide a short "spoken_text" (under 50 words) that finishes by asking the question so the voice pauses naturally.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: SOCRATIC_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        maxOutputTokens: 1500,
        temperature: 0.35,
        abortSignal: controller.signal,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Gemini returned an empty Socratic response.');
    }

    return parseSocraticResponse(responseText);
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('Gemini Socratic tutor timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

