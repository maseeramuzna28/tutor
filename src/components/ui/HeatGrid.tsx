"use client";

import React from "react";
import { MockTopic } from "@/services/mockData";

interface HeatGridProps {
  topics: MockTopic[];
  onMark: (id: string) => void;
  busyId?: string | null;
}

export default function HeatGrid({ topics, onMark, busyId }: HeatGridProps) {
  const top = topics.reduce((a, b) => (b.heat > a.heat ? b : a), topics[0]);
  return (
    <div className="heat">
      {topics.map((t) => (
        <button
          key={t.id}
          type="button"
          className="heat__cell"
          style={{ ["--heat" as any]: t.heat }}
          data-top={top && t.id === top.id ? "true" : "false"}
          disabled={busyId === t.id}
          onClick={() => onMark(t.id)}
          aria-label={`${t.name}. Press to mark this topic as confusing.`}
        >
          <span className="heat__name">{t.name}</span>
          <span className="heat__flag">
            {top && t.id === top.id ? "Most flagged" : ""}
          </span>
          <span className="heat__bar" aria-hidden="true">
            <span />
          </span>
        </button>
      ))}
    </div>
  );
}
