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
import TutoLoader from "@/components/TutoLoader";

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
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">Instructor Confusion Map</h1>
            <span className="craft-badge craft-badge-red">
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Real-time concept confusion clusters across lecture cohorts. Strict student anonymity enforced.
          </p>
        </div>

        <RevealButton
          secret="Anonymity Gate: 0 student IDs exposed"
          label="Privacy Gateway Active"
          hiddenLabel="Inspect Privacy Relay"
          maskedValue="Aggregates Only • Zero IDs"
        />
      </div>

      {/* Live Confusion Pulse Tiles */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-red-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-800">
              Active Pulse (15m)
            </h2>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-stone-500 font-semibold">
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
              className={`cursor-pointer craft-panel p-4 transition-all hover:border-stone-400 ${
                item.is_alert
                  ? "border-red-400 bg-red-50/40"
                  : "hover:border-stone-300"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-2">
                <span className="font-medium text-stone-500">{item.subject}</span>
                {item.is_alert && (
                  <span className="craft-badge craft-badge-red text-[9px] py-0.5 font-bold">
                    <AlertTriangle className="h-2.5 w-2.5" />
                    SPIKE &ge; 5
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold text-stone-900 line-clamp-1 tracking-tight">{item.concept}</h3>

              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-stone-900">{item.count}</span>
                  <span className="text-xs font-medium text-stone-500 ml-1">inquiries</span>
                </div>
                <span className="text-[10px] text-stone-400 font-medium flex items-center gap-1">
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-800">
              Confusion Clusters
            </h2>
            <span className="text-[10px] text-stone-500 font-medium">Threshold: 3+</span>
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
                      ? "border-red-600 bg-red-50/30"
                      : "hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-stone-900">{cluster.concept}</span>
                    <span className="craft-badge craft-badge-neutral text-[10px]">
                      {cluster.count} students
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-600 leading-relaxed mb-3">
                    <strong className="text-stone-800 font-semibold">Root Cause:</strong> {cluster.root_cause}
                  </p>

                  {/* Silent Doubt Rate Meter */}
                  <div className="bg-stone-50 p-2.5 border border-stone-200">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-stone-600 font-medium flex items-center gap-1">
                        <EyeOff className="h-3 w-3 text-stone-400" />
                        Silent Inquiry Rate:
                      </span>
                      <span className="font-bold text-red-600">{cluster.silent_doubt_rate}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-stone-200 overflow-hidden">
                      <div
                        className="h-full bg-red-600"
                        style={{ width: `${cluster.silent_doubt_rate}%` }}
                      />
                    </div>
                  </div>

                  {/* Institution tags */}
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {cluster.colleges.map((col) => (
                      <span
                        key={col}
                        className="bg-stone-100 border border-stone-200 px-1.5 py-0.5 text-[9px] font-medium text-stone-600"
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
          <div className="craft-panel p-4 text-center">
            <span className="text-[10px] uppercase font-mono font-semibold text-stone-500 block mb-1">
              Telemetry Receiver
            </span>
            <div className="w-full h-32 flex items-center justify-center overflow-hidden">
              <Terminal className="w-full max-w-[200px] text-stone-700" />
            </div>
            <p className="text-[10px] text-stone-500 mt-1">
              Zero-knowledge socket stream aggregates incoming doubt patterns.
            </p>
          </div>
        </div>

        {/* Right Column: AI Micro-Lesson Dispatcher */}
        <div className="lg:col-span-7 space-y-6">
          {selectedCluster ? (
            <div className="craft-panel p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3.5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                    Targeted Clarification
                  </span>
                  <h3 className="text-base font-bold text-stone-900 tracking-tight">{selectedCluster.concept}</h3>
                </div>
                <span className="craft-badge craft-badge-emerald">
                  <Radio className="h-3 w-3" />
                  Ready
                </span>
              </div>

              {/* Notice */}
              <div className="border border-stone-200 bg-stone-50 p-3 text-xs text-stone-800">
                <p className="font-semibold flex items-center gap-1.5 text-stone-900">
                  <Sparkles className="h-3.5 w-3.5 text-red-600" />
                  Synthesized from Concept & Root Cause
                </p>
                <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                  Generated solely from mathematical principles — zero student identities exposed.
                </p>
              </div>

              {/* Title input */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">Clarification Title</label>
                <input
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  className="w-full border border-stone-200 bg-white px-3.5 py-2 text-xs text-stone-900 focus:border-red-600 focus:outline-none transition-all"
                />
              </div>

              {/* Explanation Text Body */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Clarification Note
                </label>
                <textarea
                  value={draftBody}
                  onChange={(e) => setDraftBody(e.target.value)}
                  rows={4}
                  className="w-full border border-stone-200 bg-white p-3 text-xs text-stone-900 focus:border-red-600 focus:outline-none transition-all"
                />
              </div>

              {/* Spoken Script */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  Spoken Summary (Audio)
                </label>
                <textarea
                  value={draftSpokenText}
                  onChange={(e) => setDraftSpokenText(e.target.value)}
                  rows={2}
                  className="w-full border border-stone-200 bg-white p-3 text-xs text-stone-700 italic focus:border-red-600 focus:outline-none transition-all"
                />
              </div>

              {/* Dispatch Action */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-stone-500 font-medium">
                  Routes privately to {selectedCluster.count} affected students.
                </span>
                <button
                  onClick={handleSendClarification}
                  disabled={isSending || isDrafting}
                  className="evil-btn evil-btn-primary px-5 py-2.5 text-xs font-semibold gap-2"
                >
                  {isSending ? (
                    <TutoLoader variant="inline" size="sm" color="red" label="Routing..." />
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Broadcast Clarification</span>
                    </>
                  )}
                </button>
              </div>

              {/* Delivery Outcome Display */}
              {outcome && (
                <div className="mt-6 border border-stone-200 bg-stone-50/70 p-4">
                  <div className="flex items-center justify-between mb-3 border-b border-stone-200 pb-2">
                    <span className="text-xs font-bold text-stone-900 tracking-tight">
                      Resolution Feedback
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono font-semibold">Anonymous Aggregates</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-white p-3 border border-stone-200">
                      <p className="text-2xl font-bold text-stone-900">{outcome.delivered}</p>
                      <p className="text-[10px] text-stone-500 uppercase font-semibold tracking-wider mt-0.5">Delivered</p>
                    </div>

                    <div className="bg-white p-3 border border-emerald-200">
                      <p className="text-2xl font-bold text-emerald-600">{outcome.helped}</p>
                      <p className="text-[10px] text-emerald-700 uppercase font-semibold tracking-wider mt-0.5">Resolved ✓</p>
                    </div>

                    <div className="bg-white p-3 border border-red-200">
                      <p className="text-2xl font-bold text-red-600">{outcome.still_stuck}</p>
                      <p className="text-[10px] text-red-700 uppercase font-semibold tracking-wider mt-0.5">Still Stuck</p>
                    </div>
                  </div>

                  <p className="text-[10px] text-center text-stone-500 mt-3 font-medium">
                    Students marking &ldquo;Still Stuck&rdquo; automatically receive verified peer explanations.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="craft-panel p-12 text-center">
              <p className="text-xs text-stone-500 font-medium">Select a confusion cluster to draft a clarification.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
