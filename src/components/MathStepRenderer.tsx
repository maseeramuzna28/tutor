"use client";

import { useMemo } from "react";
import katex from "katex";
import { StepItem } from "@/lib/types";

interface MathStepRendererProps {
  steps: StepItem[];
  activeStepNumber?: number;
  onSelectStep?: (stepNumber: number) => void;
}

export default function MathStepRenderer({ steps, activeStepNumber, onSelectStep }: MathStepRendererProps) {
  return (
    <div className="space-y-3">
      {steps.map((step) => (
        <StepCard
          key={step.step_number}
          step={step}
          isActive={activeStepNumber === step.step_number}
          onSelect={onSelectStep ? () => onSelectStep(step.step_number) : undefined}
        />
      ))}
    </div>
  );
}

function StepCard({
  step,
  isActive,
  onSelect,
}: {
  step: StepItem;
  isActive?: boolean;
  onSelect?: () => void;
}) {
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
    <div
      onClick={onSelect}
      className={`border p-4 transition-all rounded-none cursor-pointer ${
        isActive
          ? "border-red-600 bg-red-50/30 ring-1 ring-red-500 shadow-xs"
          : "border-stone-200 bg-white hover:border-stone-400"
      }`}
    >
      <div className="flex items-center justify-between gap-2.5 mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-5 w-5 items-center justify-center rounded-none font-mono text-[10px] font-bold ${
              isActive ? "bg-red-600 text-white" : "bg-stone-950 text-white"
            }`}
          >
            {step.step_number}
          </div>
          <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-stone-900">
            {step.title}
          </h4>
        </div>

        {isActive && (
          <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider text-red-600 bg-red-100 px-1.5 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-ping" />
            Active Step
          </span>
        )}
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
