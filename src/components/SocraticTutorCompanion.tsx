"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Sparkles,
  HelpCircle,
  Lightbulb,
  CheckCircle,
  BookOpen,
  MessageSquare,
  ChevronRight,
  Mic,
  PenTool,
} from "lucide-react";
import { StepItem, Question } from "@/lib/types";

interface SocraticTutorCompanionProps {
  question: Question;
  activeStepIndex: number;
  onStepChange: (index: number) => void;
  onScribeToNotebook?: (step: StepItem) => void;
  onAskFollowUp?: (query: string) => void;
  className?: string;
}

export default function SocraticTutorCompanion({
  question,
  activeStepIndex,
  onStepChange,
  onScribeToNotebook,
  onAskFollowUp,
  className = "",
}: SocraticTutorCompanionProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isWaitingForStudent, setIsWaitingForStudent] = useState<boolean>(false);
  const [socraticFeedback, setSocraticFeedback] = useState<string>("");
  const [showAnalogyBox, setShowAnalogyBox] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentStep = question.steps[activeStepIndex] || question.steps[0];

  // Load available system voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      // Prioritize natural warm teaching voices
      const naturalVoice =
        voices.find((v) => /natural|samantha|karen|victoria|google uk english female|zira/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith("en-IN") || v.lang.startsWith("en-US") || v.lang.startsWith("en-GB")) ||
        voices[0];

      if (naturalVoice) setSelectedVoice(naturalVoice);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Speak the active step conversationally
  const teachActiveStep = (stepIndex: number, prependPraise?: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    setIsWaitingForStudent(false);
    setSocraticFeedback("");

    const step = question.steps[stepIndex];
    if (!step) {
      // Completed all steps
      teachWrapUp();
      return;
    }

    // Build engaging teaching script
    let scriptToSpeak = "";
    if (prependPraise) {
      scriptToSpeak += `${prependPraise}. `;
    } else if (stepIndex === 0 && question.tutor_intro) {
      scriptToSpeak += `${question.tutor_intro}. `;
    }

    const coreSpeech = step.teaching_speech || `Step ${stepIndex + 1}: ${step.title}. ${step.explanation.slice(0, 160)}`;
    scriptToSpeak += coreSpeech;

    // Append Socratic check question
    const checkQ = step.check_question || "Does this step make intuitive sense so far?";
    scriptToSpeak += ` ... ... ${checkQ}`;

    const utterance = new SpeechSynthesisUtterance(scriptToSpeak);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = speechRate;
    utterance.pitch = 1.05; // Slightly warmer teaching pitch

    utterance.onstart = () => {
      setIsPlaying(true);
      utteranceRef.current = utterance;
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsWaitingForStudent(true); // Pause to check student understanding
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsWaitingForStudent(true);
    };

    window.speechSynthesis.speak(utterance);
  };

  const teachWrapUp = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const wrapupText =
      question.tutor_wrapup ||
      "Fantastic job! You've walked through the entire derivation from first principles. Take a look at your notebook on the right to review your notes.";

    const utterance = new SpeechSynthesisUtterance(wrapupText);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = speechRate;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      setIsWaitingForStudent(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleNextStep = () => {
    if (activeStepIndex < question.steps.length - 1) {
      const nextIdx = activeStepIndex + 1;
      onStepChange(nextIdx);
      teachActiveStep(nextIdx, "Great! Moving to the next step");
    } else {
      teachWrapUp();
    }
  };

  const handleExplainSimpler = () => {
    if (!currentStep) return;
    const praise = "No worries at all, let's look at this intuitively";
    const simplerText = `${praise}: Imagine what this step is doing. Instead of getting lost in symbols, think of ${currentStep.title} as our anchor constraint. Once this constraint holds, the rest of the problem follows naturally.`;

    const utterance = new SpeechSynthesisUtterance(simplerText);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = 0.95;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      setIsWaitingForStudent(true);
      setSocraticFeedback("💡 Simplified intuition explained. Ready for next step?");
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleShareAnalogy = () => {
    setShowAnalogyBox(true);
    const analogyText = `Here's an everyday analogy: ${question.root_cause || "Think of this mechanism like a water valve—before we measure output flow, we must verify the input pressure."}`;

    const utterance = new SpeechSynthesisUtterance(analogyText);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = 0.95;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      setIsWaitingForStudent(true);
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeech = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsWaitingForStudent(false);
  };

  const handlePlayCurrent = () => {
    teachActiveStep(activeStepIndex);
  };

  return (
    <div className={`border border-stone-300 bg-white shadow-xs p-5 space-y-4 rounded-none ${className}`}>
      {/* Socratic Tutor Header Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-stone-200 pb-3 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-none bg-stone-900 text-white font-mono text-xs font-bold">
            TUTO
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-900">
                ACTIVE SOCRATIC TUTOR
              </span>
              <span className="craft-badge craft-badge-red text-[10px]">
                Interactive Teaching Mode
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-sans">
              Engages you step by step • Explains mechanisms • Scribes notes
            </p>
          </div>
        </div>

        {/* Playback & Controls */}
        <div className="flex items-center gap-2">
          {isPlaying ? (
            <button
              onClick={handleStopSpeech}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <Pause className="h-3.5 w-3.5" />
              <span>Pause Tutor</span>
            </button>
          ) : (
            <button
              onClick={handlePlayCurrent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider bg-stone-900 text-white hover:bg-red-600 transition-colors"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Teach Step {activeStepIndex + 1}</span>
            </button>
          )}

          {/* Speed Toggle */}
          <div className="flex border border-stone-300 bg-stone-50 text-[10px] font-mono">
            {[0.85, 1.0, 1.15].map((rate) => (
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

      {/* Real-time Socratic Audio Teaching Beat */}
      <div className={`p-4 border transition-all ${
        isPlaying
          ? "border-amber-400 bg-amber-50/70 shadow-xs"
          : isWaitingForStudent
          ? "border-emerald-300 bg-emerald-50/50 shadow-xs"
          : "border-stone-200 bg-stone-50/50"
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isPlaying ? "bg-red-600 animate-ping" : isWaitingForStudent ? "bg-emerald-600" : "bg-stone-400"
              }`}
            />
            <span className="text-xs font-mono font-bold uppercase text-stone-900">
              {isPlaying
                ? "Tutor Explaining Live…"
                : isWaitingForStudent
                ? "Tutor Check-In: Your Turn"
                : "Standby for Next Step"}
            </span>
          </div>

          <span className="text-[11px] font-mono text-stone-500">
            Step {activeStepIndex + 1} of {question.steps.length}
          </span>
        </div>

        {/* Spoken Teaching Script Display */}
        <p className="text-xs text-stone-900 font-sans leading-relaxed italic">
          &ldquo;
          {currentStep?.teaching_speech ||
            currentStep?.explanation ||
            "Let's break this down from first principles together."}
          &rdquo;
        </p>

        {/* Active Understanding Check */}
        {isWaitingForStudent && currentStep?.check_question && (
          <div className="mt-3 pt-3 border-t border-emerald-200 flex items-start gap-2">
            <HelpCircle className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-emerald-950 font-sans">
                {currentStep.check_question}
              </p>
              <p className="text-[11px] text-emerald-800 font-sans mt-0.5">
                Choose an action below to continue or clarify:
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Socratic Interactive Response Chips (When Tutor pauses for student) */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-500 block">
          Interactive Tutor Responses:
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {/* Got it, next step */}
          <button
            onClick={handleNextStep}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider bg-stone-900 text-white hover:bg-emerald-700 transition-colors"
          >
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span>
              {activeStepIndex < question.steps.length - 1 ? "Understood! Next Step →" : "Finish Derivation ✓"}
            </span>
          </button>

          {/* Explain simpler */}
          <button
            onClick={handleExplainSimpler}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider border border-stone-300 bg-white text-stone-800 hover:bg-stone-50 hover:border-stone-900 transition-all"
          >
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
            <span>Explain Simpler</span>
          </button>

          {/* Everyday analogy */}
          <button
            onClick={handleShareAnalogy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider border border-stone-300 bg-white text-stone-800 hover:bg-stone-50 hover:border-stone-900 transition-all"
          >
            <BookOpen className="h-3.5 w-3.5 text-blue-500" />
            <span>Give Everyday Analogy</span>
          </button>

          {/* Scribe to Notebook */}
          {onScribeToNotebook && currentStep && (
            <button
              onClick={() => onScribeToNotebook(currentStep)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 transition-all"
              title="Stamp this formula & explanation into your hands-free notebook"
            >
              <PenTool className="h-3.5 w-3.5 text-amber-700" />
              <span>Scribe to Notebook</span>
            </button>
          )}
        </div>
      </div>

      {/* Socratic Feedback Alert */}
      {socraticFeedback && (
        <div className="p-3 bg-stone-100 border border-stone-300 text-xs text-stone-800 font-mono">
          {socraticFeedback}
        </div>
      )}

      {/* Analogy Box */}
      {showAnalogyBox && question.root_cause && (
        <div className="p-3.5 bg-blue-50/70 border border-blue-200 text-xs text-blue-950 font-sans leading-relaxed">
          <span className="font-mono font-bold text-[10px] text-blue-700 block uppercase mb-1">
            Intuitive Analogy
          </span>
          {question.root_cause}
        </div>
      )}
    </div>
  );
}
