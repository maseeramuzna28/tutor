"use client";

import { useEffect, useState } from "react";
import useAsync from "@/hooks/useAsync";
import { courses, confusion } from "@/services";
import PageHeader from "@/components/ui/PageHeader";
import HeatGrid from "@/components/ui/HeatGrid";
import { Loading, ErrorState } from "@/components/ui/States";
import RequireRole from "@/components/App/RequireRole";

function ConfusionContent() {
  const list = useAsync(() => courses.list(), []);
  const [courseId, setCourseId] = useState("cs201");
  const map = useAsync(() => confusion.map(courseId), [courseId]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [markError, setMarkError] = useState("");

  const [cool, setCool] = useState(0);
  const [pings, setPings] = useState(0);
  const [pulseError, setPulseError] = useState("");

  useEffect(() => {
    if (cool <= 0) return;
    const t = setTimeout(() => setCool((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cool]);

  const mark = async (topicId: string) => {
    setBusyId(topicId);
    setMarkError("");
    try {
      const t = await confusion.mark(courseId, topicId);
      map.setData((d: any) => (d || []).map((x: any) => (x.id === t.id ? t : x)));
    } catch (err: any) {
      setMarkError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const pulse = async () => {
    setPulseError("");
    try {
      await confusion.pulse(courseId);
      setPings((n) => n + 1);
      setCool(20);
    } catch (err: any) {
      setPulseError(err.message);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Student"
        title="Where the class is *stuck.*"
        lead="Mark the topics you did not follow. During a lecture, send one pulse when you lose the thread."
      />
      <div className="app-body">
        <div className="field" style={{ maxWidth: "22rem" }}>
          <label htmlFor="course">Course</label>
          <select
            id="course"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            {(list.data || [{ id: "cs201", name: "Data Structures" }]).map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <section aria-labelledby="map-title">
          <h2 id="map-title" className="section-title" style={{ marginBottom: 16 }}>
            Confusion Map
          </h2>
          {map.loading && <Loading />}
          {map.error && <ErrorState error={map.error} onRetry={map.reload} />}
          {markError && <p className="notice notice--error" role="alert">{markError}</p>}
          {map.data && <HeatGrid topics={map.data} onMark={mark} busyId={busyId} />}
        </section>

        <section className="card" aria-labelledby="pulse-title">
          <h2 id="pulse-title" className="card__title">
            Live Confusion Pulse
          </h2>
          <p className="card__text" style={{ marginBottom: 16 }}>
            Press once when the lecture loses you. You can send another pulse after a short wait.
          </p>
          <div className="pulse">
            <button
              type="button"
              className="pulse__btn"
              onClick={pulse}
              disabled={cool > 0}
            >
              {pings > 0 && <span key={pings} className="pulse__ring" />}
              {cool > 0 ? `Pulse sent. Next in ${cool}s` : "Send a pulse"}
            </button>
            <p className="meta" role="status">
              You sent {pings} {pings === 1 ? "pulse" : "pulses"} in this session.
            </p>
            {pulseError && <p className="notice notice--error" role="alert">{pulseError}</p>}
          </div>
        </section>
      </div>
    </>
  );
}

export default function ConfusionPage() {
  return (
    <RequireRole role="student">
      <ConfusionContent />
    </RequireRole>
  );
}
