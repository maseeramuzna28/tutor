"use client";

import { useState } from "react";
import VoiceMicButton, { MicState } from "@/components/VoiceMicButton";
import MathStepRenderer from "@/components/MathStepRenderer";
import { apiClient } from "@/lib/apiClient";
import { Question, StepItem } from "@/lib/types";
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
  PenTool,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { DoubtButton } from "@/components/evil-buttons/DoubtButton";
import { RevealButton } from "@/components/evil-buttons/RevealButton";
import TutoLoader from "@/components/TutoLoader";
import PdfTutorWorkspace from "@/components/PdfTutorWorkspace";
import HandsfreeNotebookSurface from "@/components/HandsfreeNotebookSurface";
import SocraticTutorCompanion from "@/components/SocraticTutorCompanion";

export default function TutorPage() {
  const [micState, setMicState] = useState<MicState>("idle");
  const [transcript, setTranscript] = useState("");
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [notebookStepToScribe, setNotebookStepToScribe] = useState<StepItem | null>(null);
  const [standbyTab, setStandbyTab] = useState<"standby" | "notebook">("standby");
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);
  const [typedInput, setTypedInput] = useState("");
  const [thinkingStep, setThinkingStep] = useState<string>("");
  const [notAQuestionAlert, setNotAQuestionAlert] = useState<boolean>(false);

  const handleConfirmDoubt = async (textToSolve: string) => {
    if (!textToSolve.trim()) return;
    setNotAQuestionAlert(false);
    setMicState("thinking");

    try {
      setThinkingStep("Validating question context…");
      const detection = await apiClient.detectQuestion(textToSolve);

      if (!detection.isQuestion) {
        setThinkingStep("");
        setMicState("confirming");
        setNotAQuestionAlert(true);
        return;
      }

      setThinkingStep("Generating step-by-step Socratic teaching derivation…");
      const solution = await apiClient.solveDoubt(textToSolve);

      const newQuestion = await apiClient.createPrivateQuestion({
        text: textToSolve,
        spoken_answer: solution.spoken_answer,
        steps: solution.steps,
        concept: solution.concept,
        root_cause: solution.root_cause,
        subject: solution.subject,
      });

      // Attach Socratic teaching beats
      newQuestion.tutor_intro = (solution as any).tutor_intro;
      newQuestion.tutor_wrapup = (solution as any).tutor_wrapup;
      newQuestion.steps = (solution.steps || []).map((s: any, idx: number) => ({
        ...s,
        step_number: s.step_number || s.step || idx + 1,
        latex: s.latex || s.equation_or_code,
        teaching_speech: s.teaching_speech,
        check_question: s.check_question,
        auto_notes: s.auto_notes,
      }));

      setActiveQuestion(newQuestion);
      setActiveStepIndex(0);
    } catch (err: any) {
      console.error("Failed to solve question:", err);
      alert(err?.message || "Encountered an issue solving the doubt. Please try again.");
    } finally {
      setThinkingStep("");
      setMicState("idle");
    }
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 mb-16 md:mb-0 space-y-16">
      {/* Primary Feature: PDF Multimodal Voice & Sketch Tutor */}
      <section>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="editorial-kicker">FEATURE 01 • PDF MULTIMODAL TUTOR</span>
              <span className="craft-badge craft-badge-red text-[10px]">
                Interactive Sketch + Voice
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-stone-950 font-normal mt-1">
              Study with PDF & Circle Your Doubts
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-3xl leading-relaxed font-sans">
              Upload your lecture slides or open preloaded engineering handouts. Use the sketch tool to circle any formula or paragraph on the page, then speak your question. The reasoning engine analyzes the circled excerpt, speaks the derivation aloud, and projects explanatory sketch annotations directly on the display.
            </p>
          </div>

          <RevealButton
            secret="Ephemeral RAM • Zero Server Persistence"
            label="Document Privacy"
            hiddenLabel="Privacy Shield"
            maskedValue="Client Ephemeral • Shielded"
          />
        </div>

        {/* The PDF Workspace */}
        <PdfTutorWorkspace />
      </section>

      {/* Secondary Feature: Direct Voice & Mathematical Derivation Workspace */}
      <section className="pt-8 border-t-2 border-stone-950">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="editorial-kicker">FEATURE 02 • ADDITIONAL MODE</span>
              <span className="craft-badge text-[10px]">Direct Microphone Input</span>
            </div>
            <h2 className="text-2xl font-serif text-stone-950 font-normal mt-0.5">
              Direct Voice Query & Symbolic Derivations
            </h2>
            <p className="text-xs text-stone-600 mt-0.5 font-sans">
              Have a quick verbal question without a document? Speak directly into the microphone for immediate step-by-step LaTeX derivation.
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
          <div className="border border-stone-200 bg-white p-6 rounded-none">
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
              <div className="mt-4 border border-stone-300 bg-white p-4 text-center rounded-none">
                <TutoLoader
                  variant="voice"
                  size="md"
                  color="red"
                  label={thinkingStep || "Synthesizing mathematical derivation…"}
                />
                <button
                  onClick={handleStopExecution}
                  className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-stone-500 hover:text-red-600 transition-colors"
                >
                  <Square className="h-3 w-3" />
                  <span>Cancel derivation</span>
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

              {/* Socratic Interactive Voice Tutor Companion */}
              <SocraticTutorCompanion
                question={activeQuestion}
                activeStepIndex={activeStepIndex}
                onStepChange={(newIdx) => setActiveStepIndex(newIdx)}
                onScribeToNotebook={(step) => setNotebookStepToScribe(step)}
              />

              {/* Conceptual Mechanism Identified */}
              <div className="rounded-none border border-amber-300 bg-amber-50/70 p-3.5 text-xs">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900">
                  Conceptual Mechanism Identified
                </p>
                <p className="text-stone-800 mt-1 leading-relaxed font-sans">{activeQuestion.root_cause}</p>
              </div>

              {/* Step-by-Step KaTeX Math Equations with Synchronized Highlighting */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-700">
                    Mathematical Derivation Steps:
                  </h4>
                  <span className="text-[10px] font-mono text-stone-500">
                    Click any step to jump tutor voice
                  </span>
                </div>
                <MathStepRenderer
                  steps={activeQuestion.steps}
                  activeStepNumber={activeStepIndex + 1}
                  onSelectStep={(stepNum) => setActiveStepIndex(stepNum - 1)}
                />
              </div>

              {/* Integrated Hands-Free Pen & Digital Notebook Surface ("within the tutor thing only") */}
              <div className="mt-8 pt-6 border-t border-stone-300">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-900">
                      TUTO NOTEBOOK • HANDS-FREE PEN & SCRIBE SURFACE
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-stone-500">
                    Auto-captures formulas & voice thoughts
                  </span>
                </div>

                <HandsfreeNotebookSurface
                  activeStep={activeQuestion.steps[activeStepIndex] || notebookStepToScribe}
                  activeConcept={activeQuestion.concept}
                />
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
            <div className="space-y-4">
              {/* Standby Tab Header */}
              <div className="flex border border-stone-300 bg-stone-100 p-1">
                <button
                  onClick={() => setStandbyTab("standby")}
                  className={`flex-1 py-1.5 text-xs font-mono uppercase tracking-wider transition-all ${
                    standbyTab === "standby"
                      ? "bg-white text-stone-900 font-bold shadow-xs"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  Question Standby
                </button>
                <button
                  onClick={() => setStandbyTab("notebook")}
                  className={`flex-1 py-1.5 text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    standbyTab === "notebook"
                      ? "bg-white text-stone-900 font-bold shadow-xs"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  <PenTool className="h-3 w-3 text-red-600" />
                  <span>Hands-Free Notebook Studio</span>
                </button>
              </div>

              {standbyTab === "standby" ? (
                <div className="flex flex-col items-center justify-center border border-stone-200 bg-white p-12 text-center h-full min-h-[440px] rounded-none">
                  <div className="flex h-12 w-12 items-center justify-center rounded-none bg-stone-100 border border-stone-300 text-stone-900 mb-4 font-mono">
                    <Sparkles className="h-5 w-5 text-red-600" />
                  </div>
                  <h3 className="text-base font-serif font-bold text-stone-900">
                    Interactive Socratic Tutor Standby
                  </h3>
                  <p className="text-xs text-stone-500 max-w-sm mt-1 leading-relaxed font-sans">
                    Click the microphone on the left to speak your doubt directly, or select an example inquiry. The
                    Socratic voice tutor will teach the derivation step-by-step and auto-scribe formulas onto your notebook.
                  </p>
                </div>
              ) : (
                <HandsfreeNotebookSurface />
              )}
            </div>
          )}
        </div>
      </div>
      </section>
    </div>
  );
}
