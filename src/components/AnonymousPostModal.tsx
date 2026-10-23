"use client";

import { Shield, Sparkles, X, Check } from "lucide-react";

interface AnonymousPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  doubtSnippet: string;
  concept: string;
}

export default function AnonymousPostModal({
  isOpen,
  onClose,
  onConfirm,
  doubtSnippet,
  concept,
}: AnonymousPostModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm cube-enter">
      <div className="relative w-full max-w-md rounded-2xl border border-[#24364f] bg-[#0b111a] p-6 shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Shield Icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 mb-4">
          <Shield className="h-6 w-6 text-cyan-400" />
        </div>

        <h3 className="text-base font-bold text-white">Post to Anonymous Community Feed?</h3>
        <p className="text-xs text-[#8b9eb3] mt-1.5 leading-relaxed">
          TUTO&apos;s Anonymity Bridge guarantees: Your identity will{" "}
          <span className="text-cyan-300 font-medium">never be attached</span>. Only your college
          tag is visible so peers from other colleges can learn from this doubt.
        </p>

        {/* Snippet preview */}
        <div className="my-4 rounded-xl border border-[#192538] bg-[#070b12] p-3 text-xs">
          <div className="flex items-center justify-between text-[10px] text-cyan-400 font-semibold mb-1">
            <span>{concept}</span>
            <span className="text-slate-400">Anonymous Author</span>
          </div>
          <p className="text-slate-300 italic">&ldquo;{doubtSnippet}&rdquo;</p>
        </div>

        {/* Reward */}
        <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-300 mb-5">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
          <span>Earn <strong>+5 points</strong> for contributing to the open knowledge pool!</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-[#192538] bg-[#111926] py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            Keep It Private
          </button>
          <button
            onClick={onConfirm}
            className="evil-btn evil-btn-primary flex-1 py-2.5 text-xs font-semibold"
          >
            Confirm & Post Anonymously
          </button>
        </div>
      </div>
    </div>
  );
}
