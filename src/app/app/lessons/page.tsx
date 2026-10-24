"use client";

import { useRef, useState } from "react";
import useAsync from "@/hooks/useAsync";
import { lessons } from "@/services";
import { MockLesson } from "@/services/mockData";
import PageHeader from "@/components/ui/PageHeader";
import TiltCard from "@/components/ui/TiltCard";
import Reveal from "@/components/ui/Reveal";
import Modal from "@/components/ui/Modal";
import { Loading, ErrorState } from "@/components/ui/States";
import { ArrowRight } from "@/components/Icons";
import RequireRole from "@/components/App/RequireRole";

function Player({
  lesson,
  onDone,
}: {
  lesson: MockLesson;
  onDone: (id: string) => void;
}) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [state, setState] = useState<{
    busy: boolean;
    result: { pointsAwarded: number; points: number } | null;
    error: string;
  }>({ busy: false, result: null, error: "" });
  const startX = useRef<number | null>(null);
  const last = i === lesson.steps.length - 1;
  const step = lesson.steps[i];

  const go = (n: number) => {
    if (n < 0 || n > lesson.steps.length - 1) return;
    setDir(n > i ? 1 : -1);
    setI(n);
  };

  const finish = async () => {
    setState({ busy: true, result: null, error: "" });
    try {
      const r = await lessons.complete(lesson.id);
      setState({ busy: false, result: r, error: "" });
      onDone(lesson.id);
    } catch (err: any) {
      setState({ busy: false, result: null, error: err.message });
    }
  };

  if (state.result) {
    return (
      <div className="grid">
        <h3 className="section-title">Lesson complete.</h3>
        <p>
          {state.result.pointsAwarded > 0
            ? `You earned ${state.result.pointsAwarded} points in this demo.`
            : "You already completed this lesson, so no new points were added."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="meta">
        Step {i + 1} of {lesson.steps.length}. Swipe, or use the arrow keys.
      </p>
      <div className="dots" aria-hidden="true">
        {lesson.steps.map((_, n) => (
          <span key={n} className={n <= i ? "on" : ""} />
        ))}
      </div>
      <div
        className="player__stage"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(i + 1);
          if (e.key === "ArrowLeft") go(i - 1);
        }}
        onPointerDown={(e) => {
          startX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (startX.current === null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (Math.abs(dx) > 50) go(dx < 0 ? i + 1 : i - 1);
        }}
        aria-live="polite"
      >
        <div key={i} className="slide" style={{ ["--dir" as any]: dir }}>
          <h3>{step.title}</h3>
          <p>{step.body}</p>
        </div>
      </div>
      {state.error && <p className="notice notice--error" role="alert">{state.error}</p>}
      <div className="row" style={{ marginTop: 16 }}>
        <button
          type="button"
          className="btn btn--sm"
          onClick={() => go(i - 1)}
          disabled={i === 0}
        >
          Back
        </button>
        {last ? (
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={finish}
            disabled={state.busy}
          >
            {state.busy ? "Saving" : "Finish lesson"}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => go(i + 1)}
          >
            Next <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function LessonsContent() {
  const { data, loading, error, reload, setData } = useAsync(() => lessons.list(), []);
  const [current, setCurrent] = useState<MockLesson | null>(null);

  return (
    <>
      <PageHeader
        eyebrow="Student"
        title="Short lessons, *exactly* where you are stuck."
        lead="Each lesson takes a few minutes. Swipe or press the arrow keys to move through the steps."
      />
      <div className="app-body">
        {loading && <Loading />}
        {error && <ErrorState error={error} onRetry={reload} />}
        <div className="grid grid--3">
          {(data || []).map((l: MockLesson, i: number) => (
            <Reveal key={l.id} delay={i * 70}>
              <TiltCard className="card">
                <p className="card__label">
                  {l.concept} · {l.minutes} min
                </p>
                <h2 className="card__title">{l.title}</h2>
                <p className="card__text">
                  {l.steps.length} steps. {l.completed ? "Completed." : "Not started."}
                </p>
                <button
                  type="button"
                  className="btn btn--sm"
                  style={{ marginTop: 16 }}
                  onClick={() => setCurrent(l)}
                >
                  {l.completed ? "Review lesson" : "Start lesson"}
                </button>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>

      <Modal
        open={!!current}
        onClose={() => setCurrent(null)}
        title={current ? current.title : "Lesson"}
      >
        {current && (
          <Player
            key={current.id}
            lesson={current}
            onDone={(id) =>
              setData((d: any) =>
                (d || []).map((x: any) => (x.id === id ? { ...x, completed: true } : x))
              )
            }
          />
        )}
      </Modal>
    </>
  );
}

export default function LessonsPage() {
  return (
    <RequireRole role="student">
      <LessonsContent />
    </RequireRole>
  );
}
