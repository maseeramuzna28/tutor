/**
 * TUTO Animation & Motion System
 * Integrates GSAP, Cube Motion presets, Oil Motion pointer reactivity, and Evil Button dynamics.
 * Fully honours prefers-reduced-motion.
 */

export function isReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Cube Motion: 4 purposeful, dial-free motions.
 * 1. Enter (subtle pop & lift)
 * 2. Exit (graceful slide-away)
 * 3. Reveal (content unmasking)
 * 4. Slide (directional arrival)
 */
export const cubeMotion = {
  enter: "transition-all duration-300 ease-out transform opacity-100 translate-y-0 scale-100",
  enterInitial: "opacity-0 translate-y-3 scale-[0.98]",
  exit: "transition-all duration-200 ease-in transform opacity-0 translate-y-2 scale-[0.98]",
  reveal: "transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) opacity-100 filter-none",
  revealInitial: "opacity-0 blur-sm",
  slide: "transition-transform duration-350 cubic-bezier(0.2, 0.8, 0.2, 1)",
};

/**
 * Oil Motion: Mouse / scroll reactive subtle physics hook helper.
 * Calculates normalized parallax coordinates (-1 to 1) for tactile cards & mic wave pulse.
 */
export function calculateOilDelta(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  strength = 15
) {
  if (isReducedMotion()) return { x: 0, y: 0, rotateX: 0, rotateY: 0 };
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const deltaX = (clientX - centerX) / (rect.width / 2);
  const deltaY = (clientY - centerY) / (rect.height / 2);
  return {
    x: deltaX * strength,
    y: deltaY * strength,
    rotateX: -deltaY * (strength / 2),
    rotateY: deltaX * (strength / 2),
  };
}

/**
 * Evil Buttons interactive tactile feedback classes.
 * Delivers crisp physical click sensations without gimmicky neon clutter.
 */
export const evilButtonStyles = {
  primary:
    "relative inline-flex items-center justify-center font-medium select-none cursor-pointer rounded-xl px-5 py-2.5 transition-all duration-150 active:translate-y-[2px] active:scale-[0.98] border border-cyan-500/30 bg-gradient-to-b from-cyan-500/20 to-cyan-600/30 text-cyan-200 hover:text-white hover:border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]",
  danger:
    "relative inline-flex items-center justify-center font-medium select-none cursor-pointer rounded-xl px-5 py-2.5 transition-all duration-150 active:translate-y-[2px] active:scale-[0.98] border border-amber-500/30 bg-gradient-to-b from-amber-500/20 to-amber-600/30 text-amber-200 hover:text-white hover:border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
  faculty:
    "relative inline-flex items-center justify-center font-medium select-none cursor-pointer rounded-xl px-5 py-2.5 transition-all duration-150 active:translate-y-[2px] active:scale-[0.98] border border-emerald-500/30 bg-gradient-to-b from-emerald-500/20 to-emerald-600/30 text-emerald-200 hover:text-white hover:border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]",
  ghost:
    "relative inline-flex items-center justify-center font-medium select-none cursor-pointer rounded-xl px-4 py-2 transition-all duration-150 active:translate-y-[1px] border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-800/80",
};
