"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Mic, Activity, ArrowRight, Users, Shield, ChevronRight } from "lucide-react";
import { rise } from "cube-motion";
import { Hub } from "@lucasmarkes/hairline/react";
import gsap from "gsap";

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // GSAP entrance timeline
    if (typeof window !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
        );
      }
    }

    // Cube Motion staggered card entrance
    try {
      rise(".cube-card", { stagger: 60, delay: 100 });
    } catch {}
  }, []);

  return (
    <div className="relative overflow-hidden" ref={heroRef}>
      {/* Top Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:pt-24 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-3.5 py-1 text-xs font-semibold text-indigo-700 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
              <span>Zero-judgment academic doubt resolution</span>
            </div>

            <h1
              ref={titleRef}
              className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 leading-[1.08]"
            >
              Ask out loud. <br />
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 bg-clip-text text-transparent">
                Ask without hesitation.
              </span>{" "}
              <br />
              Learn together.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              Speak your doubts privately and get step-by-step mathematical reasoning. Instructors receive
              anonymous real-time confusion telemetry to deliver targeted fixes without identifying students.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/tutor"
                className="evil-btn evil-btn-primary px-5 py-2.5 text-xs font-semibold gap-2"
              >
                <Mic className="h-4 w-4" />
                <span>Start Voice Tutor</span>
                <ArrowRight className="h-3.5 w-3.5 opacity-90" />
              </Link>

              <Link
                href="/faculty"
                className="evil-btn evil-btn-secondary px-5 py-2.5 text-xs font-semibold gap-2"
              >
                <Activity className="h-4 w-4 text-amber-600" />
                <span>Instructor Confusion Map</span>
              </Link>
            </div>

            {/* 3-Color Metrics Grid */}
            <div className="pt-8 grid grid-cols-3 gap-6 border-t border-slate-200">
              <div>
                <p className="text-2xl font-bold tracking-tight text-indigo-600">0%</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Identity Exposed</p>
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight text-amber-600">Real-time</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Confusion Pulse</p>
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight text-emerald-600">100%</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Verified Solutions</p>
              </div>
            </div>
          </div>

          {/* Right Column: Architecture Hub Card */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full craft-panel p-6 shadow-lg flex flex-col items-center">
              <div className="flex items-center justify-between w-full border-b border-slate-100 pb-3 mb-2">
                <span className="text-[11px] font-semibold text-slate-900 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-indigo-600" />
                  Anonymous Telemetry Graph
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Zero-Knowledge Relay</span>
              </div>

              {/* Interactive Hairline Hub */}
              <div className="w-full h-56 flex items-center justify-center overflow-hidden">
                <Hub className="w-full max-w-[280px] text-indigo-600" />
              </div>

              <p className="text-[11px] text-center text-slate-500 mt-2">
                Routing nodes cluster private student questions into real-time confusion patterns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Grid with 3-Color Coding */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 border-t border-slate-200">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Core Capabilities</h2>
          <p className="text-sm text-slate-600 mt-2">
            Designed to bridge the gap between silent lecture confusion and rapid conceptual mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Electric Indigo */}
          <div className="cube-card craft-panel p-6 hover:shadow-md hover:border-indigo-200 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 mb-4">
              <Mic className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">AI Voice Tutor</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Ask questions out loud in natural language. Review your transcript, receive spoken audio, and follow
              structured LaTeX mathematical derivations step by step.
            </p>
            <Link href="/tutor" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 mt-4 hover:text-indigo-700">
              Open Voice Tutor <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Card 2: Solar Amber */}
          <div className="cube-card craft-panel p-6 hover:shadow-md hover:border-amber-200 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-600 mb-4">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Instructor Confusion Map</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Instructors monitor live concept confusion clusters in real time. Send a single 60-second micro-lesson
              that automatically routes to all stuck students.
            </p>
            <Link href="/faculty" className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 mt-4 hover:text-amber-800">
              View Confusion Map <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Card 3: Fresh Emerald */}
          <div className="cube-card craft-panel p-6 hover:shadow-md hover:border-emerald-200 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 mb-4">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Inter-College Project Hub</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Connect with engineering peers across institutions. Showcase technical projects, discover collaborators,
              and earn verified academic contribution badges.
            </p>
            <Link href="/projects" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 mt-4 hover:text-emerald-800">
              Explore Projects <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
