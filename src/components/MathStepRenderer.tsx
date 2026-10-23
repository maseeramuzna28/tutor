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
    <div className="border border-stone-200 bg-white p-4 transition-all hover:border-red-600 rounded-none">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="flex h-5 w-5 items-center justify-center rounded-none bg-stone-950 text-white font-mono text-[10px] font-bold">
          {step.step_number}
        </div>
        <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-stone-900">{step.title}</h4>
      </div>

      <p className="text-xs text-stone-600 leading-relaxed mb-2.5">{step.explanation}</p>

      {renderedLatex && (
        <div className="my-2 overflow-x-auto rounded-none bg-stone-50/70 p-3 text-stone-950 border border-stone-200 text-center text-sm font-mono">
          <div dangerouslySetInnerHTML={{ __html: renderedLatex }} />
        </div>
      )}
    </div>
  );
}
