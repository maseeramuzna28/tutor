"use client";

import React, { Fragment, useEffect, useRef } from "react";

interface RevealTextProps {
  as?: React.ElementType;
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  id?: string;
  [key: string]: any;
}

export default function RevealText({
  as: Tag = "span",
  text,
  className = "",
  delay = 0,
  stagger = 45,
  ...rest
}: RevealTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const words = text.split(" ");

  return (
    <Tag
      ref={ref}
      className={`rtext ${className}`}
      aria-label={text.replaceAll("*", "")}
      {...rest}
    >
      {words.map((w, i) => {
        const accent = w.length > 2 && w.startsWith("*") && w.endsWith("*");
        const label = accent ? w.slice(1, -1) : w;
        return (
          <Fragment key={i}>
            <span className="rtext__word" aria-hidden="true">
              <span
                className={accent ? "rtext__accent" : undefined}
                style={{ transitionDelay: `${delay + i * stagger}ms` }}
              >
                {label}
              </span>
            </span>
            {i < words.length - 1 ? " " : ""}
          </Fragment>
        );
      })}
    </Tag>
  );
}
