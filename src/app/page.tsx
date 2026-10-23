"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Activity, Volume2, Shield, CornerDownRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { gsap } from "gsap";
import MathStepRenderer from "@/components/MathStepRenderer";
import Logo from "@/components/Logo";
import HeroTelemetryCanvas from "@/components/HeroTelemetryCanvas";
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
      identifiedRootCause: "Matrix scalar multiplication vs. identity subtraction",
      alertStatus: "SPIKE DETECTED",
    },
    steps: [
      {
        step_number: 1,
        title: "Eigenvector Definition",
        latex: "A v = \\lambda v \\quad (v \\neq 0)",
        explanation: "An eigenvector v changes only by a scalar factor λ under linear transformation A.",
      },
      {
        step_number: 2,
        title: "Identity Matrix Operator",
        latex: "A v - \\lambda I v = 0 \\implies (A - \\lambda I) v = 0",
        explanation: "Because λ is a scalar, it must multiply identity matrix I of matching rank.",
      },
      {
        step_number: 3,
        title: "Non-Trivial Nullspace",
        latex: "\\det(A - \\lambda I) = 0",
        explanation: "If (A - λI) were invertible, v would collapse to 0. Hence determinant equals zero.",
      },
    ],
  },
  {
    id: "signals",
    code: "ECE 301",
    subject: "Signals & Systems",
    topic: "Continuous-Time Fourier Duality",
    spokenQuery: "How does duality relate rectangular time pulses to sinc frequency spectra?",
    spokenAnswer:
      "Duality states that if x(t) transforms to X(ω), then X(t) transforms to 2π x(-ω). A rectangular gate in time yields a sinc in frequency; by duality, a sinc in time yields a rectangular spectrum.",
    facultyTelemetry: {
      inquiryCount: 14,
      courseCode: "ECE 301 • B.Tech Sem 4",
      identifiedRootCause: "2π normalization placement in inverse transform",
      alertStatus: "SPIKE DETECTED",
    },
    steps: [
      {
        step_number: 1,
        title: "Forward Transform",
        latex: "X(\\omega) = \\int_{-\\infty}^{\\infty} x(t) e^{-j\\omega t} \\, dt",
        explanation: "Decomposes continuous-time signals into complex sinusoidal frequencies.",
      },
      {
        step_number: 2,
        title: "Rectangular Pulse Pair",
        latex: "x(t) = \\text{rect}(t/T) \\longleftrightarrow X(\\omega) = T \\cdot \\text{sinc}(\\omega T / 2\\pi)",
        explanation: "Sharp time-domain boundaries produce infinite sinc harmonic lobes.",
      },
      {
        step_number: 3,
        title: "Duality Theorem",
        latex: "x(t) \\longleftrightarrow X(\\omega) \\implies X(t) \\longleftrightarrow 2\\pi x(-\\omega)",
        explanation: "Swapping time and frequency preserves symmetry up to the 2π radian constant.",
      },
    ],
  },
  {
    id: "semiconductors",
    code: "EE 204",
    subject: "Solid State Devices",
    topic: "MOSFET Saturation Current",
    spokenQuery: "Why does MOSFET drain current pinch off and saturate instead of increasing indefinitely?",
    spokenAnswer:
      "When Vds reaches Vgs - Vth, the inversion channel thickness at the drain edge drops to zero. Further increases in Vds expand the depletion region near the drain, pinning the channel voltage.",
    facultyTelemetry: {
      inquiryCount: 11,
      courseCode: "EE 204 • B.Tech Sem 4",
      identifiedRootCause: "Channel pinch-off vs. carrier velocity saturation",
      alertStatus: "ELEVATED",
    },
    steps: [
      {
        step_number: 1,
        title: "Pinch-off Criterion",
        latex: "V_{DS} \\ge V_{GS} - V_{TH}",
        explanation: "Gate-to-channel potential at drain drops below the inversion threshold.",
      },
      {
        step_number: 2,
        title: "Square-Law Saturation",
        latex: "I_D = \\frac{1}{2} \\mu_n C_{ox} \\frac{W}{L} (V_{GS} - V_{TH})^2",
        explanation: "Current saturates and becomes weakly dependent on drain voltage.",
      },
    ],
  },
];

