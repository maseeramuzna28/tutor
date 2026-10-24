"use client";

import { useState } from "react";
import { Sparkles, X, Bell, CheckCircle2, Video, PlayCircle } from "lucide-react";

interface PlannedFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle: string;
  featureDescription: string;
  featureIcon?: "video" | "lecture";
  estimatedRelease?: string;
}

export default function PlannedFeatureModal({
  isOpen,
  onClose,
  featureTitle,
  featureDescription,
  featureIcon = "lecture",
  estimatedRelease = "Upcoming Semester (v2.0)",
}: PlannedFeatureModalProps) {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60">
            {featureIcon === "video" ? <PlayCircle className="h-6 w-6" /> : <Video className="h-6 w-6" />}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-indigo-300 bg-indigo-50/60 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span>Planned Roadmap Feature</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">{featureTitle}</h3>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          {featureDescription}
        </p>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 mb-5">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-medium text-slate-500">Status</span>
            <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/50">
              In Architecture & Design
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600 mt-2">
            <span className="font-medium text-slate-500">Target Rollout</span>
            <span className="font-semibold text-slate-800">{estimatedRelease}</span>
          </div>
        </div>

        {subscribed ? (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>You are on the early-access list! We'll notify you when it launches.</span>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubscribed(true);
            }}
            className="space-y-2.5"
          >
            <label className="block text-xs font-medium text-slate-700">
              Get notified when this feature is ready:
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.college.email@edu"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
              >
                <Bell className="h-3.5 w-3.5" />
                <span>Notify Me</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
