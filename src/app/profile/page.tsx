"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { User, Question, Project } from "@/lib/types";
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  FolderGit2,
  MessageSquare,
  Lock,
} from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState<User>(apiClient.getCurrentUser());
  const [activeTab, setActiveTab] = useState<"questions" | "answers" | "projects" | "points">("questions");
  const [myQuestions, setMyQuestions] = useState<Question[]>([]);
  const [myProjects, setMyProjects] = useState<Project[]>([]);

  useEffect(() => {
    setUser(apiClient.getCurrentUser());
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const [feed, projects] = await Promise.all([
      apiClient.getFeed(),
      apiClient.getProjects(),
    ]);
    setMyQuestions(feed);
    setMyProjects(projects);
  };

  const pointLogs = [
    { action: "Community Doubt Shared (+5 pts)", points: 5, time: "22 mins ago" },
    { action: "Peer Solution Upvoted (+2 pts)", points: 2, time: "1 hour ago" },
    { action: "Staff Verified Instructor Solution (+25 pts)", points: 25, time: "1 day ago" },
    { action: "Project Collaboration Confirmed (+20 pts)", points: 20, time: "2 days ago" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 mb-16 md:mb-0">
      {/* Header Profile Card */}
      <div className="craft-panel p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center bg-stone-900 text-white font-serif text-xl font-bold">
              {user.display_name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-stone-900">{user.display_name}</h1>
                <span className="craft-badge craft-badge-neutral text-[10px]">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-1">
                <GraduationCap className="h-3.5 w-3.5 text-red-600" />
                {user.college}
              </p>
            </div>
          </div>

          {/* Points summary box */}
          <div className="border border-stone-200 bg-stone-50 p-4 text-center sm:min-w-[140px]">
            <span className="text-[10px] uppercase tracking-wider text-stone-600 font-bold block">
              Total Points
            </span>
            <span className="text-3xl font-black text-stone-900 tracking-tight">{user.points}</span>
            <span className="text-[10px] text-stone-500 font-medium block mt-0.5">Academic Credits</span>
          </div>
        </div>
      </div>

      {/* Profile Subtabs */}
      <div className="flex border-b border-stone-200 mb-6 gap-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab("questions")}
          className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-all ${
            activeTab === "questions"
              ? "border-red-600 text-red-600 font-bold"
              : "border-transparent text-stone-500 hover:text-stone-900"
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>My Doubts ({myQuestions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("projects")}
          className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-all ${
            activeTab === "projects"
              ? "border-red-600 text-red-600 font-bold"
              : "border-transparent text-stone-500 hover:text-stone-900"
          }`}
        >
          <FolderGit2 className="h-3.5 w-3.5" />
          <span>Collaborations ({myProjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("points")}
          className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-all ${
            activeTab === "points"
              ? "border-red-600 text-red-600 font-bold"
              : "border-transparent text-stone-500 hover:text-stone-900"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Points Ledger</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          {myQuestions.map((q) => (
            <div
              key={q.id}
              className="craft-panel p-5 transition-all hover:border-stone-400"
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="craft-badge craft-badge-neutral text-[10px]">
                  {q.concept}
                </span>
                <span className="text-[11px] text-stone-500 flex items-center gap-1">
                  {q.visibility === "anonymous" ? (
                    <span className="text-stone-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-stone-500" /> Anonymous
                    </span>
                  ) : (
                    <span className="text-stone-500 font-medium flex items-center gap-1">
                      <Lock className="h-3 w-3 text-stone-500" /> Private
                    </span>
                  )}
                </span>
              </div>
              <p className="text-sm font-bold text-stone-900 tracking-tight">{q.text}</p>
              <div className="mt-3 flex items-center justify-between text-[11px] text-stone-500">
                <span className="font-medium">{q.subject}</span>
                <span className="flex items-center gap-1 font-semibold">
                  {q.resolution_status === "resolved" ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-emerald-600" /> Resolved
                    </span>
                  ) : (
                    <span className="text-stone-600 flex items-center gap-1">
                      <HelpCircle className="h-3 w-3 text-stone-500" /> Active
                    </span>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "projects" && (
        <div className="space-y-4">
          {myProjects.map((proj) => (
            <div key={proj.id} className="craft-panel p-5">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-stone-900">{proj.title}</span>
                <span className="text-[10px] text-stone-400 font-medium">{proj.created_at}</span>
              </div>
              <p className="text-xs text-stone-600 mb-3 leading-relaxed">{proj.description}</p>
              <div className="flex flex-wrap gap-1">
                {proj.tags.map((t) => (
                  <span key={t} className="craft-badge text-[9px] py-0.2">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "points" && (
        <div className="craft-panel divide-y divide-stone-100 overflow-hidden">
          {pointLogs.map((log, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 text-xs">
              <div>
                <p className="font-semibold text-stone-900">{log.action}</p>
                <p className="text-[10px] text-stone-400 font-medium">{log.time}</p>
              </div>
              <span className="craft-badge craft-badge-neutral text-xs font-bold text-red-700">
                +{log.points} pts
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
