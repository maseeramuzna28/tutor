"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Activity, Volume2, Shield, Terminal, BookOpen, Layers, Check, CornerDownRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import MathStepRenderer from "@/components/MathStepRenderer";
import { StepItem } from "@/lib/types";

interface InteractiveTopic {
  id: string;
  code: string;
  subject: string;
  topic: string;
  spokenQuery: string;
  spokenAnswer: string;
  facultyTelemetry: {
    inquiryCount: number;
    courseCode: string;
    identifiedRootCause: string;
    alertStatus: string;
  };
  steps: StepItem[];
}

const TOPICS: InteractiveTopic[] = [
  {
    id: "linear-algebra",
    code: "MATH 201",
    subject: "Linear Algebra",
    topic: "Eigenvalues & Characteristic Equation",
    spokenQuery: "Why do we subtract lambda times the identity matrix when finding eigenvalues?",
    spokenAnswer:
      "When we state Av = λv, we rewrite it as Av - λIv = 0, giving (A - λI)v = 0. For non-zero eigenvectors v to exist, the null space of (A - λI) must contain non-trivial vectors, requiring det(A - λI) = 0.",
    facultyTelemetry: {
      inquiryCount: 19,
      courseCode: "MATH 201 • B.Tech Sem 3",
      identifiedRootCause: "Confusion between matrix scalar multiplication and identity subtraction",
      alertStatus: "SPIKE DETECTED",
    },
    steps: [
      {
        step_number: 1,
        title: "Eigenvector Definition",
        latex: "A v = \\lambda v \\quad (v \\neq 0)",
        explanation: "An eigenvector v changes only by a scalar factor λ when linear transformation A is applied.",
      },
      {
        step_number: 2,
        title: "Matrix Form via Identity Operator",
        latex: "A v - \\lambda I v = 0 \\implies (A - \\lambda I) v = 0",
        explanation: "Because λ is a scalar and A is a matrix, λ must multiply the identity matrix I of matching rank.",
      },
      {
        step_number: 3,
        title: "Non-Trivial Nullspace Condition",
        latex: "\\det(A - \\lambda I) = 0",
        explanation: "If (A - λI) were invertible, v would be forced to 0. Hence the determinant must equal zero.",
      },
    ],
  },
  {
    id: "signals",
    code: "ECE 301",
    subject: "Signals & Systems",
    topic: "Continuous-Time Fourier Duality",
    spokenQuery: "How does the duality property relate rectangular pulses in time to sync functions in frequency?",
    spokenAnswer:
      "Duality states that if x(t) transforms to X(ω), then X(t) transforms to 2π x(-ω). A rectangular pulse in time yields a sinc in frequency; by duality, a sinc pulse in time yields a rectangular spectrum in frequency.",
    facultyTelemetry: {
      inquiryCount: 14,
      courseCode: "ECE 301 • B.Tech Sem 4",
      identifiedRootCause: "Scaling factor 2π misplacement during inverse transformation",
      alertStatus: "SPIKE DETECTED",
    },
    steps: [
      {
        step_number: 1,
        title: "Forward Fourier Transform",
        latex: "X(\\omega) = \\int_{-\\infty}^{\\infty} x(t) e^{-j\\omega t} \\, dt",
        explanation: "Decomposes a continuous-time signal into its constituent complex sinusoidal frequencies.",
      },
      {
        step_number: 2,
        title: "Rectangular Pulse Transform",
        latex: "x(t) = \\text{rect}\\left(\\frac{t}{T}\\right) \\longleftrightarrow X(\\omega) = T \\cdot \\text{sinc}\\left(\\frac{\\omega T}{2\\pi}\\right)",
        explanation: "Sharp time-domain boundaries produce infinite spectral harmonics with decaying sinc lobes.",
      },
      {
        step_number: 3,
        title: "Duality Symmetry Application",
        latex: "x(t) \\longleftrightarrow X(\\omega) \\implies X(t) \\longleftrightarrow 2\\pi x(-\\omega)",
        explanation: "Swapping time and frequency domains preserves algebraic symmetry up to the 2π radian normalization.",
      },
    ],
  },
  {
    id: "semiconductors",
    code: "EE 204",
    subject: "Solid State Devices",
    topic: "MOSFET Saturation Current",
    spokenQuery: "Why does MOSFET drain current pinch off and saturate instead of increasing indefinitely with Vds?",
    spokenAnswer:
      "When Vds reaches Vgs - Vth, the inversion channel thickness at the drain edge drops to zero (pinch-off). Further increases in Vds expand the depletion region near the drain, while the channel potential difference remains pinned.",
    facultyTelemetry: {
      inquiryCount: 11,
      courseCode: "EE 204 • B.Tech Sem 4",
      identifiedRootCause: "Conflation between channel pinch-off and carrier velocity saturation",
      alertStatus: "ELEVATED INQUIRIES",
    },
    steps: [
      {
        step_number: 1,
        title: "Pinch-off Criterion",
        latex: "V_{DS} \\ge V_{GS} - V_{TH}",
        explanation: "The gate-to-channel potential at the drain side drops below the threshold voltage required for carrier inversion.",
      },
      {
        step_number: 2,
        title: "Square-Law Saturation Equation",
        latex: "I_D = \\frac{1}{2} \\mu_n C_{ox} \\frac{W}{L} (V_{GS} - V_{TH})^2 \\left(1 + \\lambda V_{DS}\\right)",
        explanation: "Current becomes weakly dependent on Vds, governed primarily by the channel-length modulation factor λ.",
      },
    ],
  },
];

