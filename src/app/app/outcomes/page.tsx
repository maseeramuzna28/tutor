"use client";

import { useState } from "react";
import useAsync from "@/hooks/useAsync";
import { courses, outcomes } from "@/services";
import PageHeader from "@/components/ui/PageHeader";
import { Loading, ErrorState, Empty } from "@/components/ui/States";
import RequireRole from "@/components/App/RequireRole";

function OutcomesContent() {
  const list = useAsync(() => courses.list(), []);
  const [courseId, setCourseId] = useState("cs201");
  const [onlyBelow, setOnlyBelow] = useState(false);
  const data = useAsync(() => outcomes.get(courseId), [courseId]);

  const rows = (data.data || []).filter(
    (o: any) => !onlyBelow || o.attainment < o.target
  );

  const exportCsv = () => {
    const header = ["Outcome", "Description", "Target %", "Attainment %", "Status"];
    const body = rows.map((o: any) => [
      o.code,
      o.text,
      o.target,
      o.attainment,
      o.attainment >= o.target ? "Met" : "Below target",
    ]);
    const csv = [header, ...body]
      .map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `outcomes-${courseId}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        eyebrow="Faculty"
        title="Learning *outcomes.*"
        lead="Attainment for each course outcome, against the target you set."
      >
        <button
          type="button"
          className="btn"
          onClick={exportCsv}
          disabled={rows.length === 0}
        >
          Export CSV
        </button>
      </PageHeader>
      <div className="app-body">
        <div className="row">
          <div className="field" style={{ minWidth: "16rem" }}>
            <label htmlFor="oc-course">Course</label>
            <select
              id="oc-course"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            >
              {(list.data || [{ id: "cs201", name: "Data Structures" }]).map(
                (c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                )
              )}
            </select>
          </div>
          <label className="check">
            <input
              type="checkbox"
              checked={onlyBelow}
              onChange={(e) => setOnlyBelow(e.target.checked)}
            />
            Show only outcomes below target
          </label>
        </div>

        {data.loading && <Loading />}
        {data.error && <ErrorState error={data.error} onRetry={data.reload} />}
        {data.data && rows.length === 0 && (
          <Empty
            title="Every outcome meets its target"
            text="Turn off the filter to see all outcomes."
          />
        )}

        <div className="grid">
          {rows.map((o: any) => {
            const met = o.attainment >= o.target;
            return (
              <article className="card" key={o.code}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <h2 className="card__title" style={{ marginBottom: 0 }}>
                    {o.code}
                  </h2>
                  <span className="status">{met ? "Met" : "Below target"}</span>
                </div>
                <p className="card__text">{o.text}</p>
                <div className="obar" aria-hidden="true">
                  <span className="obar__fill" style={{ ["--a" as any]: o.attainment }} />
                  <span className="obar__target" style={{ ["--t" as any]: o.target }} />
                </div>
                <p className="meta">
                  Attainment {o.attainment} percent. Target {o.target} percent.
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default function OutcomesPage() {
  return (
    <RequireRole role="faculty">
      <OutcomesContent />
    </RequireRole>
  );
}
