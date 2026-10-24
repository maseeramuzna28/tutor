"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { ConceptCluster, PulseItem, ClarificationOutcome } from "@/lib/types";
import {
  Activity,
  Send,
  Sparkles,
  HelpCircle,
  ThumbsUp,
  AlertTriangle,
  Volume2,
  CheckCircle2,
  Clock,
  Radio,
  BookOpen,
} from "lucide-react";

export default function ConfusionPage() {
  const [clusters, setClusters] = useState<ConceptCluster[]>([]);
  const [pulse, setPulse] = useState<PulseItem[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<ConceptCluster | null>(null);
  const [customConfusion, setCustomConfusion] = useState("");
  const [sentNotice, setSentNotice] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<Record<string, "helped" | "still_stuck">>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [cItems, pItems] = await Promise.all([
      apiClient.getClusters(),
      apiClient.getPulse(15),
    ]);
    setClusters(cItems);
    setPulse(pItems);
    if (cItems.length > 0) {
      setSelectedCluster(cItems[0]);
    }
  };

  const handleSendConfusion = async (conceptName: string) => {
    setSentNotice(`Signaled confusion on "${conceptName}". Faculty & AI have been notified! (+5 pts)`);
    setTimeout(() => setSentNotice(null), 4000);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customConfusion.trim()) return;
    handleSendConfusion(customConfusion.trim());
    setCustomConfusion("");
  };

  const handleFeedback = (clusterId: string, status: "helped" | "still_stuck") => {
    setFeedbackStatus((prev) => ({ ...prev, [clusterId]: status }));
  };

  const handlePlayAudio = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
        return;
      }
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.0;
      utter.onend = () => setIsPlayingAudio(false);
      utter.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utter);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Page Header */}
      <div className="mb-8 border-b border-purple-200/80 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-0.5 text-xs font-semibold text-purple-700 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-purple-600 animate-pulse" />
              <span>Real-Time Academic Telemetry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Campus Confusion Map
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Anonymous concept telemetry. When multiple students get stuck, AI and faculty deliver targeted micro-lessons.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700">Live Pulse: <strong>Online</strong></span>
          </div>
        </div>
      </div>

      {/* Success Notification Toast */}
      {sentNotice && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-purple-50 border border-purple-300 p-4 text-xs font-semibold text-purple-900 shadow-sm animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0" />
          <span>{sentNotice}</span>
        </div>
      )}

      {/* Live Confusion Pulse Bar */}
      <div className="craft-panel p-5 shadow-sm border border-slate-200 bg-white mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-purple-600 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Live Confusion Spikes (Past 60 Minutes)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">Aggregated across engineering colleges</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {pulse.slice(0, 4).map((p, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-purple-100 bg-purple-50/50 p-3 hover:bg-purple-50 transition-colors"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-purple-900 truncate">{p.concept}</span>
                <span className="rounded bg-purple-200/70 px-1.5 py-0.5 text-[10px] font-bold text-purple-800">
                  {p.count} stuck
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">{p.subject}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Concept Clusters & Micro-Lesson Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Concept Clusters */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">High-Confusion Concept Clusters</h2>
            <span className="text-xs text-slate-500">Threshold: $\ge 3$ students</span>
          </div>

          <div className="space-y-3">
            {clusters.map((cluster) => {
              const isSelected = selectedCluster?.concept === cluster.concept;
              return (
                <div
                  key={cluster.concept}
                  onClick={() => setSelectedCluster(cluster)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? "border-purple-500 bg-purple-50/60 shadow-xs ring-1 ring-purple-500/30"
                      : "border-slate-200 bg-white hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{cluster.concept}</span>
                        <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                          {cluster.count} students
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{cluster.subject}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendConfusion(cluster.concept);
                      }}
                      className="rounded-lg border border-purple-200 bg-white px-2 py-1 text-[11px] font-semibold text-purple-700 hover:bg-purple-100 transition-colors shrink-0"
                    >
                      + I'm Stuck Too
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick "I am confused about..." Input Form */}
          <div className="rounded-2xl border border-dashed border-purple-300 bg-purple-50/30 p-4 mt-6">
            <h3 className="text-xs font-bold text-purple-950 mb-1">
              Don't see your topic above?
            </h3>
            <p className="text-[11px] text-slate-600 mb-3">
              Signal confusion anonymously to help form a new concept cluster.
            </p>
            <form onSubmit={handleCustomSubmit} className="flex gap-2">
              <input
                type="text"
                value={customConfusion}
                onChange={(e) => setCustomConfusion(e.target.value)}
                placeholder="e.g. Master Theorem Case 2"
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-purple-500 focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center gap-1 rounded-xl bg-purple-600 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition-colors"
              >
                <Send className="h-3 w-3" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: AI Micro-Lesson & Clarification Viewer */}
        <div className="lg:col-span-7">
          {selectedCluster ? (
            <div className="craft-panel p-6 shadow-sm border border-slate-200 bg-white space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-800">
                    AI Micro-Lesson
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {selectedCluster.concept}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedCluster.subject}</p>
                </div>

                <button
                  onClick={() =>
                    handlePlayAudio(
                      `Here is the targeted micro-lesson on ${selectedCluster.concept}. The root misconception is confusing scalar multiplication with matrix transformation.`
                    )
                  }
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                    isPlayingAudio
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-purple-600 text-white hover:bg-purple-700 shadow-xs"
                  }`}
                >
                  <Volume2 className="h-4 w-4" />
                  <span>{isPlayingAudio ? "Stop Audio" : "Listen to Micro-Lesson"}</span>
                </button>
              </div>

              {/* Lesson Body */}
              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                  <h4 className="font-bold text-slate-900 mb-1">
                    🎯 Root-Cause Clarification
                  </h4>
                  <p>
                    Why are {selectedCluster.count} students stuck on this? The main confusion originates when transition from scalar arithmetic to linear operations. You cannot subtract a pure number $\lambda$ from a matrix $A$ directly!
                  </p>
                </div>

                <div className="rounded-xl bg-purple-50/60 border border-purple-200/80 p-4">
                  <h4 className="font-bold text-purple-950 mb-1">
                    💡 The 3-Step Intuition
                  </h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-purple-900">
                    <li>{"$A\\mathbf{v} = \\lambda\\mathbf{v}$ (The transformation only scales the vector)"}</li>
                    <li>{"Rewrite $\\lambda\\mathbf{v}$ as $(\\lambda I)\\mathbf{v}$ to make dimensions compatible"}</li>
                    <li>{"Subtract: $(A - \\lambda I)\\mathbf{v} = \\mathbf{0}$, leading to $\\det(A - \\lambda I) = 0$"}</li>
                  </ol>
                </div>
              </div>

              {/* Feedback Loop: Helped / Still Stuck */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Did this micro-lesson resolve your doubt?</p>
                    <p className="text-[11px] text-slate-500">Your feedback anonymously updates the faculty outcome telemetry.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleFeedback(selectedCluster.concept, "helped")}
                      className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                        feedbackStatus[selectedCluster.concept] === "helped"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "border border-slate-300 bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>Helped!</span>
                    </button>

                    <button
                      onClick={() => handleFeedback(selectedCluster.concept, "still_stuck")}
                      className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                        feedbackStatus[selectedCluster.concept] === "still_stuck"
                          ? "bg-amber-600 text-white shadow-xs"
                          : "border border-slate-300 bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-700"
                      }`}
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Still Stuck</span>
                    </button>
                  </div>
                </div>

                {feedbackStatus[selectedCluster.concept] && (
                  <p className="mt-2 text-[11px] font-semibold text-indigo-700">
                    ✓ Feedback recorded. Thank you for contributing to campus telemetry!
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="craft-panel p-12 text-center border border-slate-200 bg-white">
              <HelpCircle className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="text-sm font-bold text-slate-700 mt-2">Select a Concept Cluster</h3>
              <p className="text-xs text-slate-500 mt-1">Choose a cluster on the left to view the targeted AI micro-lesson.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
