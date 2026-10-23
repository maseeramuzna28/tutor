"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { NotificationItem } from "@/lib/types";
import {
  Bell,
  CheckCircle,
  HelpCircle,
  Volume2,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    const items = await apiClient.getNotifications();
    setNotifications(items);
    setLoading(false);
  };

  const handleRespond = async (id: string, response: "helped" | "still_stuck", concept?: string) => {
    await apiClient.respondToNotification(id, response);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: response } : n))
    );

    if (response === "still_stuck" && concept) {
      setTimeout(() => {
        router.push(`/feed`);
      }, 1200);
    }
  };

  const playSpokenClarification = (text?: string) => {
    if (!text || (typeof window !== "undefined" && !("speechSynthesis" in window))) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 mb-16 md:mb-0">
      {/* Header */}
      <div className="mb-8 border-b border-stone-200 pb-5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Private Clarification Inbox</h1>
          <span className="craft-badge craft-badge-neutral">
            Direct Routing
          </span>
        </div>
        <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
          Faculty clarifications targeting your past inquiries. Strict anonymity maintained.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="craft-panel p-6 animate-pulse space-y-3">
              <div className="h-4 w-32 bg-stone-100" />
              <div className="h-5 w-3/4 bg-stone-100" />
              <div className="h-12 w-full bg-stone-50" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="craft-panel p-12 text-center">
          <Bell className="mx-auto h-8 w-8 text-stone-400 mb-2" />
          <p className="text-sm font-semibold text-stone-800">Inbox clear</p>
          <p className="text-xs text-stone-500 mt-1">
            New instructor clarifications will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((item) => {
            const clarif = item.clarification;
            if (!clarif) return null;
            const isHelped = item.status === "helped";
            const isStillStuck = item.status === "still_stuck";

            return (
              <div
                key={item.id}
                className="craft-panel p-6 transition-all hover:border-stone-400"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="craft-badge craft-badge-neutral text-[10px]">
                      {clarif.concept}
                    </span>
                    <span className="text-[11px] font-medium text-stone-500">Faculty Clarification</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-stone-500">
                    <span className="flex items-center gap-1 font-semibold text-stone-700">
                      <GraduationCap className="h-3.5 w-3.5 text-red-600" />
                      {clarif.faculty_name || "Faculty Member"} ({clarif.faculty_college || "Engineering Dept"})
                    </span>
                    <span>•</span>
                    <span>{clarif.created_at}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-stone-900 tracking-tight mb-2">{clarif.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed mb-4">{clarif.body}</p>

                {clarif.spoken_text && (
                  <div className="border border-stone-200 bg-stone-50 p-3.5 flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-red-600 shrink-0" />
                      <p className="text-xs text-stone-800 italic line-clamp-1">
                        &ldquo;{clarif.spoken_text}&rdquo;
                      </p>
                    </div>
                    <button
                      onClick={() => playSpokenClarification(clarif.spoken_text)}
                      className="border border-stone-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-800 hover:bg-stone-100 shrink-0 transition-all"
                    >
                      Play Voice
                    </button>
                  </div>
                )}

                <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5 text-stone-500" />
                    <span>Response recorded anonymously</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRespond(item.id, "helped", clarif.concept)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border transition-all ${
                        isHelped
                          ? "bg-emerald-50 text-emerald-800 border-emerald-400 font-bold"
                          : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                      }`}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>{isHelped ? "Resolved ✓" : "This Helped"}</span>
                    </button>

                    <button
                      onClick={() => handleRespond(item.id, "still_stuck", clarif.concept)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border transition-all ${
                        isStillStuck
                          ? "bg-red-50 text-red-800 border-red-400 font-bold"
                          : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                      }`}
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span>Still Stuck</span>
                    </button>
                  </div>
                </div>

                {isStillStuck && (
                  <div className="mt-4 border border-stone-200 bg-stone-50 p-3 text-xs text-stone-800 flex items-center justify-between">
                    <span>Redirecting to community solutions on &ldquo;{clarif.concept}&rdquo;…</span>
                    <ArrowRight className="h-3.5 w-3.5 text-stone-700" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
