"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Shield } from "lucide-react";

export interface RevealButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  secret?: React.ReactNode;
  label?: React.ReactNode;
  hiddenLabel?: React.ReactNode;
  revealMode?: "hold" | "toggle";
  maskedValue?: string;
  onRevealChange?: (revealed: boolean) => void;
}

export const RevealButton = React.forwardRef<
  HTMLButtonElement,
  RevealButtonProps
>(
  (
    {
      secret = "Anonymous Student #4029",
      label = "Identity Shielded",
      hiddenLabel = "Tap to Inspect Shield",
      revealMode = "toggle",
      maskedValue = "•••• •••••••••••",
      onRevealChange,
      className,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const [revealed, setRevealed] = React.useState(false);

    const updateRevealed = (next: boolean) => {
      setRevealed(next);
      onRevealChange?.(next);
    };

    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={revealed}
        data-state={revealed ? "revealed" : "hidden"}
        onClick={() => updateRevealed(!revealed)}
        className={cn(
          "group relative inline-flex cursor-pointer items-center justify-between gap-3 overflow-hidden rounded-lg px-3 py-1.5 text-xs outline-none select-none transition-all duration-150 shadow-xs",
          "border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900",
          revealed && "border-indigo-300 bg-indigo-50/70 text-indigo-900",
          className,
        )}
        {...props}
      >
        <span className="flex min-w-0 flex-col items-start text-left">
          <span className="text-[10px] font-semibold text-slate-500">
            {revealed ? label : hiddenLabel}
          </span>
          <span className="text-xs font-mono font-bold text-slate-900">
            {revealed ? secret : maskedValue}
          </span>
        </span>

        <Shield className={`h-3.5 w-3.5 transition-colors ${revealed ? "text-indigo-600" : "text-slate-400"}`} />
      </button>
    );
  },
);

RevealButton.displayName = "RevealButton";

export default RevealButton;
