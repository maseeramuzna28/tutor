// Google Gemini Root-Cause Tutor Service
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SolveRequest, SolveResponse, QuestionStep } from '../types/database';

const SYSTEM_INSTRUCTION = `You are TUTO, a world-class, empathetic Root-Cause Academic AI Tutor for college students in India.
Your mission:
1. Explain academic problems step by step with crystal clarity, breaking down complex ideas.
2. Identify the MAIN CONCEPT being tested.
3. Identify the ROOT CAUSE: the likely prerequisite gap or misconception that typically makes students stumble on this problem. (Always frame it respectfully as a "Likely prerequisite gap").
4. Provide a SHORT REFRESHER explaining that prerequisite concept in 2-3 sentences.
5. Provide a CONCISE SPOKEN ANSWER (1-3 sentences) designed to be read out loud via text-to-speech.
6. Format math expressions using KaTeX syntax: inline with $...$ or display with $$...$$.
7. Format programming code using markdown code blocks with language specifiers.
8. Support subjects across Mathematics, Computer Science, Electrical/Mechanical Engineering, Economics, Biology, Physics, Chemistry, Law, and Medicine.

RESPONSE FORMAT:
You MUST respond ONLY with a valid JSON object matching this schema:
{
  "spoken_answer": "A friendly 1-3 sentence summary suitable for audio playback",
  "concept": "The primary topic or principle (e.g., 'Integration by Parts', 'Deadlock Detection in OS', 'Marginal Cost vs Average Cost')",
  "root_cause": "Likely prerequisite gap (e.g., 'Product Rule of Differentiation', 'Resource Allocation Graph cycles', 'Derivative of Total Cost')",
  "refresher": "A quick 2-3 sentence refresher on that prerequisite foundation",
  "subject": "Primary academic domain (e.g. 'Mathematics', 'Computer Science', 'Economics', 'Medicine', 'Law')",
  "steps": [
    {
      "step": 1,
      "title": "Title for this step",
      "explanation": "Detailed explanation using KaTeX math or formatted text",
      "equation_or_code": "Optional math equation or code snippet"
    }
  ]
}`;

export async function solveAcademicDoubt(input: SolveRequest, overrideApiKey?: string | null): Promise<SolveResponse> {
  const apiKey = overrideApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your-gemini-api-key') {
    throw new Error('GEMINI_API_KEY is not configured in the server environment. Please set GEMINI_API_KEY in your .env.local file.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Default to gemini-1.5-flash or gemini-2.0-flash for high quality and speed
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  let stylePrompt = '';
  if (input.style === 'simpler') {
    stylePrompt = '\n\nIMPORTANT: The student is still stuck. Provide a SIMPLER explanation using plain language, intuitive step-by-step reasoning, and breakdown of elementary terms.';
  } else if (input.style === 'analogy') {
    stylePrompt = '\n\nIMPORTANT: Explain this concept using an everyday, intuitive ANALOGY that any college student can relate to, followed by the technical steps.';
  } else if (input.style === 'worked_example') {
    stylePrompt = '\n\nIMPORTANT: Provide a complete, concrete WORKED EXAMPLE with numbers or a complete runnable code snippet showing each intermediate calculation.';
  }

  const prompt = `Student Question / Academic Doubt:\n"${input.question}"${stylePrompt}`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    if (!responseText) {
      throw new Error('Gemini returned an empty response.');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch (parseError) {
      // Clean up markdown block if present
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    // Validate structured fields
    const steps: QuestionStep[] = Array.isArray(parsed.steps)
      ? parsed.steps.map((s: any, idx: number) => ({
          step: s.step || idx + 1,
          title: s.title || `Step ${idx + 1}`,
          explanation: s.explanation || '',
          equation_or_code: s.equation_or_code || undefined,
        }))
      : [];

    const isMedicalOrLegal =
      (parsed.subject && (parsed.subject.toLowerCase().includes('med') || parsed.subject.toLowerCase().includes('law'))) ||
      input.question.toLowerCase().includes('medicine') ||
      input.question.toLowerCase().includes('symptom') ||
      input.question.toLowerCase().includes('legal') ||
      input.question.toLowerCase().includes('statute');

    const disclaimer = isMedicalOrLegal
      ? 'Learning aid only. Not professional medical or legal advice.'
      : 'AI-generated academic explanation. Verify key proofs and steps with course material.';

    return {
      spoken_answer: parsed.spoken_answer || 'Here is the step-by-step breakdown of your doubt.',
      concept: parsed.concept || 'Academic Concept',
      root_cause: parsed.root_cause || 'Foundational prerequisite review',
      refresher: parsed.refresher || 'Review foundational definitions and formulas.',
      subject: parsed.subject || 'General Academics',
      steps,
      disclaimer,
    };
  } catch (error: any) {
    console.error('Error invoking Gemini tutor:', error);
    throw error;
  }
}
