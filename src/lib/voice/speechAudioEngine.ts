// ============================================================================
// TUTO Acoustic Intelligence & Clear Speech Audio Engine
// Converts mathematical notation, LaTeX, code, and symbols into clear,
// natural spoken English. Selects natural voices (Siri / Samantha / Daniel),
// sets optimal speed (0.85-0.95x), inserts natural pauses, and prevents audio overlap.
// ============================================================================

export interface SpeakOptions {
  text: string;
  checkQuestion?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err?: any) => void;
  voice?: SpeechSynthesisVoice | null;
}

/**
 * Converts mathematical formulas, Big-O notations, fractions, exponents,
 * code snippets, and markdown symbols into crystal-clear spoken English.
 */
export function verbalizeMathForSpeech(rawText: string): string {
  if (!rawText || typeof rawText !== "string") return "";

  let s = rawText;

  // 1. Strip markdown code fences but speak a concise label
  s = s.replace(/```[a-zA-Z]*\n?([\s\S]*?)```/gi, (match, code) => {
    // Clean code to avoid reading raw braces and brackets
    const cleanCode = code
      .replace(/[{}();]/g, " ")
      .replace(/\n+/g, ", ")
      .replace(/\s+/g, " ")
      .slice(0, 120);
    return ` Here is the code snippet: ${cleanCode}. `;
  });

  // Strip inline code backticks
  s = s.replace(/`([^`]+)`/g, "$1");

  // 2. Big-O Complexity Notations
  s = s.replace(/\\mathcal\{O\}\(\s*\\log(?:_2)?\s*n\s*\)/gi, "Big O of log n");
  s = s.replace(/\\mathcal\{O\}\(\s*n\s*\\log(?:_2)?\s*n\s*\)/gi, "Big O of n log n");
  s = s.replace(/\\mathcal\{O\}\(\s*n\^2\s*\)/gi, "Big O of n squared");
  s = s.replace(/\\mathcal\{O\}\(\s*n\s*\)/gi, "Big O of n");
  s = s.replace(/\\mathcal\{O\}\(\s*1\s*\)/gi, "Big O of one");
  s = s.replace(/\\mathcal\{O\}\((.*?)\)/gi, "Big O of $1");

  s = s.replace(/\$O\(\s*log(?:_2)?\s*n\s*\)\$/gi, "Big O of log n");
  s = s.replace(/\$O\(\s*n\s*log(?:_2)?\s*n\s*\)\$/gi, "Big O of n log n");
  s = s.replace(/\$O\(\s*n\^2\s*\)\$/gi, "Big O of n squared");
  s = s.replace(/\$O\(\s*n\s*\)\$/gi, "Big O of n");
  s = s.replace(/\$O\(\s*1\s*\)\$/gi, "Big O of one");
  s = s.replace(/\$O\((.*?)\)\$/gi, "Big O of $1");

  s = s.replace(/\bO\(\s*log(?:_2)?\s*n\s*\)/gi, "Big O of log n");
  s = s.replace(/\bO\(\s*n\s*log(?:_2)?\s*n\s*\)/gi, "Big O of n log n");
  s = s.replace(/\bO\(\s*n\^2\s*\)/gi, "Big O of n squared");
  s = s.replace(/\bO\(\s*n\s*\)/gi, "Big O of n");
  s = s.replace(/\bO\(\s*1\s*\)/gi, "Big O of one");
  s = s.replace(/\bO\((.*?)\)/gi, "Big O of $1");

  // 3. Logarithms
  s = s.replace(/\\log_2\(?([a-zA-Z0-9]+)\)?/gi, "log base two of $1");
  s = s.replace(/\blog2\(?([a-zA-Z0-9]+)\)?/gi, "log base two of $1");
  s = s.replace(/\\log\(?([a-zA-Z0-9]+)\)?/gi, "log of $1");

  // 4. Exponents & Powers (e.g. 2^k = n -> "Two raised to the power of k equals n")
  s = s.replace(/2\^k\s*=\s*n/gi, "Two raised to the power of k equals n");
  s = s.replace(/2\^([a-zA-Z0-9]+)/gi, "two raised to the power of $1");
  s = s.replace(/([a-zA-Z0-9]+)\^2/gi, "$1 squared");
  s = s.replace(/([a-zA-Z0-9]+)\^3/gi, "$1 cubed");
  s = s.replace(/([a-zA-Z0-9]+)\^([a-zA-Z0-9]+)/gi, "$1 raised to the power of $2");

  // 5. Fractions & Divisions (e.g. n / 2 -> "n divided by two")
  s = s.replace(/\bn\s*\/\s*2\b/gi, "n divided by two");
  s = s.replace(/\bN\s*\/\s*2\b/gi, "N divided by two");
  s = s.replace(/\bn\s*\/\s*4\b/gi, "n divided by four");
  s = s.replace(/\b([a-zA-Z0-9_]+)\s*\/\s*([a-zA-Z0-9_]+)\b/g, "$1 divided by $2");
  s = s.replace(/\/\//g, "divided by");

  // 6. Data Structures, Arrays & Pointer Indices
  s = s.replace(/arr\[mid\]/gi, "array at middle");
  s = s.replace(/array\[mid\]/gi, "array at middle");
  s = s.replace(/arr\[low\]/gi, "array at low");
  s = s.replace(/arr\[high\]/gi, "array at high");
  s = s.replace(/arr\[([a-zA-Z0-9_]+)\]/gi, "array at $1");
  s = s.replace(/\[\s*([0-9,\s]+)\s*\]/g, (match, nums) => {
    const list = nums.trim().replace(/\s+/g, " ");
    return `the array ${list}`;
  });

  // 7. Comparisons and Code Conditionals
  s = s.replace(/<=|\\le/g, " is less than or equal to ");
  s = s.replace(/>=|\\ge/g, " is greater than or equal to ");
  s = s.replace(/!=|\\ne/g, " is not equal to ");
  s = s.replace(/===?/g, " equals ");
  s = s.replace(/\s*<\s*/g, " is less than ");
  s = s.replace(/\s*>\s*/g, " is greater than ");
  s = s.replace(/\\approx/gi, " is approximately ");
  s = s.replace(/\\cdot|\\times/gi, " times ");
  s = s.replace(/\\lambda/gi, "lambda");
  s = s.replace(/\\mu/gi, "mu");
  s = s.replace(/\\sigma/gi, "sigma");
  s = s.replace(/\\pi/gi, "pi");
  s = s.replace(/\\alpha/gi, "alpha");
  s = s.replace(/\\beta/gi, "beta");
  s = s.replace(/\\theta/gi, "theta");

  // 8. Markdown clean-up
  s = s.replace(/\$+/g, ""); // Strip dollar signs from LaTeX
  s = s.replace(/\*\*([^*]+)\*\*/g, "$1"); // Bold
  s = s.replace(/\*([^*]+)\*/g, "$1"); // Italics
  s = s.replace(/^#+\s*/gm, ""); // Headers
  s = s.replace(/^[-*+]\s+/gm, ""); // Bullets
  s = s.replace(/&[a-z]+;/gi, " "); // HTML entities
  s = s.replace(/[\(\)\[\]{}]/g, " "); // Strip naked brackets/parens

  // 9. Normalize whitespace and clean up double punctuation
  s = s.replace(/\s*,\s*,/g, ", ");
  s = s.replace(/\s*\.\s*\./g, ".");
  s = s.replace(/\s+/g, " ").trim();

  return s;
}

/**
 * Prioritizes high-quality, clear, natural English voices like Siri,
 * Samantha (Apple US), Daniel (Apple UK), Google US English, and Microsoft Natural.
 */
export function getBestSiriVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // 1. Siri & Apple Samantha (default Siri voice on Mac/iOS)
  const siriSamantha = voices.find(
    (v) => /samantha/i.test(v.name) && (v.lang.startsWith("en-US") || v.lang.startsWith("en_US"))
  );
  if (siriSamantha) return siriSamantha;

  // 2. Named high-clarity Siri / Natural voices
  const siriNamed = voices.find(
    (v) =>
      /siri|karen|daniel|victoria|ava|allison|oliver|serena|tom/i.test(v.name) &&
      v.lang.startsWith("en")
  );
  if (siriNamed) return siriNamed;

  // 3. Natural / Online Neural voices (Edge / Chrome)
  const naturalNeural = voices.find(
    (v) =>
      /natural|online \(natural\)|google us english|google uk english female/i.test(v.name) &&
      v.lang.startsWith("en")
  );
  if (naturalNeural) return naturalNeural;

  // 4. Default clean en-US local voices (e.g. Flo, Sandy, Eddy, Reed)
  const cleanUsVoice = voices.find(
    (v) => (v.lang === "en-US" || v.lang === "en_US") && !/bad news|bahh|bells|boing|bubbles|cellos|jester|organ|wobble|whisper|zarvox|trinoids/i.test(v.name)
  );
  if (cleanUsVoice) return cleanUsVoice;

  // 5. Any clean en-GB voice
  const cleanUkVoice = voices.find(
    (v) => (v.lang === "en-GB" || v.lang === "en_GB") && !/bad news|bahh|bells|boing|bubbles|cellos|jester|organ|wobble|whisper|zarvox|trinoids/i.test(v.name)
  );
  if (cleanUkVoice) return cleanUkVoice;

  // 6. Any English voice
  const anyEnglish = voices.find((v) => v.lang.startsWith("en"));
  return anyEnglish || voices[0];
}

/**
 * Global cancel to prevent overlapping speech across components.
 */
export function stopAllSpeech(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Speaks a Socratic teaching beat at a natural, calm pacing (0.90x),
 * pausing cleanly before the check question and stopping to wait for the student.
 */
export function speakSocraticTurn(options: SpeakOptions): SpeechSynthesisUtterance | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    options.onEnd?.();
    return null;
  }

  // 1. Cancel previous speech immediately to prevent overlaps or collisions
  stopAllSpeech();

  const {
    text,
    checkQuestion,
    rate = 0.90, // Calibrated speed between 0.85x and 0.95x for optimal clarity
    pitch = 1.0, // Comfortable, natural human pitch
    volume = 1.0,
    onStart,
    onEnd,
    onError,
    voice,
  } = options;

  // 2. Verbalize formulas and math into spoken English
  let cleanExplanation = verbalizeMathForSpeech(text);
  let cleanQuestion = checkQuestion ? verbalizeMathForSpeech(checkQuestion) : "";

  // 3. Assemble spoken script with natural cadence and pause before question
  let scriptToSpeak = cleanExplanation;
  if (cleanQuestion) {
    // Add punctuation pause before question
    if (!scriptToSpeak.endsWith(".") && !scriptToSpeak.endsWith("!") && !scriptToSpeak.endsWith("?")) {
      scriptToSpeak += ".";
    }
    scriptToSpeak += ` ... ... ${cleanQuestion}`;
  }

  if (!scriptToSpeak.trim()) {
    onEnd?.();
    return null;
  }

  // 4. Create and configure SpeechSynthesisUtterance
  const utterance = new SpeechSynthesisUtterance(scriptToSpeak);

  // Load voice if provided or find the best Siri/natural voice
  if (voice) {
    utterance.voice = voice;
  } else {
    const voices = window.speechSynthesis.getVoices();
    const bestVoice = getBestSiriVoice(voices);
    if (bestVoice) utterance.voice = bestVoice;
  }

  utterance.rate = Math.max(0.85, Math.min(0.95, rate));
  utterance.pitch = pitch;
  utterance.volume = volume;

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    onEnd?.();
  };

  utterance.onerror = (e) => {
    console.warn("Speech synthesis error:", e);
    onError?.(e);
    onEnd?.();
  };

  // 5. Speak the utterance
  window.speechSynthesis.speak(utterance);
  return utterance;
}
