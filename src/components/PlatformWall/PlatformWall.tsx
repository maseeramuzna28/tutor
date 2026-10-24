"use client";

import React from "react";
import Wall3D from "../Wall3D/Wall3D";
import { wallItems, WallItem } from "@/data/wallItems";
import "./PlatformWall.css";

export default function PlatformWall({ items = wallItems }: { items?: WallItem[] }) {
  return (
    <Wall3D
      id="platform"
      eyebrow="03 / Platform"
      title="Questions TUTO is *built* *to* *answer*"
      subtitle="Example questions written for this page, each shown with where it goes inside TUTO."
      items={items}
      cols={4}
      renderCard={(c: any) => (
        <figure className="pwall__card" data-planned={c.planned ? "true" : "false"}>
          <figcaption className="pwall__label">
            <span>{c.area}</span>
            <span>{String(c.index + 1).padStart(2, "0")}</span>
          </figcaption>
          <p className="pwall__q">{c.question}</p>
          <p className="pwall__to">{c.destination}</p>
        </figure>
      )}
    />
  );
}
