import React from "react";

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "square" as const,
  "aria-hidden": "true" as const,
  focusable: false,
};

const make = (paths: React.ReactNode) =>
  function Icon({ size = 20 }: { size?: number }) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
        {paths}
      </svg>
    );
  };

export const ArrowRight = make(<path d="M4 12h15M13 6l6 6-6 6" />);
export const Menu = make(<path d="M4 7h16M4 12h16M4 17h16" />);
export const Close = make(<path d="M6 6l12 12M18 6L6 18" />);
export const Plus = make(<path d="M12 5v14M5 12h14" />);
export const Check = make(<path d="M5 12l5 5 9-10" />);
export const Bell = make(<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4l2-2zM10 21h4" />);
export const Mic = make(
  <>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </>
);
