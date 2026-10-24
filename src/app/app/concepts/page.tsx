"use client";

import { useState } from "react";
import Link from "next/link";
import useAsync from "@/hooks/useAsync";
import { concepts } from "@/services";
import PageHeader from "@/components/ui/PageHeader";
import { Loading, ErrorState } from "@/components/ui/States";
import { ArrowRight } from "@/components/Icons";
import RequireRole from "@/components/App/RequireRole";

function ConceptsContent() {
  const { data, loading, error, reload } = useAsync(() => concepts.graph(), []);
  const [active, setActive] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  const focusId = hover || active;
  const byId = data
    ? Object.fromEntries(data.nodes.map((n: any) => [n.id, n]))
    : {};
  const neighbours = (id: string) =>
    data
      ? data.links
          .filter((l: [string, string]) => l.includes(id))
          .map((l: [string, string]) => (l[0] === id ? l[1] : l[0]))
      : [];
  const related = data && focusId ? neighbours(focusId) : [];
  const selected = focusId && byId[focusId];

  return (
    <>
      <PageHeader
        eyebrow="Student"
        title="How topics *connect.*"
        lead="Hover or focus a topic to see what it depends on. Redder circles are topics you know less well."
      />
      <div className="app-body">
        {loading && <Loading />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {data && (
          <div
            className="grid grid--2"
            style={{
              alignItems: "start",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            }}
          >
            <svg
              className="cgraph"
              viewBox="0 0 720 420"
              role="group"
              aria-label="Concept map"
            >
              {data.groups.map((g: any) => (
                <g key={g.id}>
                  <ellipse
                    className="cgraph__group"
                    cx={g.cx}
                    cy={g.cy}
                    rx={g.rx}
                    ry={g.ry}
                  />
                  <text className="cgraph__glabel" x={g.lx} y={g.ly}>
                    {g.name}
                  </text>
                </g>
              ))}
              {data.links.map(([a, b]: [string, string]) => {
                const on = focusId && (a === focusId || b === focusId);
                const dim = focusId && !on;
                return (
                  <line
                    key={a + b}
                    className={`cgraph__link${on ? " is-on" : ""}${dim ? " is-dim" : ""}`}
                    x1={byId[a].x}
                    y1={byId[a].y}
                    x2={byId[b].x}
                    y2={byId[b].y}
                  />
                );
              })}
              {data.nodes.map((n: any) => {
                const dim = focusId && n.id !== focusId && !related.includes(n.id);
                return (
                  <g
                    key={n.id}
                    className={`cgraph__item${dim ? " is-dim" : ""}${
                      n.id === active ? " is-active" : ""
                    }`}
                    transform={`translate(${n.x} ${n.y})`}
                    tabIndex={0}
                    role="button"
                    aria-label={`${n.label}, mastery ${n.mastery} percent`}
                    onMouseEnter={() => setHover(n.id)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(n.id)}
                    onBlur={() => setHover(null)}
                    onClick={() => setActive(n.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActive(n.id);
                      }
                    }}
                  >
                    <circle
                      className="cgraph__node"
                      r="22"
                      style={{
                        fill: `color-mix(in srgb, var(--red) ${
                          (100 - n.mastery) * 0.6
                        }%, var(--paper))`,
                      }}
                    />
                    <text className="cgraph__label" y="40">
                      {n.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            <aside className="card" aria-live="polite">
              {selected ? (
                <>
                  <p className="card__label">Topic</p>
                  <h2 className="card__title">{selected.label}</h2>
                  <p className="card__text">
                    Mastery in this demo: {selected.mastery} percent.
                  </p>
                  <div
                    className="bar"
                    style={{ margin: "12px 0" }}
                    aria-hidden="true"
                  >
                    <span style={{ ["--w" as any]: selected.mastery }} />
                  </div>
                  <p className="card__label" style={{ marginTop: 16 }}>
                    Connected to
                  </p>
                  <div className="chips">
                    {related.map((id: string) => (
                      <button
                        key={id}
                        type="button"
                        className="chip"
                        aria-pressed="false"
                        onClick={() => setActive(id)}
                      >
                        {byId[id].label}
                      </button>
                    ))}
                  </div>
                  <Link className="card__link" href="/app/lessons">
                    Find a micro lesson <ArrowRight size={16} />
                  </Link>
                </>
              ) : (
                <p className="card__text">
                  Choose a topic on the map to see what connects to it.
                </p>
              )}
            </aside>
          </div>
        )}
      </div>
    </>
  );
}

export default function ConceptsPage() {
  return (
    <RequireRole role="student">
      <ConceptsContent />
    </RequireRole>
  );
}
