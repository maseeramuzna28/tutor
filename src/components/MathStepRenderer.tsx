"use client";

import { useMemo } from "react";
import katex from "katex";
import { StepItem } from "@/lib/types";

interface MathStepRendererProps {
  steps: StepItem[];
}

export default function MathStepRenderer({ steps }: MathStepRendererProps) {
  return (
    <div className="space-y-3">
      {steps.map((step) => (
        <StepCard key={step.step_number} step={step} />
      ))}
    </div>
  );
}

function StepCard({ step }: { step: StepItem }) {
  const renderedLatex = useMemo(() => {
    if (!step.latex) return null;
    try {
      return katex.renderToString(step.latex, {
        displayMode: true,
        throwOnError: false,
      });
    } catch {
      return step.latex;
    }
  }, [step.latex]);

  return (
    <div className="craft-panel p-4 transition-all hover:border-indigo-200 shadow-xs">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold border border-indigo-200">
          {step.step_number}
        </div>
        <h4 className="text-xs font-bold text-slate-900 tracking-tight">{step.title}</h4>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed mb-2.5">{step.explanation}</p>

      {renderedLatex && (
        <div className="my-2 overflow-x-auto rounded-lg bg-slate-50 p-3 text-slate-900 border border-slate-200 text-center text-sm shadow-xs">
          <div dangerouslySetInnerHTML={{ __html: renderedLatex }} />
        </div>
      )}
    </div>
  );
}
