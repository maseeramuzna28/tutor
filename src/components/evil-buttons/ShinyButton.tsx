"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ShinyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shineDuration?: number;
}

const ShinyButton = React.forwardRef<HTMLButtonElement, ShinyButtonProps>(
  (
    {
      children,
      className,
      shineDuration = 650,
      onClick,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const shineRef = React.useRef<HTMLSpanElement>(null);
    const faceRef = React.useRef<HTMLSpanElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      shineRef.current?.animate(
        [
          { transform: "translateX(-160%) skewX(-20deg)", opacity: 0 },
          { opacity: 1, offset: 0.15 },
          { opacity: 1, offset: 0.7 },
          { transform: "translateX(420%) skewX(-20deg)", opacity: 0 },
        ],
        { duration: shineDuration, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      );
      faceRef.current?.animate(
        [
          { filter: "brightness(1)" },
          { filter: "brightness(1.15)", offset: 0.25 },
          { filter: "brightness(1)" },
        ],
        { duration: shineDuration * 0.8, easing: "ease-out" },
      );
    };

    return (
      <button
        ref={ref}
        type={type}
        onClick={handleClick}
        className={cn(
          "group/shiny relative inline-flex cursor-pointer rounded-xl bg-indigo-100 p-px text-xs font-semibold text-slate-900 shadow-xs outline-none select-none transition-all duration-150",
          "hover:bg-indigo-200 active:translate-y-0.5 active:scale-[0.99]",
          "disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        {...props}
      >
        <span
          ref={faceRef}
          className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-[11px] bg-white px-3.5 py-2 border border-slate-200"
        >
          <span className="relative flex items-center gap-1.5 font-semibold text-slate-800">{children}</span>
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
        >
          <span
            ref={shineRef}
            className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-indigo-500/15 to-transparent opacity-0"
          />
        </span>
      </button>
    );
  },
);

ShinyButton.displayName = "ShinyButton";

export { ShinyButton };
export default ShinyButton;