export default function Home() {
  const [selectedTopic, setSelectedTopic] = useState<InteractiveTopic>(TOPICS[0]);
  const [activeConsoleView, setActiveConsoleView] = useState<"student" | "faculty">("student");
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Editorial Header / Masthead */}
      <div className="border-b-2 border-stone-950 pb-6 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-[11px] text-stone-500 uppercase tracking-widest pb-3 border-b border-stone-200">
          <span>VOL. 01 • DOCUMENTATION & TELEMETRY</span>
          <span>AUTONOMOUS ACADEMIC REASONING PROTOCOL</span>
          <span>NEW DELHI • BENGALURU</span>
        </div>

        <div className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8">
            <span className="editorial-kicker block mb-2">
              ACADEMIC VOICE INFRASTRUCTURE FOR STEM
            </span>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal tracking-tight text-stone-950 leading-[1.05]">
              The Lecture Hall Is Silent. <br />
              <span className="text-red-600 font-serif italic">The Doubts Are Not.</span>
            </h1>
          </div>
          <div className="lg:col-span-4 space-y-4">
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
              In a 120-student engineering hall, silence rarely means mastery. TUTO bridges vocal doubt resolution and anonymous lecture telemetry: students speak their mathematical confusion without hesitation, while professors receive instant concept confusion maps with zero student identities exposed.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/tutor"
                className="editorial-btn editorial-btn-primary px-5 py-2.5 text-xs font-mono uppercase tracking-wider inline-flex items-center gap-2"
              >
                <span>Launch Voice Tutor</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/faculty"
                className="editorial-btn editorial-btn-secondary px-5 py-2.5 text-xs font-mono uppercase tracking-wider inline-flex items-center gap-2"
              >
                <Activity className="h-3.5 w-3.5 text-red-600" />
                <span>Confusion Map</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Tabular Verified Technical Specification Strip */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 border-t border-stone-200 divide-x divide-y md:divide-y-0 divide-stone-200 font-mono text-xs">
          <div className="p-3 bg-stone-50/60">
            <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Voice Processing</p>
            <p className="font-bold text-stone-900 mt-1">Client-Side Ephemeral</p>
            <p className="text-[10px] text-stone-500 mt-0.5">Zero audio stored on disk</p>
          </div>
          <div className="p-3 bg-stone-50/60">
            <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Reasoning Core</p>
            <p className="font-bold text-stone-900 mt-1">LaTeX Symbolic Engine</p>
            <p className="text-[10px] text-stone-500 mt-0.5">Formal mathematical proofs</p>
          </div>
          <div className="p-3 bg-stone-50/60">
            <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Faculty Relay</p>
            <p className="font-bold text-stone-900 mt-1">Blind Aggregation</p>
            <p className="text-[10px] text-stone-500 mt-0.5">Zero student IDs transmitted</p>
          </div>
          <div className="p-3 bg-stone-50/60">
            <p className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Compliance</p>
            <p className="font-bold text-stone-900 mt-1">DPDP 2023 Statutory</p>
            <p className="text-[10px] text-stone-500 mt-0.5">Encrypted institutional sovereignty</p>
          </div>
        </div>
      </div>

      {/* Interactive Feature: Live Reasoning & Telemetry Workbench */}
      <section className="mb-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-red-600 rounded-none inline-block" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-red-600 font-bold">
                INTERACTIVE CONSOLE SIMULATOR
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-stone-950 mt-1">
              Test Real STEM Derivations & Telemetry Routing
            </h2>
          </div>

          {/* Perspective Switcher */}
          <div className="flex items-center border border-stone-300 bg-stone-100 p-0.5 font-mono text-xs">
            <button
              onClick={() => setActiveConsoleView("student")}
              className={`px-3 py-1.5 uppercase transition-all ${
                activeConsoleView === "student"
                  ? "bg-stone-950 text-white font-bold"
                  : "text-stone-600 hover:text-stone-950"
              }`}
            >
              1. Student Voice View
            </button>
            <button
              onClick={() => setActiveConsoleView("faculty")}
              className={`px-3 py-1.5 uppercase transition-all ${
                activeConsoleView === "faculty"
                  ? "bg-red-600 text-white font-bold"
                  : "text-stone-600 hover:text-stone-950"
              }`}
            >
              2. Faculty Pulse View
            </button>
          </div>
        </div>

        {/* Topic Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4 font-mono text-xs">
          {TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              className={`text-left p-3 border transition-all ${
                selectedTopic.id === topic.id
                  ? "border-stone-950 bg-stone-950 text-white"
                  : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] mb-1 opacity-80">
                <span>{topic.code}</span>
                <span>{topic.subject}</span>
              </div>
              <p className="font-bold tracking-tight text-xs">{topic.topic}</p>
            </button>
          ))}
        </div>

        {/* Interactive Console Workspace */}
        <div className="border border-stone-200 bg-white p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {activeConsoleView === "student" ? (
              <motion.div
                key={`student-${selectedTopic.id}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Simulated Spoken Ingestion Bar */}
                <div className="border border-stone-200 bg-stone-50 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3 mb-3">
                    <div className="flex items-center gap-2 font-mono text-xs text-stone-600">
                      <span className="h-2 w-2 bg-red-600 rounded-none animate-pulse" />
                      <span className="font-bold text-stone-900 uppercase">Spoken Query Ingestion:</span>
                      <span className="text-stone-500">{selectedTopic.subject}</span>
                    </div>

                    {/* Audio Playback Simulator */}
                    <button
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="inline-flex items-center gap-2 border border-stone-300 bg-white px-3 py-1 font-mono text-[11px] uppercase text-stone-800 hover:border-stone-900 transition-colors"
                    >
                      <Volume2 className={`h-3.5 w-3.5 ${isPlayingAudio ? "text-red-600 animate-bounce" : "text-stone-600"}`} />
                      <span>{isPlayingAudio ? "Audio Playing..." : "Auditory Playback"}</span>
                    </button>
                  </div>

                  <p className="text-sm font-serif italic text-stone-900 leading-relaxed">
                    &ldquo;{selectedTopic.spokenQuery}&rdquo;
                  </p>

                  {/* Dynamic Waveform Visualizer */}
                  <div className="mt-3 flex items-center gap-1 h-5 overflow-hidden">
                    {[12, 28, 16, 36, 20, 44, 24, 18, 38, 14, 48, 22, 16, 30, 24, 40, 18, 32].map((height, i) => (
                      <motion.span
                        key={i}
                        animate={{
                          height: isPlayingAudio ? [8, height, 10] : 8,
                          backgroundColor: isPlayingAudio ? "#dc2626" : "#a8a29e",
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8 + (i % 4) * 0.2,
                          ease: "easeInOut",
                        }}
                        className="w-1 bg-stone-400 rounded-none"
                      />
                    ))}
                    <span className="ml-3 font-mono text-[10px] text-stone-500 uppercase tracking-wider">
                      {isPlayingAudio ? "Streaming Spoken Synthesis • 1.1x Rate" : "Acoustic Signal Parsed"}
                    </span>
                  </div>
                </div>

                {/* Explanation text */}
                <div className="p-4 border-l-2 border-stone-950 bg-stone-50/50">
                  <p className="font-mono text-[10px] text-stone-500 uppercase tracking-widest font-bold mb-1">
                    Spoken Synthesizer Explanation
                  </p>
                  <p className="text-xs text-stone-800 leading-relaxed">
                    {selectedTopic.spokenAnswer}
                  </p>
                </div>

                {/* Step-by-Step Mathematical Derivation */}
                <div>
                  <div className="flex items-center justify-between mb-3 border-b border-stone-200 pb-2">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-stone-900">
                      Step-by-Step Formal Mathematical Derivation
                    </span>
                    <span className="font-mono text-[10px] text-stone-500 uppercase">
                      LaTeX Verified
                    </span>
                  </div>
                  <MathStepRenderer steps={selectedTopic.steps} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`faculty-${selectedTopic.id}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Faculty Anonymity Header */}
                <div className="border border-stone-200 bg-stone-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="craft-badge craft-badge-red text-[10px] font-bold">
                      {selectedTopic.facultyTelemetry.alertStatus}
                    </span>
                    <h3 className="font-mono font-bold text-sm text-stone-900 mt-1">
                      {selectedTopic.facultyTelemetry.courseCode}
                    </h3>
                  </div>
                  <div className="font-mono text-xs text-right">
                    <span className="text-2xl font-bold text-red-600">
                      {selectedTopic.facultyTelemetry.inquiryCount}
                    </span>
                    <span className="text-stone-500 ml-1.5 uppercase text-[10px]">Stuck Students</span>
                  </div>
                </div>

                {/* Root Cause Analysis Matrix */}
                <div className="border border-stone-200 p-4 space-y-2">
                  <p className="font-mono text-[10px] text-stone-500 uppercase tracking-widest font-bold">
                    Aggregated Conceptual Bottleneck
                  </p>
                  <p className="text-xs text-stone-900 font-mono font-semibold">
                    {selectedTopic.facultyTelemetry.identifiedRootCause}
                  </p>
                  <p className="text-xs text-stone-600 leading-relaxed pt-1">
                    Telemetry aggregates all voice variations across this lecture cohort without storing any voiceprints, names, or roll numbers. Faculty can dispatch a targeted 60-second micro-lesson directly to stuck students.
                  </p>
                </div>

                {/* Action in Faculty View */}
                <div className="pt-2 flex items-center justify-between border-t border-stone-200">
                  <span className="font-mono text-[10px] text-stone-500 uppercase">
                    Privacy Guarantee: 0 Student IDs Transmitted
                  </span>
                  <Link
                    href="/faculty"
                    className="editorial-btn editorial-btn-red px-4 py-2 text-xs font-mono uppercase tracking-wider inline-flex items-center gap-1.5"
                  >
                    <span>Open Live Instructor Dashboard</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Structural Dispatches Section (Three Pillars) */}
      <section className="border-t-2 border-stone-950 pt-10 mb-16">
        <div className="mb-8">
          <span className="editorial-kicker block mb-1">SYSTEM ARCHITECTURE</span>
          <h2 className="text-2xl sm:text-4xl font-serif text-stone-950 font-normal">
            The Three Structural Mandates of TUTO
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Dispatch 01 */}
          <div className="border border-stone-200 p-6 space-y-4 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-3 font-mono text-[10px] text-stone-500 uppercase">
                <span>MANDATE 01</span>
                <span className="text-red-600 font-bold">SPEECH-TO-MATH</span>
              </div>
              <h3 className="text-lg font-serif font-bold text-stone-950">
                Audio-First Mathematical Reasoning
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mt-2 font-sans">
                Students formulate complex engineering questions out loud in natural cadence. The engine parses symbols, identifies the conceptual impasse, and renders synchronized LaTeX proofs with auditory explanation.
              </p>
            </div>
            <Link
              href="/tutor"
              className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-stone-900 hover:text-red-600 font-bold pt-2 border-t border-stone-100"
            >
              <span>Access Voice Tutor</span>
              <CornerDownRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Dispatch 02 */}
          <div className="border border-stone-200 p-6 space-y-4 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-3 font-mono text-[10px] text-stone-500 uppercase">
                <span>MANDATE 02</span>
                <span className="text-red-600 font-bold">TELEMETRY</span>
              </div>
              <h3 className="text-lg font-serif font-bold text-stone-950">
                Zero-Knowledge Confusion Matrices
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mt-2 font-sans">
                Lecture inquiries cluster into real-time concept heatmaps. When a cohort gets stuck on a theorem, faculty receive instant notification to course-correct lectures without identifying vulnerable students.
              </p>
            </div>
            <Link
              href="/faculty"
              className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-stone-900 hover:text-red-600 font-bold pt-2 border-t border-stone-100"
            >
              <span>View Confusion Pulse</span>
              <CornerDownRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Dispatch 03 */}
          <div className="border border-stone-200 p-6 space-y-4 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-3 font-mono text-[10px] text-stone-500 uppercase">
                <span>MANDATE 03</span>
                <span className="text-red-600 font-bold">COLLABORATION</span>
              </div>
              <h3 className="text-lg font-serif font-bold text-stone-950">
                Inter-College Peer Synthesis
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mt-2 font-sans">
                Doubts unresolved in isolation become cross-institutional collaborative discussions. Verified peer contributions earn academic reputation credits recognized across engineering universities.
              </p>
            </div>
            <Link
              href="/feed"
              className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-stone-900 hover:text-red-600 font-bold pt-2 border-t border-stone-100"
            >
              <span>Explore Public Doubts</span>
              <CornerDownRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial Final Call to Action */}
      <section className="border border-stone-950 bg-stone-950 text-white p-8 sm:p-12">
        <div className="max-w-2xl space-y-4">
          <span className="font-mono text-[11px] uppercase tracking-widest text-red-500 font-bold">
            UNIVERSITY DEPLOYMENT READY
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight leading-tight">
            Ask without hesitation. Learn with mathematical rigor.
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 leading-relaxed font-sans">
            Connect your university credentials to begin asking technical queries out loud. Built for students, verified by professors, shielded by cryptographic anonymity.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link
              href="/login"
              className="editorial-btn editorial-btn-red px-6 py-3 text-xs font-mono uppercase tracking-wider inline-flex items-center gap-2"
            >
              <span>Sign In with University ID</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/curriculum"
              className="editorial-btn bg-stone-800 text-stone-200 hover:bg-stone-700 border border-stone-700 px-6 py-3 text-xs font-mono uppercase tracking-wider"
            >
              <span>Explore Curriculum Index</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
