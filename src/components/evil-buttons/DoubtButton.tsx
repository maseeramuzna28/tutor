"use client";

import * as React from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { cn } from "@/lib/utils";

type DoubtState = "idle" | "doubting" | "success";

export interface DoubtButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  children?: React.ReactNode;
  label?: React.ReactNode;
  confirmations?: React.ReactNode[];
  successLabel?: React.ReactNode;
  onConfirm?: () => void;
  resetAfter?: number;
}

const DEFAULT_CONFIRMATIONS: string[] = [
  "Are you sure?",
  "Identity will be stripped permanently.",
  "Ready to post anonymously?",
];

const labelVariants: Variants = {
  enter: { y: 6, opacity: 0 },
  center: { y: 0, opacity: 1 },
  exit: { y: -6, opacity: 0 },
};

export const DoubtButton = React.forwardRef<
  HTMLButtonElement,
  DoubtButtonProps
>(
  (
    {
      children,
      label = "Post to Community Feed",
      confirmations = DEFAULT_CONFIRMATIONS,
      successLabel = "Posted Anonymously (+5 pts)",
      onConfirm,
      resetAfter = 2000,
      className,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const reduceMotion = useReducedMotion();
    const [index, setIndex] = React.useState(0);
    const [state, setState] = React.useState<DoubtState>("idle");
    const [shakeKey, setShakeKey] = React.useState(0);
    const resetTimeoutRef = React.useRef<number | null>(null);

    const steps = confirmations.length;

    const clearResetTimeout = () => {
      if (resetTimeoutRef.current !== null) {
        window.clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
      }
    };

    React.useEffect(() => () => clearResetTimeout(), []);

    const handleClick = () => {
      if (disabled || state === "success") return;

      if (steps === 0) {
        fire();
        return;
      }

      if (index < steps) {
        setIndex((i) => i + 1);
        setState("doubting");
        setShakeKey((k) => k + 1);
        return;
      }

      fire();
    };

    const fire = () => {
      clearResetTimeout();
      setState("success");
      setIndex(0);
      onConfirm?.();
      if (resetAfter > 0) {
        resetTimeoutRef.current = window.setTimeout(() => {
          setState("idle");
        }, resetAfter);
      }
    };

    const isSuccess = state === "success";
    const progress = isSuccess ? 1 : steps === 0 ? 0 : index / steps;

    const currentLabel: React.ReactNode = isSuccess
      ? successLabel
      : index === 0
      ? (children ?? label)
      : confirmations[index - 1];

    const labelKey = isSuccess ? "success" : `step-${index}`;

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        aria-live="polite"
        data-state={state}
        onClick={handleClick}
        className={cn(
          "relative inline-flex h-9 min-w-44 cursor-pointer items-center justify-center overflow-hidden rounded-none px-4 text-xs font-mono uppercase tracking-wider select-none transition-all",
          isSuccess
            ? "bg-red-600 text-white border border-red-700"
            : "border border-stone-300 bg-white text-stone-900 hover:border-red-600 hover:text-red-600",
          className,
        )}
        {...props}
      >
        <motion.span
          key={shakeKey}
          animate={
            reduceMotion || shakeKey === 0 || isSuccess
              ? undefined
              : { x: [0, -3, 3, -1, 1, 0] }
          }
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="inline-flex items-center gap-1.5"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={labelKey}
              variants={reduceMotion ? undefined : labelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="text-center font-semibold"
            >
              {currentLabel}
            </motion.span>
          </AnimatePresence>
        </motion.span>

        {steps > 0 && (
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-indigo-600 transition-transform duration-200 ease-out"
            style={{ transform: `scaleX(${progress})` }}
          />
        )}
      </button>
    );
  },
);

DoubtButton.displayName = "DoubtButton";

export default DoubtButton;
