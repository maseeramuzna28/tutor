"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  BookOpen,
  Send,
  Mic,
  MicOff,
  PenTool,
  ArrowRight,
  Code2,
  Check,
} from "lucide-react";
import { StepItem, Question } from "@/lib/types";
import { apiClient } from "@/lib/apiClient";
import { SocraticChatResponse, SocraticChatTurn, SocraticSessionState } from "@/lib/types/database";
import {
  speakSocraticTurn,
  stopAllSpeech,
  getBestSiriVoice,
  verbalizeMathForSpeech,
} from "@/lib/voice/speechAudioEngine";

interface SocraticTutorCompanionProps {
  question: Question;
  activeStepIndex: number;
  onStepChange: (index: number) => void;
  onScribeToNotebook?: (step: StepItem | any) => void;
  onAskFollowUp?: (query: string) => void;
  className?: string;
  initialTopic?: string;
}

export default function SocraticTutorCompanion({
  question,
  activeStepIndex,
  onStepChange,
  onScribeToNotebook,
  onAskFollowUp,
  className = "",
  initialTopic,
}: SocraticTutorCompanionProps) {
  // Conversational Turn State
  const [conversation, setConversation] = useState<SocraticChatTurn[]>([]);
  const [currentTurn, setCurrentTurn] = useState<SocraticChatResponse | null>(null);
  const [sessionState, setSessionState] = useState<SocraticSessionState>({
    concept: question?.concept || initialTopic || "Data Structures & Algorithms",
    step_index: 1,
    total_steps: Math.max(3, question?.steps?.length || 4),
    is_complete: false,
    mastered_points: [],
  });

  // UI & Audio Controls (calibrated to 0.90x speed for Siri-level clarity)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(0.90);
  const [isWaitingForStudent, setIsWaitingForStudent] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [studentInput, setStudentInput] = useState<string>("");
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [showAnalogyBox, setShowAnalogyBox] = useState<boolean>(false);
  const [scribedPill, setScribedPill] = useState<boolean>(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const currentStep = question.steps[activeStepIndex] || question.steps[0];

  // Load available system voices & select natural Siri voice
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      const naturalSiriVoice = getBestSiriVoice(voices);
      if (naturalSiriVoice) setSelectedVoice(naturalSiriVoice);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    // Check speech recognition
    const hasSR = Boolean(
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    );
    setSpeechSupported(hasSR);

    return () => {
      stopAllSpeech();
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  // Initialize or re-sync when question text changes
  useEffect(() => {
    if (!question || !question.text) return;
    const initialConcept = question.concept || initialTopic || "Data Structures & Algorithms";
    setSessionState((prev) => ({
      ...prev,
      concept: initialConcept,
      step_index: activeStepIndex + 1,
      total_steps: Math.max(3, question.steps.length),
    }));
  }, [question, activeStepIndex, initialTopic]);

  // Speak a conversational script with clear pronunciation and natural pause before questions
  const speakTutorTurn = (scriptText: string, checkQ?: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsWaitingForStudent(true);
      return;
    }

    const utterance = speakSocraticTurn({
      text: scriptText,
      checkQuestion: checkQ,
      rate: speechRate,
      pitch: 1.0,
      volume: 1.0,
      voice: selectedVoice,
      onStart: () => {
        setIsPlaying(true);
        setIsWaitingForStudent(false);
      },
      onEnd: () => {
        setIsPlaying(false);
        setIsWaitingForStudent(true); // Tutor pauses here for student!
      },
      onError: () => {
        setIsPlaying(false);
        setIsWaitingForStudent(true);
      },
    });

    utteranceRef.current = utterance;
  };

  // Stop tutor speech cleanly
  const stopSpeech = () => {
    stopAllSpeech();
    setIsPlaying(false);
    setIsWaitingForStudent(true);
  };

  // Send student response to Socratic AI Tutor
  const submitStudentTurn = async (messageToSend: string) => {
    const trimmed = messageToSend.trim();
    if (!trimmed || isThinking) return;

    // Stop ongoing speech or listening
    stopSpeech();
    stopListening();
    setStudentInput("");
    setIsThinking(true);

    const pendingQ =
      currentTurn?.check_question ||
      currentStep?.check_question ||
      "Does this step make intuitive sense so far?";

    const newHistoryTurn: SocraticChatTurn = { role: "user", content: trimmed };
    const updatedHistory = [...conversation, newHistoryTurn];
    setConversation(updatedHistory);

    try {
      const response = await apiClient.socraticChat(
        trimmed,
        updatedHistory,
        {
          ...sessionState,
          pending_question: pendingQ,
        }
      );

      setCurrentTurn(response);
      setSessionState(response.sessionState);

      // Add assistant turn to conversation
      const assistantTurn: SocraticChatTurn = {
        role: "assistant",
        content: `${response.feedback} ${response.explanation} ${response.check_question}`,
      };
      setConversation([...updatedHistory, assistantTurn]);

      // If step advanced, notify parent
      if (response.sessionState.step_index && response.sessionState.step_index - 1 !== activeStepIndex) {
        onStepChange(Math.min(question.steps.length - 1, response.sessionState.step_index - 1));
      }

      // Speak conversational script with clear pronunciation and natural pause before questions
      speakTutorTurn(
        response.spoken_text || `${response.feedback} ${response.check_question}`,
        response.check_question
      );
    } catch (err: any) {
      console.error("Socratic tutor turn failed:", err);
      // Fallback response
      const fallbackReply = `Great observation! Let's continue from first principles: focus on how the boundary conditions keep the algorithm valid.`;
      speakTutorTurn(fallbackReply);
    } finally {
      setIsThinking(false);
    }
  };

  // Handle student microphone input
  const toggleListening = () => {
    if (isListeningMic) {
      stopListening();
      return;
    }

    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    try {
      const rec = new SR();
      rec.lang = "en-IN";
      rec.interimResults = true;
      rec.continuous = false;

      rec.onstart = () => {
        setIsListeningMic(true);
        stopSpeech();
      };

      rec.onresult = (e: any) => {
        const transcript = Array.from(e.results)
          .map((r: any) => r[0].transcript)
          .join(" ");
        setStudentInput(transcript);
      };

      rec.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        setIsListeningMic(false);
      };

      rec.onend = () => {
        setIsListeningMic(false);
      };

      speechRecognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.warn("Failed to start speech recognition:", err);
      setIsListeningMic(false);
    }
  };

  const stopListening = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
    }
    setIsListeningMic(false);
  };

  // Teach the active step from the question with natural verbalization and question pause
  const startTeachingCurrentStep = () => {
    const step = question.steps[activeStepIndex] || question.steps[0];
    const checkQ = step.check_question || "Does this step make intuitive sense so far?";
    const initialSpeech =
      step.teaching_speech ||
      `${step.title}. ${(step.explanation || '').split('.')[0]}.`;

    // Seed current turn view
    setCurrentTurn({
      feedback: activeStepIndex === 0 && question.tutor_intro ? question.tutor_intro : "Let's examine this step together.",
      explanation: step.explanation,
      code_snippet: step.latex,
      check_question: checkQ,
      spoken_text: initialSpeech,
      sessionState: {
        concept: question.concept,
        step_index: activeStepIndex + 1,
        total_steps: question.steps.length,
        is_complete: activeStepIndex === question.steps.length - 1,
        mastered_points: sessionState.mastered_points,
      },
      quick_replies: [
        "Makes sense! Next step →",
        "Could you explain simpler?",
        "I don't understand",
      ],
    });

    speakTutorTurn(initialSpeech, checkQ);
  };

  // Quick Action: Explain simpler
  const handleExplainSimpler = () => {
    submitStudentTurn("Can you explain this simpler with a basic analogy?");
  };

  // Quick Action: Scribe active step / turn to digital notebook
  const handleScribe = () => {
    if (!onScribeToNotebook) return;
    const stepToScribe = currentTurn
      ? {
          step_number: sessionState.step_index,
          title: `${sessionState.concept} - Step ${sessionState.step_index}`,
          explanation: currentTurn.explanation,
          latex: currentTurn.code_snippet,
          auto_notes: `${sessionState.concept}: ${currentTurn.check_question}`,
        }
      : currentStep;

    onScribeToNotebook(stepToScribe);
    setScribedPill(true);
    setTimeout(() => setScribedPill(false), 2500);
  };

  const activeQuestionPrompt =
    currentTurn?.check_question ||
    currentStep?.check_question ||
    "Why do you think this mechanism is required?";

  const activeFeedback = currentTurn?.feedback;
  const activeExplanation = currentTurn?.explanation || currentStep?.explanation;
  const activeCodeSnippet = currentTurn?.code_snippet || currentStep?.latex;
  const activeQuickReplies = currentTurn?.quick_replies || [
    "Understood! Move forward →",
    "Explain simpler",
    "I don't understand",
  ];

  return (
    <div className={`border border-stone-300 bg-white shadow-xs p-5 space-y-4 rounded-none ${className}`}>
      {/* Socratic Tutor Header Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-stone-200 pb-3 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-none bg-stone-900 text-white font-mono text-xs font-bold">
            TUTO
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-900">
                SOCRATIC TUTOR • INTERACTIVE TEACHER
              </span>
              <span className="craft-badge craft-badge-red text-[10px]">
                Active Dialogical Turn Mode
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-sans">
              Teaches in small steps • Checks understanding • Responds to your voice & thoughts
            </p>
          </div>
        </div>

        {/* Playback & Controls */}
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <button
              onClick={stopSpeech}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <Pause className="h-3.5 w-3.5" />
              <span>Pause Tutor</span>
            </button>
          ) : (
            <button
              onClick={startTeachingCurrentStep}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider bg-stone-900 text-white hover:bg-red-600 transition-colors"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Teach Step {sessionState.step_index}</span>
            </button>
          )}

          {/* Speed Toggle (0.85x - 0.95x for clear, crisp pronunciation) */}
          <div className="flex border border-stone-300 bg-stone-50 text-[10px] font-mono">
            {[0.85, 0.90, 0.95].map((rate) => (
              <button
                key={rate}
                onClick={() => setSpeechRate(rate)}
                className={`px-2 py-1 ${speechRate === rate ? "bg-stone-900 text-white font-bold" : "text-stone-600 hover:text-stone-900"}`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress & Concept Mastery Tracker */}
      <div className="p-3 bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-stone-500">Topic:</span>
          <span className="font-semibold text-stone-900">{sessionState.concept}</span>
          <span className="text-stone-400">•</span>
          <span className="text-stone-600">
            Step {sessionState.step_index} of {sessionState.total_steps}
          </span>
          {sessionState.is_complete && (
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
              Mastered ✓
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full sm:w-36 h-2 bg-stone-200 overflow-hidden">
          <div
            className="h-full bg-red-600 transition-all duration-300"
            style={{
              width: `${Math.min(100, (sessionState.step_index / sessionState.total_steps) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Real-time Socratic Audio Teaching Beat */}
      <div
        className={`p-4 border transition-all ${
          isPlaying
            ? "border-amber-400 bg-amber-50/70 shadow-xs"
            : isWaitingForStudent
            ? "border-emerald-400 bg-emerald-50/50 shadow-xs"
            : isThinking
            ? "border-blue-300 bg-blue-50/50 shadow-xs"
            : "border-stone-200 bg-stone-50/50"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isPlaying
                  ? "bg-red-600 animate-ping"
                  : isWaitingForStudent
                  ? "bg-emerald-600 animate-pulse"
                  : isThinking
                  ? "bg-blue-600 animate-spin"
                  : "bg-stone-400"
              }`}
            />
            <span className="text-xs font-mono font-bold uppercase text-stone-900">
              {isPlaying
                ? "Tutor Explaining Live…"
                : isThinking
                ? "Tutor Evaluating Your Thought…"
                : isWaitingForStudent
                ? "Tutor Check-In: Your Turn to Respond"
                : "Ready to Teach"}
            </span>
          </div>

          <span className="text-[11px] font-mono text-stone-500">
            {isPlaying ? "Speaking short beat" : isWaitingForStudent ? "Waiting for you" : "Paused"}
          </span>
        </div>

        {/* Dynamic Tutor Feedback & Pedagogical Explanation */}
        <div className="space-y-2 text-stone-900 font-sans">
          {activeFeedback && (
            <p className="text-xs font-semibold text-stone-900 bg-white/80 p-2.5 border border-stone-200 leading-relaxed">
              &ldquo;{activeFeedback}&rdquo;
            </p>
          )}

          <p className="text-xs leading-relaxed text-stone-800">
            {activeExplanation}
          </p>

          {/* DSA Code Snippet or Dry Run */}
          {activeCodeSnippet && (
            <div className="mt-2 p-3 bg-stone-900 text-stone-100 font-mono text-[11px] overflow-x-auto border-l-2 border-red-600">
              <div className="flex items-center gap-1.5 text-[10px] text-stone-400 uppercase tracking-wider mb-1">
                <Code2 className="h-3 w-3 text-red-400" />
                <span>DSA Example / Dry Run</span>
              </div>
              <pre className="whitespace-pre-wrap">{activeCodeSnippet}</pre>
            </div>
          )}
        </div>

        {/* Active Socratic Check Question (Tutor pauses here) */}
        <div className="mt-3 pt-3 border-t border-stone-200 flex items-start gap-2.5 bg-white p-3">
          <HelpCircle className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 tracking-wider block">
              Socratic Check Question
            </span>
            <p className="text-xs font-semibold text-emerald-950 font-sans mt-0.5">
              {activeQuestionPrompt}
            </p>
          </div>
        </div>
      </div>

      {/* Student Interactive Response Section */}
      <div className="space-y-3 pt-2">
        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-500 block">
          Your Response to Tutor:
        </span>

        {/* Quick Reply Chips (Tap to answer instantly) */}
        <div className="flex flex-wrap items-center gap-2">
          {activeQuickReplies.map((replyText, idx) => (
            <button
              key={idx}
              onClick={() => submitStudentTurn(replyText)}
              disabled={isThinking}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-stone-300 bg-white text-stone-800 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all disabled:opacity-50"
            >
              <span>{replyText}</span>
              <ArrowRight className="h-3 w-3 opacity-60" />
            </button>
          ))}
        </div>

        {/* Student Typed or Spoken Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (studentInput.trim()) {
              submitStudentTurn(studentInput);
            }
          }}
          className="flex items-center gap-2 mt-2"
        >
          {/* Speech Mic Button */}
          {speechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2 border transition-all text-xs font-mono flex items-center justify-center shrink-0 ${
                isListeningMic
                  ? "bg-red-600 text-white border-red-700 animate-pulse"
                  : "bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200"
              }`}
              title={isListeningMic ? "Listening... click to stop" : "Speak your answer"}
            >
              {isListeningMic ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </button>
          )}

          <input
            type="text"
            value={studentInput}
            onChange={(e) => setStudentInput(e.target.value)}
            disabled={isThinking}
            placeholder={
              isListeningMic
                ? "Listening to your spoken answer..."
                : "Type your answer, misconception, or 'I don't understand'..."
            }
            className="flex-1 px-3 py-2 text-xs border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 font-sans focus:outline-none focus:border-stone-900"
          />

          <button
            type="submit"
            disabled={!studentInput.trim() || isThinking}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono uppercase tracking-wider bg-stone-900 text-white hover:bg-emerald-700 transition-colors disabled:opacity-40 shrink-0"
          >
            {isThinking ? (
              <span>Evaluating…</span>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Send Answer</span>
              </>
            )}
          </button>
        </form>

        {/* Auxiliary Socratic Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-200">
          <button
            type="button"
            onClick={handleExplainSimpler}
            disabled={isThinking}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <Lightbulb className="h-3 w-3 text-amber-500" />
            <span>Explain Simpler</span>
          </button>

          <button
            type="button"
            onClick={() => submitStudentTurn("Can you give me another everyday analogy for this?")}
            disabled={isThinking}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <BookOpen className="h-3 w-3 text-blue-500" />
            <span>Give Everyday Analogy</span>
          </button>

          {onScribeToNotebook && (
            <button
              type="button"
              onClick={handleScribe}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors ml-auto"
            >
              {scribedPill ? <Check className="h-3 w-3 text-emerald-600" /> : <PenTool className="h-3 w-3 text-amber-600" />}
              <span>{scribedPill ? "Scribed to Notebook ✓" : "Scribe to Notebook"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mastered Insights Pills */}
      {sessionState.mastered_points && sessionState.mastered_points.length > 0 && (
        <div className="mt-3 pt-3 border-t border-stone-200">
          <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block mb-1.5">
            Key Concepts Mastered So Far:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sessionState.mastered_points.map((pt, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono"
              >
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                <span>{pt}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
