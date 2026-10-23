"use client";

import { useState } from "react";
import VoiceMicButton, { MicState } from "@/components/VoiceMicButton";
import MathStepRenderer from "@/components/MathStepRenderer";
import { apiClient } from "@/lib/apiClient";
import { Question } from "@/lib/types";
import {
  Sparkles,
  Volume2,
  CheckCircle,
  Send,
  Edit3,
  Tag,
  AlertCircle,
  Square,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { DoubtButton } from "@/components/evil-buttons/DoubtButton";
import { RevealButton } from "@/components/evil-buttons/RevealButton";

export default function TutorPage() {
  const [micState, setMicState] = useState<MicState>("idle");
  const [transcript, setTranscript] = useState("");
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);
  const [typedInput, setTypedInput] = useState("");
  const [thinkingStep, setThinkingStep] = useState<string>("");
  const [notAQuestionAlert, setNotAQuestionAlert] = useState<boolean>(false);

  const handleConfirmDoubt = async (textToSolve: string) => {
    if (!textToSolve.trim()) return;
    setNotAQuestionAlert(false);
    setMicState("thinking");

    setThinkingStep("Validating question context…");
    const detection = await apiClient.detectQuestion(textToSolve);

    if (!detection.isQuestion) {
      setThinkingStep("");
      setMicState("confirming");
      setNotAQuestionAlert(true);
      return;
    }

    setThinkingStep("Analyzing conceptual mechanisms…");
    await new Promise((r) => setTimeout(r, 350));

    setThinkingStep("Generating step-by-step derivation…");
    const solution = await apiClient.solveDoubt(textToSolve);

    const newQuestion = await apiClient.createPrivateQuestion({
      text: textToSolve,
      spoken_answer: solution.spoken_answer,
      steps: solution.steps,
      concept: solution.concept,
      root_cause: solution.root_cause,
      subject: solution.subject,
    });

    setActiveQuestion(newQuestion);
    setThinkingStep("");
    setMicState("speaking");
    playSpokenAnswer(solution.spoken_answer);
  };

  const handleStopExecution = () => {
    stopAudio();
    setThinkingStep("");
    setMicState("confirming");
  };

  const playSpokenAnswer = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-IN";
      utterance.rate = 1.0;
      utterance.onstart = () => setIsSpeakingAudio(true);
      utterance.onend = () => {
        setIsSpeakingAudio(false);
        setMicState("idle");
      };
      utterance.onerror = () => {
        setIsSpeakingAudio(false);
        setMicState("idle");
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        setMicState("idle");
      }, 3500);
    }
  };

  const stopAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingAudio(false);
    setMicState("idle");
  };

  const handlePostAnonymously = async () => {
    if (!activeQuestion) return;
    await apiClient.postAnonymously(activeQuestion.id);
    setActiveQuestion({ ...activeQuestion, visibility: "anonymous" });
  };

  const handleResolutionStatus = async (status: "resolved" | "still_stuck") => {
    if (!activeQuestion) return;
    await apiClient.updateResolution(activeQuestion.id, status);
    setActiveQuestion({ ...activeQuestion, resolution_status: status });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 mb-16 md:mb-0">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Voice AI Tutor</h1>
            <span className="craft-badge craft-badge-blue">
              Real-time Derivations
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Speak naturally. Confirm your question. Review step-by-step mathematical reasoning with spoken explanation.
          </p>
        </div>

        <RevealButton
          secret="Anonymous Channel • Identity Stripped"
          label="Zero Identity Exposure"
          hiddenLabel="Privacy Guarantee"
          maskedValue="Student • Verified Anonymous"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Voice Mic & Inputs */}
        <div className="lg:col-span-5 space-y-5">
          <div className="craft-panel p-6 shadow-sm">
            {/* Voice Mic Button */}
            <VoiceMicButton
              state={micState}
              onStateChange={setMicState}
              transcript={transcript}
              onTranscriptChange={setTranscript}
              onConfirmDoubt={handleConfirmDoubt}
            />

            {/* Thinking Step Indicator */}
            {micState === "thinking" && (
              <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/80 p-3 text-center cube-enter">
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-indigo-700">
                  <span className="h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
                  <span>{thinkingStep || "Processing with AI…"}</span>
                </div>
                <button
                  onClick={handleStopExecution}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 transition-colors"
                >
                  <Square className="h-3 w-3" />
                  <span>Cancel</span>
                </button>
              </div>
            )}

            {/* Not a Question Banner */}
            {notAQuestionAlert && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 cube-enter flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">Clarify your inquiry</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    We couldn&apos;t detect a specific academic inquiry. E.g. &ldquo;Why do we subtract lambda times identity?&rdquo;
                  </p>
                </div>
              </div>
            )}

            {/* Editable Transcript Card */}
            {(micState === "confirming" || (transcript && micState !== "thinking")) && (
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/80 p-4 cube-enter">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5">
                    <Edit3 className="h-3 w-3 text-indigo-600" />
                    Confirm Transcript
                  </span>
                  <span className="text-[10px] text-slate-500">Edit if needed</span>
                </div>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-all shadow-xs"
                  placeholder="Your question transcript..."
                />
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setTranscript("");
                      setMicState("idle");
                    }}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => handleConfirmDoubt(transcript)}
                    disabled={!transcript.trim()}
                    className="evil-btn evil-btn-primary px-4 py-1.5 text-xs font-semibold"
                  >
                    Confirm & Solve &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* Typed Fallback Input */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <p className="text-[11px] text-slate-600 mb-2 font-medium">Or type your question directly:</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (typedInput.trim()) {
                    setTranscript(typedInput);
                    handleConfirmDoubt(typedInput);
                    setTypedInput("");
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={typedInput}
                  onChange={(e) => setTypedInput(e.target.value)}
                  placeholder="e.g. How to choose u and dv in integration by parts?"
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-all shadow-xs"
                />
                <button
                  type="submit"
                  disabled={!typedInput.trim() || micState === "thinking"}
                  className="evil-btn evil-btn-secondary px-3 py-2 text-xs"
                >
                  <Send className="h-3.5 w-3.5 text-slate-600" />
                </button>
              </form>
            </div>
          </div>

          {/* Example Prompts */}
          <div className="craft-panel p-4 shadow-sm">
            <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
              Example Academic Inquiries
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  const q = "Why do we subtract lambda times the identity matrix when finding eigenvalues?";
                  setTranscript(q);
                  handleConfirmDoubt(q);
                }}
                className="w-full text-left rounded-lg border border-slate-200 bg-slate-50/60 p-2.5 text-xs text-slate-800 hover:bg-indigo-50/60 hover:border-indigo-200 transition-all"
              >
                &ldquo;Why do we subtract lambda times the identity matrix when finding eigenvalues?&rdquo;
                <span className="block text-[10px] font-semibold text-indigo-600 mt-0.5">Linear Algebra • det(A - λI)</span>
              </button>

              <button
                onClick={() => {
                  const q = "How do we choose u and dv in integration by parts to avoid an infinite loop in recurrence relations?";
                  setTranscript(q);
                  handleConfirmDoubt(q);
                }}
                className="w-full text-left rounded-lg border border-slate-200 bg-slate-50/60 p-2.5 text-xs text-slate-800 hover:bg-amber-50/60 hover:border-amber-200 transition-all"
              >
                &ldquo;How do we choose u and dv in integration by parts to avoid an infinite loop in recurrence relations?&rdquo;
                <span className="block text-[10px] font-semibold text-amber-700 mt-0.5">Calculus • Reduction Formulas</span>
              </button>

              <button
                onClick={() => {
                  const q = "In a MOSFET, why does channel pinch-off not drop the drain current to zero?";
                  setTranscript(q);
                  handleConfirmDoubt(q);
                }}
                className="w-full text-left rounded-lg border border-slate-200 bg-slate-50/60 p-2.5 text-xs text-slate-800 hover:bg-emerald-50/60 hover:border-emerald-200 transition-all"
              >
                &ldquo;In a MOSFET, why does channel pinch-off not drop the drain current to zero?&rdquo;
                <span className="block text-[10px] font-semibold text-emerald-700 mt-0.5">Semiconductor Physics • Saturation</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Solution & Derivations */}
        <div className="lg:col-span-7">
          {activeQuestion ? (
            <div className="craft-panel p-6 shadow-md space-y-6 cube-enter">
              {/* Question Header */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="craft-badge craft-badge-blue">
                    <Tag className="h-3 w-3" />
                    {activeQuestion.concept}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">{activeQuestion.subject}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">{activeQuestion.text}</h3>
              </div>

              {/* Spoken Answer Audio Card */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-indigo-900 flex items-center gap-1.5">
                    <Volume2 className="h-4 w-4 text-indigo-600" />
                    Spoken Audio Explanation
                  </span>
                  {isSpeakingAudio ? (
                    <button
                      onClick={stopAudio}
                      className="rounded-lg border border-red-200 bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-200 transition-all"
                    >
                      Stop Audio
                    </button>
                  ) : (
                    <button
                      onClick={() => playSpokenAnswer(activeQuestion.spoken_answer)}
                      className="rounded-lg border border-indigo-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-50 shadow-xs transition-all"
                    >
                      Replay Voice
                    </button>
                  )}
                </div>
                <p className="text-xs text-indigo-950 leading-relaxed italic">
                  &ldquo;{activeQuestion.spoken_answer}&rdquo;
                </p>
              </div>

              {/* Conceptual Mechanism Identified */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Conceptual Mechanism Identified
                </p>
                <p className="text-slate-700 mt-1 leading-relaxed">{activeQuestion.root_cause}</p>
              </div>

              {/* Step-by-Step KaTeX Math Equations */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                  Mathematical Derivation:
                </h4>
                <MathStepRenderer steps={activeQuestion.steps} />
              </div>

              {/* Privacy Choice: Post Anonymously */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                {activeQuestion.visibility === "private" ? (
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <DoubtButton
                      label="Post Anonymously to Feed (+5 pts)"
                      confirmations={[
                        "Share with students? Institutional tag will attach.",
                        "Confirm Anonymity: Your personal name and ID remain stripped.",
                      ]}
                      successLabel="Posted Anonymously (+5 pts)"
                      onConfirm={handlePostAnonymously}
                    />
                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      <Lock className="h-3 w-3 text-indigo-600" />
                      Saved Privately
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>Posted Anonymously (+5 pts)</span>
                  </div>
                )}

                {/* Resolution buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleResolutionStatus("resolved")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all ${
                      activeQuestion.resolution_status === "resolved"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Resolved ✓
                  </button>
                  <button
                    onClick={() => handleResolutionStatus("still_stuck")}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all ${
                      activeQuestion.resolution_status === "still_stuck"
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Still Stuck
                  </button>
                </div>
              </div>

              {/* Still Stuck Redirect */}
              {activeQuestion.resolution_status === "still_stuck" && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 cube-enter">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-amber-950">Need peer perspectives?</p>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Your doubt is logged into the instructor confusion telemetry. Explore answers from other students:
                      </p>
                    </div>
                    <Link
                      href={`/feed?subject=${encodeURIComponent(activeQuestion.subject)}`}
                      className="evil-btn evil-btn-amber px-3 py-1.5 text-xs font-semibold shrink-0 ml-4"
                    >
                      <span>Community Feed &rarr;</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center craft-panel p-12 text-center h-full min-h-[440px] shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">No Active Question</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                Click the microphone to speak your question or pick an example inquiry from the left to view step-by-step
                reasoning.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
