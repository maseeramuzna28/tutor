"use client";

import { useEffect, useRef, useState } from "react";
import { isReducedMotion } from "@/lib/animations";

export default function HairlineIsometric() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isReducedMotion()) return;

    const handlePointerMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setPointer({ x, y });
    };

    window.addEventListener("mousemove", handlePointerMove);
    return () => window.removeEventListener("mousemove", handlePointerMove);
  }, []);

  const offsetX = pointer.x * 12;
  const offsetY = pointer.y * 12;

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center w-full max-w-sm h-64 select-none pointer-events-none"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 300 240"
        className="w-full h-full stroke-cyan-500/40 fill-none transition-transform duration-200 ease-out"
        style={{
          transform: `translate(${offsetX * 0.4}px, ${offsetY * 0.4}px)`,
        }}
      >
        <defs>
          <linearGradient id="cyanLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
          </linearGradient>
          <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Isometric Grid Base */}
        <path
          d="M 150 40 L 250 100 L 150 160 L 50 100 Z"
          stroke="url(#cyanLineGrad)"
          strokeWidth="1.2"
          strokeDasharray="4 4"
          className="opacity-40"
        />

        {/* Lower Floor Plate */}
        <path
          d="M 150 90 L 250 150 L 150 210 L 50 150 Z"
          stroke="url(#cyanLineGrad)"
          strokeWidth="1"
          className="opacity-30"
        />

        {/* Vertical Bridge Columns (Anonymity Tunnel) */}
        <line x1="50" y1="100" x2="50" y2="150" stroke="#06b6d4" strokeWidth="1" className="opacity-50" />
        <line x1="250" y1="100" x2="250" y2="150" stroke="#10b981" strokeWidth="1" className="opacity-50" />
        <line x1="150" y1="160" x2="150" y2="210" stroke="#06b6d4" strokeWidth="1" className="opacity-60" />
        <line x1="150" y1="40" x2="150" y2="90" stroke="#3b82f6" strokeWidth="1" className="opacity-40" />

        {/* Interactive Floating Signal Node (Student Voice Input) */}
        <g
          style={{
            transform: `translate(${offsetX * 0.8}px, ${offsetY * 0.8}px)`,
            transition: "transform 0.15s ease-out",
          }}
        >
          <circle cx="150" cy="100" r="5" fill="#06b6d4" filter="url(#cyanGlow)" />
          <circle cx="150" cy="100" r="14" stroke="#06b6d4" strokeWidth="0.8" strokeDasharray="3 3" />
        </g>

        {/* Upward Signal Flow (Doubt travels up without identity) */}
        <line
          x1="150"
          y1="100"
          x2="150"
          y2="55"
          stroke="#06b6d4"
          strokeWidth="1.5"
          strokeDasharray="2 4"
        />

        {/* Downward Fix Flow (Faculty fix travels down to stuck students) */}
        <line
          x1="150"
          y1="100"
          x2="150"
          y2="145"
          stroke="#10b981"
          strokeWidth="1.5"
          strokeDasharray="2 4"
        />

        {/* Anonymity Shield Wall in Isometric perspective */}
        <path
          d="M 120 75 L 180 110 L 180 135 L 120 100 Z"
          fill="rgba(6, 182, 212, 0.06)"
          stroke="#06b6d4"
          strokeWidth="1"
          className="opacity-75"
        />

        {/* Labels in isometric positions */}
        <text x="65" y="85" fill="#8b9eb3" fontSize="9" fontFamily="monospace" letterSpacing="0.05em">
          STUDENT SIGNAL
        </text>
        <text x="175" y="175" fill="#10b981" fontSize="9" fontFamily="monospace" letterSpacing="0.05em">
          FACULTY FIX
        </text>
      </svg>
    </div>
  );
}
