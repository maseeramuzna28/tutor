"use client";

import React from "react";
import useReveal from "@/hooks/useReveal";

interface RevealProps {
  as?: React.ElementType;
  delay?: number;
  blur?: boolean;
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}

export default function Reveal({
  as: Tag = "div",
  delay = 0,
  blur = false,
  className = "",
  children,
  ...rest
}: RevealProps) {
  const ref = useReveal<any>();
  return (
    <Tag
      ref={ref}
      className={`reveal${blur ? " reveal--blur" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