export default function Home() {
  const [selectedTopic, setSelectedTopic] = useState<InteractiveTopic>(TOPICS[0]);
  const [activeConsoleView, setActiveConsoleView] = useState<"student" | "faculty">("student");
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // GSAP animation refs
  const heroRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);
  const kickerRef = useRef<HTMLSpanElement | null>(null);
  const headlineRef = useRef<HTMLHeadingElement | null>(null);
  const descRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const specsRef = useRef<HTMLDivElement | null>(null);
  const derivationContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Initial Hero Staggered Reveal Sequence
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (logoRef.current) {
        tl.fromTo(
          logoRef.current,
          { scale: 0.8, opacity: 0, y: -10 },
          { scale: 1, opacity: 1, y: 0, duration: 0.85, ease: "back.out(1.4)" }
        );
      }

      if (kickerRef.current) {
        tl.fromTo(
          kickerRef.current,
          { opacity: 0, letterSpacing: "0.25em", y: -6 },
          { opacity: 1, letterSpacing: "0.15em", y: 0, duration: 0.6 },
          "-=0.4"
        );
      }

      if (headlineRef.current) {
        tl.fromTo(
          headlineRef.current,
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.85 },
          "-=0.3"
        );
      }

      if (descRef.current) {
        tl.fromTo(
          descRef.current,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7 },
          "-=0.4"
        );
      }

      if (ctaRef.current) {
        tl.fromTo(
          ctaRef.current.children,
          { y: 12, opacity: 0, scale: 0.96 },
          { y: 0, opacity: 1, scale: 1, stagger: 0.12, duration: 0.55 },
          "-=0.3"
        );
      }

      if (specsRef.current) {
        tl.fromTo(
          specsRef.current.children,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, stagger: 0.08, duration: 0.6 },
          "-=0.2"
        );
      }

      // 2. Dispatches entrance
      gsap.fromTo(
        ".dispatch-card",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.12,
          duration: 0.75,
          ease: "power2.out",
          delay: 0.4,
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // GSAP animation on derivation steps when selectedTopic changes
  useEffect(() => {
    if (derivationContainerRef.current) {
      gsap.fromTo(
        derivationContainerRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [selectedTopic]);

  return (
    <div ref={heroRef} className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8 space-y-12">
      {/* Editorial Hero with Senior-Dev-Coded Telemetry Canvas */}
      <section className="relative overflow-hidden border border-stone-800 bg-stone-950 text-white min-h-[460px] flex flex-col justify-between">
        {/* Bespoke Mathematical & Audio Telemetry Canvas */}
        <HeroTelemetryCanvas />

        {/* Hero Content (Centered with Official Logo in the Middle) */}
        <div className="relative z-10 px-6 py-16 sm:py-24 text-center max-w-4xl mx-auto space-y-6">
          {/* Official Logo in the Middle */}
          <div ref={logoRef} className="flex justify-center mb-2">
            <Logo height={58} variant="white" />
          </div>

          <span ref={kickerRef} className="editorial-kicker text-red-500 block text-xs tracking-widest font-mono">
            VOL. 01 • ACADEMIC AUDIO TELEMETRY SYSTEM
          </span>

          <h1 ref={headlineRef} className="text-4xl sm:text-6xl lg:text-7xl font-serif font-normal tracking-tight text-white leading-[1.05]">
            The Lecture Hall Is Silent. <br />
            <span className="text-red-500 font-serif italic">The Doubts Are Not.</span>
          </h1>

          <p ref={descRef} className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto font-sans leading-relaxed">
            Audio-first mathematical reasoning for students. Blind confusion telemetry for faculty. Zero personal identities exposed.
          </p>

          <div ref={ctaRef} className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Link
              href="/tutor"
              className="editorial-btn editorial-btn-red px-6 py-3 text-xs font-mono uppercase tracking-wider inline-flex items-center gap-2 transition-transform hover:scale-[1.02]"
            >
              <span>Launch Voice Tutor</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/faculty"
              className="editorial-btn bg-stone-900/90 text-white hover:bg-stone-800 border border-stone-700 px-6 py-3 text-xs font-mono uppercase tracking-wider inline-flex items-center gap-2 transition-transform hover:scale-[1.02]"
            >
              <Activity className="h-3.5 w-3.5 text-red-500" />
              <span>Confusion Map</span>
            </Link>
          </div>
        </div>

        {/* Tabular Technical Specification Strip */}
        <div ref={specsRef} className="relative z-10 grid grid-cols-2 md:grid-cols-4 border-t border-stone-800 bg-stone-950/95 divide-x divide-y md:divide-y-0 divide-stone-800 font-mono text-xs">
          <div className="p-3.5 text-center">
            <p className="text-[10px] text-stone-400 uppercase tracking-wider">Voice Pipeline</p>
            <p className="font-bold text-white mt-0.5">Ephemeral RAM Buffer</p>
          </div>
          <div className="p-3.5 text-center">
            <p className="text-[10px] text-stone-400 uppercase tracking-wider">Reasoning Core</p>
            <p className="font-bold text-white mt-0.5">LaTeX Symbolic Proofs</p>
          </div>
          <div className="p-3.5 text-center">
            <p className="text-[10px] text-stone-400 uppercase tracking-wider">Telemetry Relay</p>
            <p className="font-bold text-white mt-0.5">Zero Student IDs</p>
          </div>
          <div className="p-3.5 text-center">
            <p className="text-[10px] text-stone-400 uppercase tracking-wider">Governance</p>
            <p className="font-bold text-white mt-0.5">DPDP 2023 Compliant</p>
          </div>
        </div>
      </section>

      {/* Interactive Feature: Live Reasoning & Telemetry Console */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4 border-b border-stone-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-red-600 rounded-none inline-block" />
              <span className="font-mono text-[11px] uppercase tracking-widest text-red-600 font-bold">
                INTERACTIVE CONSOLE SIMULATOR
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-stone-950 mt-1">
              Test Real STEM Derivations & Telemetry
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
              Student View
            </button>
            <button
              onClick={() => setActiveConsoleView("faculty")}
              className={`px-3 py-1.5 uppercase transition-all ${
                activeConsoleView === "faculty"
                  ? "bg-red-600 text-white font-bold"
                  : "text-stone-600 hover:text-stone-950"
              }`}
            >
              Faculty View
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
              <p className="font-bold text-xs">{topic.topic}</p>
            </button>
          ))}
        </div>

        {/* Interactive Console Body */}
        <div className="border border-stone-200 bg-white p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {activeConsoleView === "student" ? (
              <motion.div
                key={`student-${selectedTopic.id}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* Simulated Audio Bar */}
                <div className="border border-stone-200 bg-stone-50 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-2 mb-2">
                    <div className="flex items-center gap-2 font-mono text-xs text-stone-600">
                      <span className="h-2 w-2 bg-red-600 rounded-none animate-pulse" />
                      <span className="font-bold text-stone-900 uppercase">Spoken Query:</span>
                      <span>{selectedTopic.subject}</span>
                    </div>

                    <button
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="inline-flex items-center gap-1.5 border border-stone-300 bg-white px-2.5 py-1 font-mono text-[11px] uppercase text-stone-800 hover:border-stone-900 transition-colors"
                    >
                      <Volume2 className={`h-3 w-3 ${isPlayingAudio ? "text-red-600" : "text-stone-600"}`} />
                      <span>{isPlayingAudio ? "Pause Audio" : "Play Spoken Audio"}</span>
                    </button>
                  </div>

                  <p className="text-sm font-serif italic text-stone-900 leading-relaxed">
                    &ldquo;{selectedTopic.spokenQuery}&rdquo;
                  </p>

                  {/* Audio Waveform */}
                  <div className="mt-3 flex items-center gap-1 h-4">
                    {[12, 28, 16, 36, 20, 44, 24, 18, 38, 14, 48, 22, 16, 30].map((height, i) => (
                      <motion.span
                        key={i}
                        animate={{
                          height: isPlayingAudio ? [6, height, 8] : 6,
                          backgroundColor: isPlayingAudio ? "#dc2626" : "#a8a29e",
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.7 + (i % 3) * 0.2,
                          ease: "easeInOut",
                        }}
                        className="w-1 bg-stone-400 rounded-none"
                      />
                    ))}
                    <span className="ml-2 font-mono text-[10px] text-stone-500 uppercase">
                      {isPlayingAudio ? "Streaming Spoken Audio" : "Audio Synthesized"}
                    </span>
                  </div>
                </div>

                {/* Mathematical Derivation */}
                <div ref={derivationContainerRef}>
                  <div className="flex items-center justify-between mb-2 border-b border-stone-200 pb-1.5">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-stone-900">
                      Step-by-Step Mathematical Derivation
                    </span>
                    <span className="font-mono text-[10px] text-stone-500 uppercase">LaTeX Verified</span>
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
                transition={{ duration: 0.15 }}
                className="space-y-5"
              >
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

                <div className="border border-stone-200 p-4 space-y-1.5">
                  <p className="font-mono text-[10px] text-stone-500 uppercase tracking-widest font-bold">
                    Conceptual Bottleneck
                  </p>
                  <p className="text-xs text-stone-900 font-mono font-semibold">
                    {selectedTopic.facultyTelemetry.identifiedRootCause}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-stone-200 font-mono text-xs">
                  <span className="text-[10px] text-stone-500 uppercase">
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

      {/* Structural Pillars (Concise & Focused) */}
      <section className="border-t-2 border-stone-950 pt-8">
        <div className="mb-6">
          <span className="editorial-kicker block mb-1">SYSTEM ARCHITECTURE</span>
          <h2 className="text-2xl sm:text-3xl font-serif text-stone-950 font-normal">
            Three Core Modules
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="dispatch-card border border-stone-200 p-5 space-y-3 bg-white flex flex-col justify-between transition-transform hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between border-b border-stone-200 pb-1.5 mb-2 font-mono text-[10px] text-stone-500 uppercase">
                <span>01</span>
                <span className="text-red-600 font-bold">VOICE + PDF</span>
              </div>
              <h3 className="text-base font-serif font-bold text-stone-950">
                Audio & Sketch Tutor
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Circle doubts on your lecture PDF with the sketch pen and ask out loud. Receive spoken explanations and mathematical proofs.
              </p>
            </div>
            <Link
              href="/tutor"
              className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-stone-900 hover:text-red-600 font-bold pt-2 border-t border-stone-100"
            >
              <span>Launch Tutor</span>
              <CornerDownRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="dispatch-card border border-stone-200 p-5 space-y-3 bg-white flex flex-col justify-between transition-transform hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between border-b border-stone-200 pb-1.5 mb-2 font-mono text-[10px] text-stone-500 uppercase">
                <span>02</span>
                <span className="text-red-600 font-bold">TELEMETRY</span>
              </div>
              <h3 className="text-base font-serif font-bold text-stone-950">
                Blind Confusion Map
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Cohort doubts cluster into concept heatmaps. Faculty adjust lecture pace with zero student identities revealed.
              </p>
            </div>
            <Link
              href="/faculty"
              className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-stone-900 hover:text-red-600 font-bold pt-2 border-t border-stone-100"
            >
              <span>View Pulse</span>
              <CornerDownRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="dispatch-card border border-stone-200 p-5 space-y-3 bg-white flex flex-col justify-between transition-transform hover:-translate-y-1">
            <div>
              <div className="flex items-center justify-between border-b border-stone-200 pb-1.5 mb-2 font-mono text-[10px] text-stone-500 uppercase">
                <span>03</span>
                <span className="text-red-600 font-bold">COLLABORATION</span>
              </div>
              <h3 className="text-base font-serif font-bold text-stone-950">
                Peer Doubts Feed
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">
                Post questions anonymously to cross-college engineering feeds. Earn academic reputation credits for verified solutions.
              </p>
            </div>
            <Link
              href="/feed"
              className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-stone-900 hover:text-red-600 font-bold pt-2 border-t border-stone-100"
            >
              <span>Explore Feed</span>
              <CornerDownRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
