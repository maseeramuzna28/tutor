"use client";

import React, { useRef } from "react";

interface TiltCardProps {
  as?: React.ElementType;
  className?: string;
  max?: number;
  children: React.ReactNode;
  [key: string]: any;
}

export default function TiltCard({
  as: Tag = "div",
  className = "",
  max = 6,
  children,
  ...rest
}: TiltCardProps) {
  const ref = useRef<HTMLElement>(null);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-py * max).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(px * max).toFixed(2)}deg`);
    el.style.setProperty("--sx", `${((px + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--sy", `${((py + 0.5) * 100).toFixed(1)}%`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <Tag
      ref={ref}
      className={`tilt ${className}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      {...rest}
    >
      {children}
    </Tag>
  );
}
