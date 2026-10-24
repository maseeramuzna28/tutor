"use client";

import { useMemo, useState } from "react";
import useAsync from "@/hooks/useAsync";
import { projects } from "@/services";
import { MockProject } from "@/services/mockData";
import PageHeader from "@/components/ui/PageHeader";
import TiltCard from "@/components/ui/TiltCard";
import Reveal from "@/components/ui/Reveal";
import Modal from "@/components/ui/Modal";
import { Loading, ErrorState, Empty } from "@/components/ui/States";
import { Plus } from "@/components/Icons";
import RequireRole from "@/components/App/RequireRole";

function NewProject({
  onCreated,
  onClose,
}: {
  onCreated: (p: MockProject) => void;
  onClose: () => void;
}) {
  const [v, setV] = useState({ title: "", summary: "", skills: "", teamSize: 4 });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState("");
  const set = (k: string) => (e: any) =>
    setV((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (v.title.trim().length < 4)
      er.title = "Give the project a title of at least 4 characters.";
    if (v.summary.trim().length < 15)
      er.summary = "Describe the project in at least 15 characters.";
    if (!v.skills.trim())
      er.skills = "List at least one skill, separated by commas.";
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    setFail("");
    try {
      const p = await projects.create({
        title: v.title.trim(),
        summary: v.summary.trim(),
        skills: v.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        teamSize: Number(v.teamSize),
      });
      onCreated(p);
      onClose();
    } catch (err: any) {
      setFail(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="field" data-invalid={errors.title ? "true" : "false"}>
        <label htmlFor="pj-title">Title</label>
        <input id="pj-title" value={v.title} onChange={set("title")} />
        {errors.title && <span className="field__error">{errors.title}</span>}
      </div>
      <div className="field" data-invalid={errors.summary ? "true" : "false"}>
        <label htmlFor="pj-summary">What are you building?</label>
        <textarea id="pj-summary" value={v.summary} onChange={set("summary")} />
        {errors.summary && <span className="field__error">{errors.summary}</span>}
      </div>
      <div className="field" data-invalid={errors.skills ? "true" : "false"}>
        <label htmlFor="pj-skills">Skills needed</label>
        <input id="pj-skills" value={v.skills} onChange={set("skills")} />
        <span className="field__hint">Separate with commas, for example React, SQL, design.</span>
        {errors.skills && <span className="field__error">{errors.skills}</span>}
      </div>
      <div className="field">
        <label htmlFor="pj-size">Team size</label>
        <select id="pj-size" value={v.teamSize} onChange={set("teamSize")}>
          {[2, 3, 4, 5, 6].map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </div>
      {fail && <p className="notice notice--error" role="alert">{fail}</p>}
      <div>
        <button className="btn btn--primary" type="submit" disabled={busy}>
          {busy ? "Posting" : "Post project"}
        </button>
      </div>
    </form>
  );
}

function ProjectsContent() {
  const { data, loading, error, reload, setData } = useAsync(() => projects.list(), []);
  const [query, setQuery] = useState("");
  const [skill, setSkill] = useState("All");
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");

  const skills = useMemo(
    () => [
      "All",
      ...Array.from(new Set((data || []).flatMap((p) => p.skills))),
    ],
    [data]
  );

  const visible = (data || []).filter(
    (p) =>
      (skill === "All" || p.skills.includes(skill)) &&
      (p.title + " " + p.summary).toLowerCase().includes(query.toLowerCase())
  );

  const interest = async (id: string) => {
    setData((d) =>
      (d || []).map((p) => (p.id === id ? { ...p, interested: true } : p))
    );
    try {
      await projects.interest(id);
      setNote("Interest recorded. In this demo nobody is notified.");
    } catch {
      reload();
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Student"
        title="College *projects.*"
        lead="Find teammates for a project, or post your own and say which skills you need."
      >
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => setOpen(true)}
        >
          <Plus size={18} /> Post a project
        </button>
      </PageHeader>

      <div className="app-body">
        <div className="field" style={{ maxWidth: "26rem" }}>
          <label htmlFor="pj-search">Search projects</label>
          <input
            id="pj-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="chips" role="group" aria-label="Filter by skill">
          {skills.map((s) => (
            <button
              key={s}
              type="button"
              className="chip"
              aria-pressed={skill === s}
              onClick={() => setSkill(s)}
            >
              {s}
            </button>
          ))}
        </div>
        {note && <p className="notice notice--ok" role="status">{note}</p>}

        {loading && <Loading />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {data && visible.length === 0 && (
          <Empty title="No projects match" text="Try a different search or skill." />
        )}

        <div className="grid grid--3">
          {visible.map((p, i) => (
            <Reveal key={p.id} delay={i * 60}>
              <TiltCard className="card">
                <p className="card__label">
                  {p.members} of {p.teamSize} on the team
                </p>
                <h2 className="card__title">{p.title}</h2>
                <p className="card__text">{p.summary}</p>
                <div className="chips" style={{ margin: "14px 0" }}>
                  {p.skills.map((s) => (
                    <span className="tag" key={s}>
                      {s}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn--sm"
                  disabled={p.interested}
                  onClick={() => interest(p.id)}
                >
                  {p.interested ? "Interest sent" : "I am interested"}
                </button>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Post a project">
        <NewProject
          onCreated={(p) => setData((d) => [p, ...(d || [])])}
          onClose={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}

export default function ProjectsPage() {
  return (
    <RequireRole role="student">
      <ProjectsContent />
    </RequireRole>
  );
}
