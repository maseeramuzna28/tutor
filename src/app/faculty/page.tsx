"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { PulseItem, ConceptCluster, ClarificationOutcome } from "@/lib/types";
import {
  Activity,
  Send,
  Sparkles,
  AlertTriangle,
  Clock,
  EyeOff,
  Radio,
} from "lucide-react";
import { Terminal } from "@lucasmarkes/hairline/react";
import { RevealButton } from "@/components/evil-buttons/RevealButton";

export default function FacultyPage() {
  const [pulse, setPulse] = useState<PulseItem[]>([]);
  const [clusters, setClusters] = useState<ConceptCluster[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<ConceptCluster | null>(null);

  // Micro-lesson editor states
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftSpokenText, setDraftSpokenText] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentClarificationId, setSentClarificationId] = useState<string | null>("clarif_99");
  const [outcome, setOutcome] = useState<ClarificationOutcome | null>(null);

  useEffect(() => {
    loadData();

    // 5-second polling pulse interval
    const interval = setInterval(() => {
      apiClient.getPulse(15).then((data) => setPulse(data));
      if (sentClarificationId) {
        apiClient.getClarificationOutcome(sentClarificationId).then((o) => setOutcome(o));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [sentClarificationId]);

  const loadData = async () => {
    const [pItems, cItems] = await Promise.all([apiClient.getPulse(15), apiClient.getClusters()]);
    setPulse(pItems);
    setClusters(cItems);

    if (cItems.length > 0 && !selectedCluster) {
      handleSelectCluster(cItems[0]);
    }

    if (sentClarificationId) {
      const o = await apiClient.getClarificationOutcome(sentClarificationId);
      setOutcome(o);
    }
  };

  const handleSelectCluster = async (cluster: ConceptCluster) => {
    setSelectedCluster(cluster);
    setIsDrafting(true);
    const draft = await apiClient.draftMicroLesson(cluster.concept, cluster.root_cause);
    setDraftTitle(draft.title);
    setDraftBody(draft.body);
    setDraftSpokenText(draft.spoken_text);
    setIsDrafting(false);
  };

  const handleSendClarification = async () => {
    if (!selectedCluster || !draftTitle.trim() || !draftBody.trim()) return;
    setIsSending(true);

    const res = await apiClient.sendClarification({
      concept: selectedCluster.concept,
      title: draftTitle,
      body: draftBody,
      spoken_text: draftSpokenText,
    });

    setSentClarificationId(res.clarification_id);
    const newOutcome = await apiClient.getClarificationOutcome(res.clarification_id);
    setOutcome(newOutcome);
    setIsSending(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Instructor Confusion Map</h1>
            <span className="craft-badge craft-badge-amber">
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Monitor real-time concept confusion across lecture batches. Zero individual student identifiers or raw
            questions are exposed.
          </p>
        </div>

        <RevealButton
          secret="Anonymity Gate Enforced: 0 student IDs visible"
          label="Privacy Gateway Active"
          hiddenLabel="Inspect Privacy Relay"
          maskedValue="Aggregates Only • Zero IDs"
        />
      </div>

      {/* Live Confusion Pulse Tiles */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-amber-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Active Confusion Pulse (Last 15 Minutes)
            </h2>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            Live polling 5s
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pulse.map((item) => (
            <div
              key={item.concept}
              onClick={() => {
                const match = clusters.find((c) => c.concept === item.concept);
                if (match) handleSelectCluster(match);
              }}
              className={`cursor-pointer craft-panel p-4 transition-all hover:shadow-md ${
                item.is_alert
                  ? "border-amber-300 bg-amber-50/40"
                  : "hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-2">
                <span className="font-medium text-slate-500">{item.subject}</span>
                {item.is_alert && (
                  <span className="craft-badge craft-badge-amber text-[9px] py-0.5 font-bold">
                    <AlertTriangle className="h-2.5 w-2.5" />
                    SPIKE &ge; 5
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold text-slate-900 line-clamp-1 tracking-tight">{item.concept}</h3>

              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-amber-600">{item.count}</span>
                  <span className="text-xs font-medium text-slate-500 ml-1">inquiries</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {item.last_question_time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Clusters vs Micro-Lesson Composer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Concept Clusters Table */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Identified Confusion Clusters
            </h2>
            <span className="text-[10px] text-slate-500 font-medium">Threshold: 3+ inquiries</span>
          </div>

          <div className="space-y-3">
            {clusters.map((cluster) => {
              const isSelected = selectedCluster?.concept === cluster.concept;

              return (
                <div
                  key={cluster.concept}
                  onClick={() => handleSelectCluster(cluster)}
                  className={`cursor-pointer craft-panel p-4 transition-all ${
                    isSelected
                      ? "border-indigo-400 bg-indigo-50/40 shadow-sm"
                      : "hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-900">{cluster.concept}</span>
                    <span className="craft-badge craft-badge-blue text-[10px]">
                      {cluster.count} students
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                    <strong className="text-slate-800 font-semibold">Underlying Cause:</strong> {cluster.root_cause}
                  </p>

                  {/* Silent Doubt Rate Meter */}
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200/80">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-slate-600 font-medium flex items-center gap-1">
                        <EyeOff className="h-3 w-3 text-slate-400" />
                        Silent Inquiry Rate:
                      </span>
                      <span className="font-bold text-amber-700">{cluster.silent_doubt_rate}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${cluster.silent_doubt_rate}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-slate-500 mt-1">
                      {cluster.silent_doubt_rate}% asked privately and hesitated to speak in class.
                    </p>
                  </div>

                  {/* Institution tags */}
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {cluster.colleges.map((col) => (
                      <span
                        key={col}
                        className="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[9px] font-medium text-slate-600"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hairline Terminal Figure */}
          <div className="craft-panel p-4 text-center shadow-xs">
            <span className="text-[10px] uppercase font-mono font-semibold text-slate-500 block mb-1">
              Live Telemetry Receiver Stream
            </span>
            <div className="w-full h-36 flex items-center justify-center overflow-hidden">
              <Terminal className="w-full max-w-[220px] text-indigo-600" />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Zero-knowledge socket stream aggregates incoming doubt patterns in real time.
            </p>
          </div>
        </div>

        {/* Right Column: AI Micro-Lesson Dispatcher */}
        <div className="lg:col-span-7 space-y-6">
          {selectedCluster ? (
            <div className="craft-panel p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                    Targeted Clarification Dispatcher
                  </span>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">{selectedCluster.concept}</h3>
                </div>
                <span className="craft-badge craft-badge-emerald">
                  <Radio className="h-3 w-3" />
                  Routing Ready
                </span>
              </div>

              {/* Notice */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3 text-xs text-indigo-950">
                <p className="font-semibold flex items-center gap-1.5 text-indigo-900">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  Synthesized from Concept & Root Cause
                </p>
                <p className="text-[11px] text-indigo-800 mt-0.5 leading-relaxed">
                  Generated solely from the concept and underlying mathematical mechanism — never from raw student inquiries.
                </p>
              </div>

              {/* Title input */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">Clarification Title</label>
                <input
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none transition-all shadow-xs"
                />
              </div>

              {/* Explanation Text Body */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Written Clarification Note (Delivered to stuck students)
                </label>
                <textarea
                  value={draftBody}
                  onChange={(e) => setDraftBody(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none transition-all shadow-xs"
                />
              </div>

              {/* Spoken Script */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Spoken Audio Summary (60 Seconds)
                </label>
                <textarea
                  value={draftSpokenText}
                  onChange={(e) => setDraftSpokenText(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700 italic focus:border-indigo-500 focus:outline-none transition-all shadow-xs"
                />
              </div>

              {/* Dispatch Action */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500 font-medium">
                  Broadcasts privately to {selectedCluster.count} students on this topic.
                </span>
                <button
                  onClick={handleSendClarification}
                  disabled={isSending || isDrafting}
                  className="evil-btn evil-btn-primary px-5 py-2.5 text-xs font-semibold gap-2"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isSending ? "Routing..." : "Broadcast Clarification"}</span>
                </button>
              </div>

              {/* Delivery Outcome Display */}
              {outcome && (
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4 cube-enter">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-slate-900 tracking-tight">
                      Resolution Feedback Telemetry
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono font-semibold">Anonymous Aggregates</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-lg bg-white p-3 border border-slate-200 shadow-xs">
                      <p className="text-2xl font-bold text-indigo-600">{outcome.delivered}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider mt-0.5">Delivered</p>
                    </div>

                    <div className="rounded-lg bg-white p-3 border border-emerald-200 shadow-xs">
                      <p className="text-2xl font-bold text-emerald-600">{outcome.helped}</p>
                      <p className="text-[10px] text-emerald-700 uppercase font-semibold tracking-wider mt-0.5">Helped ✓</p>
                    </div>

                    <div className="rounded-lg bg-white p-3 border border-amber-200 shadow-xs">
                      <p className="text-2xl font-bold text-amber-600">{outcome.still_stuck}</p>
                      <p className="text-[10px] text-amber-700 uppercase font-semibold tracking-wider mt-0.5">Still Stuck</p>
                    </div>
                  </div>

                  <p className="text-[10px] text-center text-slate-500 mt-3 font-medium">
                    Students marking &ldquo;Still Stuck&rdquo; automatically receive verified peer explanations.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="craft-panel p-12 text-center shadow-xs">
              <p className="text-xs text-slate-500 font-medium">Select a confusion cluster from the left to draft a clarification.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
