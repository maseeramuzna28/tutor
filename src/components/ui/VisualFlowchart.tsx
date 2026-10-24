"use client";

import React, { useState } from "react";
import katex from "katex";

export interface FlowchartNode {
  id: string;
  label: string;
  type?: "start" | "process" | "decision" | "end" | string;
  stepIndex?: number;
  tag?: string;
  desc?: string;
}

export interface FlowchartEdge {
  from: string;
  to: string;
  label?: string;
}

export interface FlowchartData {
  title: string;
  nodes: FlowchartNode[];
  edges?: FlowchartEdge[];
}

export function MathBlock({ formula }: { formula: string }) {
  try {
    const html = katex.renderToString(formula.replace(/^\$\$|\$\$$/g, "").replace(/^\$|\$$/g, ""), {
      displayMode: formula.includes("$$") || formula.includes("\\begin"),
      throwOnError: false,
    });
    return (
      <div
        className="my-3 overflow-x-auto rounded border border-[var(--rule)] bg-[var(--surface)] p-3 text-center text-sm shadow-sm"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch {
    return <pre className="my-2 p-2 bg-[var(--surface)] text-xs overflow-x-auto">{formula}</pre>;
  }
}

export default function VisualFlowchart({
  flowchart,
  currentStep = 0,
  onSelectStep,
  concept,
  rootCause,
  subject,
}: {
  flowchart?: FlowchartData;
  currentStep?: number;
  onSelectStep?: (index: number) => void;
  concept?: string;
  rootCause?: string;
  subject?: string;
}) {
  const [activeTab, setActiveTab] = useState<"flowchart" | "logic">("flowchart");

  if (!flowchart || !flowchart.nodes || flowchart.nodes.length === 0) {
    return null;
  }

  const nodes = flowchart.nodes;

  return (
    <div className="visual-card border border-[var(--rule)] rounded-md bg-[var(--surface)] p-4 sm:p-5 my-6 shadow-sm">
      {/* Top Banner: Concept & Diagnostic Prerequisite */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--rule)] pb-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[var(--paper)] text-[var(--signal)] border border-[var(--rule)]">
            {subject || "Computer Science & Engineering"}
          </span>
          {concept && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[rgba(200,16,46,0.08)] text-[var(--signal)]">
              Concept: {concept}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`btn-text text-xs ${activeTab === "flowchart" ? "font-bold text-[var(--signal)] underline" : "text-[var(--ink-2)]"}`}
            onClick={() => setActiveTab("flowchart")}
          >
            Visual Flowchart
          </button>
          <span className="text-[var(--rule)]">|</span>
          <button
            type="button"
            className={`btn-text text-xs ${activeTab === "logic" ? "font-bold text-[var(--signal)] underline" : "text-[var(--ink-2)]"}`}
            onClick={() => setActiveTab("logic")}
          >
            Prerequisite Logic
          </button>
        </div>
      </div>

      {rootCause && (
        <div className="mb-4 p-3 rounded bg-[rgba(200,16,46,0.04)] border-l-2 border-[var(--signal)] text-xs text-[var(--ink)]">
          <strong className="font-mono text-[11px] uppercase tracking-wider text-[var(--signal)] block mb-0.5">
            Prerequisite Knowledge Gap Identified
          </strong>
          {rootCause}
        </div>
      )}

      {/* Tab 1: Interactive SVG Flowchart Diagram */}
      {activeTab === "flowchart" && (
        <div>
          <h4 className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-muted)] mb-3">
            {flowchart.title || "Step-by-Step Logic Pipeline"}
          </h4>

          {/* Responsive Flowchart Pipeline */}
          <div className="flowchart-container overflow-x-auto py-2">
            <div className="flex items-center gap-3 min-w-[580px] justify-between">
              {nodes.map((node, index) => {
                const isActive = (node.stepIndex !== undefined && node.stepIndex < currentStep) || index === 0;
                const isCurrent = node.stepIndex === currentStep - 1;
                const isDecision = node.type === "decision";
                const isStartOrEnd = node.type === "start" || node.type === "end";

                return (
                  <React.Fragment key={node.id}>
                    {/* Node Card */}
                    <div
                      onClick={() => node.stepIndex !== undefined && onSelectStep && onSelectStep(node.stepIndex + 1)}
                      className={`flowchart-node relative flex-1 p-3 rounded border text-left cursor-pointer transition-all duration-200 ${
                        isCurrent
                          ? "border-[var(--signal)] bg-[rgba(200,16,46,0.06)] shadow-sm scale-[1.02]"
                          : isActive
                          ? "border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)]"
                          : "border-[var(--rule)] bg-[var(--paper-2)] text-[var(--ink-muted)] opacity-70 hover:opacity-100"
                      }`}
                      style={{ minWidth: "130px" }}
                    >
                      {/* Node Tag & Type Indicator */}
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-mono text-[10px] uppercase font-semibold text-[var(--signal)]">
                          {node.tag || `Node ${index + 1}`}
                        </span>
                        {isDecision && (
                          <span className="text-[10px] px-1 py-0.2 rounded bg-amber-100 text-amber-900 font-mono">
                            Check
                          </span>
                        )}
                        {isStartOrEnd && (
                          <span className="text-[10px] px-1 py-0.2 rounded bg-slate-200 text-slate-800 font-mono">
                            {node.type === "start" ? "Input" : "Goal"}
                          </span>
                        )}
                      </div>

                      {/* Node Label */}
                      <p className="text-xs font-semibold leading-snug line-clamp-2 text-[var(--ink)]">
                        {node.label}
                      </p>

                      {/* Node Brief Desc */}
                      {node.desc && (
                        <p className="text-[11px] text-[var(--ink-muted)] mt-1 line-clamp-2 leading-tight">
                          {node.desc}
                        </p>
                      )}

                      {/* Current Step Glow */}
                      {isCurrent && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--signal)] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--signal)]"></span>
                        </span>
                      )}
                    </div>

                    {/* Connecting Arrow */}
                    {index < nodes.length - 1 && (
                      <div className="flex flex-col items-center justify-center shrink-0 px-1">
                        <span className="text-[10px] font-mono text-[var(--ink-muted)] mb-0.5">
                          {flowchart.edges?.[index]?.label || "──►"}
                        </span>
                        <svg className="w-5 h-4 text-[var(--signal)]" viewBox="0 0 20 16" fill="currentColor">
                          <path d="M0 7h14v2H0V7zm12-4l6 5-6 5V3z" />
                        </svg>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          <p className="text-[11px] text-[var(--ink-muted)] mt-3">
            Click any node in the flowchart to navigate directly to that derivation step.
          </p>
        </div>
      )}

      {/* Tab 2: Prerequisite & Logic Hierarchy */}
      {activeTab === "logic" && (
        <div className="space-y-3">
          <h4 className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-muted)]">
            Conceptual Hierarchy & Dependency Breakdown
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded border border-[var(--rule)] bg-[var(--paper)]">
              <span className="font-mono text-[10px] text-[var(--signal)] font-bold block mb-1">
                1. Foundational Axiom
              </span>
              <p className="text-xs text-[var(--ink)]">
                Base definitions and verified constraints governing the domain.
              </p>
            </div>
            <div className="p-3 rounded border border-[var(--rule)] bg-[var(--paper)]">
              <span className="font-mono text-[10px] text-[var(--signal)] font-bold block mb-1">
                2. Transformation Engine
              </span>
              <p className="text-xs text-[var(--ink)]">
                Mathematical operations and algorithmic invariants moving state forward.
              </p>
            </div>
            <div className="p-3 rounded border border-[var(--rule)] bg-[var(--paper)]">
              <span className="font-mono text-[10px] text-[var(--signal)] font-bold block mb-1">
                3. Edge-Case Invariant
              </span>
              <p className="text-xs text-[var(--ink)]">
                Boundary guarantees ensuring no infinite loops, overflows, or contradictions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
