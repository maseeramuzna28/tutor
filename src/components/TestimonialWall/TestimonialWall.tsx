"use client";

import React from "react";
import Wall3D from "../Wall3D/Wall3D";
import { testimonials, TestimonialItem } from "@/data/testimonials";
import "./TestimonialWall.css";

const VerifiedMark = () => (
  <svg className="tcard__badge" viewBox="0 0 20 20" role="img" aria-label="Verified">
    <rect x="1" y="1" width="18" height="18" fill="currentColor" />
    <path d="M5.5 10.4l3 3 6-6.4" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="square" />
  </svg>
);

export default function TestimonialWall({
  items = testimonials,
}: {
  items?: TestimonialItem[];
}) {
  if (!items || items.length < 6) return null; // nothing fake is ever shown

  const cols = items.length >= 15 ? 6 : items.length >= 10 ? 5 : 4;

  return (
    <Wall3D
      id="voices"
      eyebrow="05 / In their words"
      title="What students and faculty *say*"
      subtitle="Words from people who have used TUTO."
      items={items}
      cols={cols}
      renderCard={(c: any) => (
        <figure className="tcard">
          <figcaption className="tcard__top">
            <span className="tcard__avatar" aria-hidden="true">
              {c.name.charAt(0)}
            </span>
            <span className="tcard__meta">
              <span className="tcard__name">
                {c.name}
                {c.verified && <VerifiedMark />}
              </span>
              <span className="tcard__role">
                {[c.role, c.handle].filter(Boolean).join(" · ")}
              </span>
            </span>
            {c.source && <span className="tcard__source">{c.source}</span>}
          </figcaption>
          <blockquote className="tcard__text">{c.text}</blockquote>
        </figure>
      )}
    />
  );
}
