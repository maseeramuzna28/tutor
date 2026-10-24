"use client";

import { useState } from "react";
import useAsync from "@/hooks/useAsync";
import { courses, curriculum } from "@/services";
import PageHeader from "@/components/ui/PageHeader";
import Reveal from "@/components/ui/Reveal";
import { Loading, ErrorState, Empty } from "@/components/ui/States";
import { formatDate, timeAgo } from "@/utils/format";
import RequireRole from "@/components/App/RequireRole";

function CurriculumContent() {
  const list = useAsync(() => courses.list(), []);
  const updates = useAsync(() => curriculum.list(), []);
  const [v, setV] = useState({
    title: "",
    course: "Data Structures",
    section: "A",
    effective: "",
    body: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [fail, setFail] = useState("");
  const set = (k: string) => (e: any) =>
    setV((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (v.title.trim().length < 4)
      er.title = "Give the update a title of at least 4 characters.";
    if (!v.effective) er.effective = "Choose the date this takes effect.";
    if (v.body.trim().length < 15)
      er.body = "Describe the change in at least 15 characters.";
    setErrors(er);
    setOk(false);
    if (Object.keys(er).length) return;
    setBusy(true);
    setFail("");
    try {
      const u = await curriculum.publish({
        ...v,
        title: v.title.trim(),
        body: v.body.trim(),
      });
      updates.setData((d: any) => [u, ...(d || [])]);
      setV({
        title: "",
        course: v.course,
        section: v.section,
        effective: "",
        body: "",
      });
      setOk(true);
    } catch (err: any) {
      setFail(err.message);
    } finally {
      setBusy(false);
    }
  };

  const courseList = list.data || [];

  return (
    <>
      <PageHeader
        eyebrow="Faculty"
        title="Curriculum *updates.*"
        lead="Publish a change once and every student in the section sees it."
      />
      <div className="app-body">
        <form
          className="card form"
          onSubmit={submit}
          noValidate
          style={{ maxWidth: "46rem" }}
        >
          <div className="field" data-invalid={errors.title ? "true" : "false"}>
            <label htmlFor="cu-title">Title</label>
            <input id="cu-title" value={v.title} onChange={set("title")} />
            {errors.title && <span className="field__error">{errors.title}</span>}
          </div>
          <div className="row">
            <div className="field">
              <label htmlFor="cu-course">Course</label>
              <select id="cu-course" value={v.course} onChange={set("course")}>
                {courseList.map((c: any) => (
                  <option key={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="cu-section">Section</label>
              <select id="cu-section" value={v.section} onChange={set("section")}>
                {["A", "B"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="field" data-invalid={errors.effective ? "true" : "false"}>
              <label htmlFor="cu-date">Takes effect</label>
              <input
                id="cu-date"
                type="date"
                value={v.effective}
                onChange={set("effective")}
              />
              {errors.effective && (
                <span className="field__error">{errors.effective}</span>
              )}
            </div>
          </div>
          <div className="field" data-invalid={errors.body ? "true" : "false"}>
            <label htmlFor="cu-body">What is changing</label>
            <textarea id="cu-body" value={v.body} onChange={set("body")} />
            {errors.body && <span className="field__error">{errors.body}</span>}
          </div>
          {ok && (
            <p className="notice notice--ok" role="status">
              Update published. In this demo students are not notified.
            </p>
          )}
          {fail && <p className="notice notice--error" role="alert">{fail}</p>}
          <div>
            <button className="btn btn--primary" type="submit" disabled={busy}>
              {busy ? "Publishing" : "Publish update"}
            </button>
          </div>
        </form>

        <section aria-labelledby="cu-list">
          <h2 id="cu-list" className="section-title" style={{ marginBottom: 16 }}>
            Published updates
          </h2>
          {updates.loading && <Loading />}
          {updates.error && (
            <ErrorState error={updates.error} onRetry={updates.reload} />
          )}
          {updates.data && updates.data.length === 0 && (
            <Empty
              title="No updates yet"
              text="Updates you publish will appear here."
            />
          )}
          <div className="grid" style={{ maxWidth: "46rem" }}>
            {(updates.data || []).map((u: any, i: number) => (
              <Reveal key={u.id} delay={i * 60}>
                <article className="card">
                  <p className="card__label">
                    {u.course}, Section {u.section} · {timeAgo(u.publishedAt)}
                  </p>
                  <h3 className="card__title">{u.title}</h3>
                  <p className="card__text">{u.body}</p>
                  <p className="meta" style={{ marginTop: 10 }}>
                    Takes effect {formatDate(u.effective)}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export default function CurriculumPage() {
  return (
    <RequireRole role="faculty">
      <CurriculumContent />
    </RequireRole>
  );
}
