"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { User, Question } from "@/lib/types";
import {
  Mic,
  MessageSquare,
  Users,
  Activity,
  Award,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  HelpCircle,
  PlayCircle,
  Video,
} from "lucide-react";
import PlannedFeatureModal from "@/components/PlannedFeatureModal";

export default function StudentDashboard() {
  const [user, setUser] = useState<User>(apiClient.getCurrentUser());
  const [recentQuestions, setRecentQuestions] = useState<Question[]>([]);
  const [plannedModal, setPlannedModal] = useState<{
    open: boolean;
    title: string;
    desc: string;
    icon: "video" | "lecture";
  }>({
    open: false,
    title: "",
    desc: "",
    icon: "lecture",
  });

  useEffect(() => {
    setUser(apiClient.getCurrentUser());
    apiClient.getFeed().then((items) => {
      setRecentQuestions(items.slice(0, 3));
    });
  }, []);

  const dailyPoints = Math.min(user.points % 100 + 45, 100);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-lg mb-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-200 backdrop-blur-md mb-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Student Learning Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {user.display_name}!
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1">
              {user.college} • Ready to solve doubts and learn together.
            </p>
          </div>

          {/* Daily Points Meter */}
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md min-w-[260px]">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                <Sparkles className="h-4 w-4" />
                <span>Daily Academic Credits</span>
              </div>
              <span className="font-bold text-white">{dailyPoints} / 100 pts</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all duration-500"
                style={{ width: `${dailyPoints}%` }}
              />
            </div>
            <p className="text-[10px] text-indigo-200 mt-1.5">
              Reset every midnight. Daily cap protects balanced learning.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Core Pillars Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Your Learning Pillars</h2>
          <span className="text-xs text-slate-500">Color-coded by category</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. AI Tutoring (Blue) */}
          <Link
            href="/tutor"
            className="group rounded-2xl border-2 border-blue-200 bg-white p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                  <Mic className="h-5 w-5" />
                </div>
                <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-800">
                  Blue Pillar
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                AI Voice Tutor
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">
                Ask math & engineering doubts out loud. Receive step-by-step KaTeX derivations.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-semibold text-blue-600">
              <span>Ask a Doubt</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 2. College Projects (Green) */}
          <Link
            href="/projects"
            className="group rounded-2xl border-2 border-emerald-200 bg-white p-5 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Users className="h-5 w-5" />
                </div>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Green Pillar
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                College Projects
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">
                Find teams, collaborate cross-college, and earn verified project points.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-600">
              <span>Browse Projects</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 3. Confusion Map (Purple) */}
          <Link
            href="/confusion"
            className="group rounded-2xl border-2 border-purple-200 bg-white p-5 shadow-xs hover:border-purple-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
                  <Activity className="h-5 w-5" />
                </div>
                <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-800">
                  Purple Pillar
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                Confusion Map
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">
                See what peers are struggling with and send confusion signals to get micro-lessons.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-semibold text-purple-600">
              <span>View Map</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 4. Gamification (Orange) */}
          <Link
            href="/leaderboard"
            className="group rounded-2xl border-2 border-amber-200 bg-white p-5 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                  <Award className="h-5 w-5" />
                </div>
                <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Orange Pillar
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                Academic Leaderboard
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">
                College & national rankings. Total points: <strong>{user.points} pts</strong>.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-semibold text-amber-600">
              <span>View Standings</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Two Column Layout: Community Feed & Planned Features */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Active Doubts & Feed */}
        <div className="lg:col-span-8 space-y-6">
          <div className="craft-panel p-6 shadow-sm border border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Community Doubts</h3>
                <p className="text-xs text-slate-500">Solve peer questions to earn +10 academic credits</p>
              </div>
              <Link
                href="/feed"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View All Feed</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentQuestions.map((q) => (
                <Link
                  key={q.id}
                  href={`/feed`}
                  className="block rounded-xl border border-slate-200/80 p-3.5 hover:border-indigo-300 hover:bg-slate-50/50 transition-all"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/50">
                      {q.subject}
                    </span>
                    <span className="text-[10px] text-slate-400">{q.college}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 mt-1 line-clamp-2">
                    {q.text}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span>Concept: {q.concept}</span>
                    <span className="font-medium text-emerald-600">
                      {q.answers_count || 1} answers
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Planned Features & Quick Shortcuts */}
        <div className="lg:col-span-4 space-y-6">
          {/* Planned Features (Dashed Borders) */}
          <div className="rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/30 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-indigo-900">Planned Features</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">
                Roadmap
              </span>
            </div>

            <div className="space-y-3">
              <button
                onClick={() =>
                  setPlannedModal({
                    open: true,
                    title: "Live Lectures (Student View)",
                    desc: "Join scheduled live lectures from faculty across universities. Features interactive doubt pings, synchronized slide notes, and live confusion feedback.",
                    icon: "lecture",
                  })
                }
                className="w-full text-left rounded-xl border border-indigo-200 bg-white p-3 hover:border-indigo-400 hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Video className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Live Lectures
                    </p>
                    <p className="text-[10px] text-slate-500">Interactive live classrooms</p>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() =>
                  setPlannedModal({
                    open: true,
                    title: "AI Lecture Recap Video",
                    desc: "Missed class? TUTO AI synthesizes 60-minute recorded lectures into high-yield 5-minute visual recap animations with key formulas highlighted.",
                    icon: "video",
                  })
                }
                className="w-full text-left rounded-xl border border-indigo-200 bg-white p-3 hover:border-indigo-400 hover:shadow-xs transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                    <PlayCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      AI Recap Videos
                    </p>
                    <p className="text-[10px] text-slate-500">Visual 5-min summaries</p>
                  </div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="craft-panel p-5 shadow-xs border border-slate-200 bg-white">
            <h4 className="text-xs font-bold text-slate-900 mb-3">Academic Navigation</h4>
            <div className="space-y-1.5 text-xs">
              <Link
                href="/curriculum"
                className="flex items-center justify-between p-2 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                  <span>Curriculum Updates</span>
                </div>
                <ChevronRight className="h-3 w-3 text-slate-300" />
              </Link>
              <Link
                href="/notifications"
                className="flex items-center justify-between p-2 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Activity & Notifications</span>
                </div>
                <ChevronRight className="h-3 w-3 text-slate-300" />
              </Link>
              <Link
                href="/profile"
                className="flex items-center justify-between p-2 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-slate-400" />
                  <span>My Profile & Stats</span>
                </div>
                <ChevronRight className="h-3 w-3 text-slate-300" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <PlannedFeatureModal
        isOpen={plannedModal.open}
        onClose={() => setPlannedModal((prev) => ({ ...prev, open: false }))}
        featureTitle={plannedModal.title}
        featureDescription={plannedModal.desc}
        featureIcon={plannedModal.icon}
      />
    </div>
  );
}
