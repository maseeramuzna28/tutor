"use client";

import React from "react";
import GridBackground from "./GridBackground";
import RevealText from "./RevealText";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ eyebrow, title, lead, children }: PageHeaderProps) {
  return (
    <header className="phead has-grid">
      <GridBackground />
      <p className="eyebrow">{eyebrow}</p>
      <RevealText as="h1" className="phead__title" text={title} />
      {lead && <p className="phead__lead">{lead}</p>}
      {children && <div className="phead__actions">{children}</div>}
    </header>
  );
}
