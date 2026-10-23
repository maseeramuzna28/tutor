export interface BrowserSpeechResultEvent {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
}

export interface BrowserSpeechErrorEvent {
  error: string;
}

export interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: BrowserSpeechErrorEvent) => void) | null;
  onresult: ((event: BrowserSpeechResultEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

export interface BrowserSpeechWindow extends Window {
  SpeechRecognition?: BrowserSpeechRecognitionConstructor;
  webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
}

export function getSpeechRecognitionConstructor(
  target: BrowserSpeechWindow
): BrowserSpeechRecognitionConstructor | undefined {
  return target.SpeechRecognition || target.webkitSpeechRecognition;
}
