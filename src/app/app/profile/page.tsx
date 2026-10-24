"use client";

import { useState } from "react";
import Link from "next/link";
import useAsync from "@/hooks/useAsync";
import { useRole } from "@/context/RoleContext";
import { profile } from "@/services";
import PageHeader from "@/components/ui/PageHeader";
import Modal from "@/components/ui/Modal";
import { Loading, ErrorState } from "@/components/ui/States";

function ProfileForm({ initial, role }: { initial: any; role: "student" | "faculty" }) {
  const [v, setV] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [fail, setFail] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const set = (k: string) => (e: any) =>
    setV((s: any) => ({ ...s, [k]: e.target.value }));
  const toggle = (k: string) => (e: any) =>
    setV((s: any) => ({ ...s, [k]: e.target.checked }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (v.name.trim().length < 2) er.name = "Enter your name.";
    if (v.bio.length > 280) er.bio = "Keep your bio under 280 characters.";
    setErrors(er);
    setOk(false);
    if (Object.keys(er).length) return;
    setBusy(true);
    setFail("");
    try {
      await profile.update(role, v);
      setOk(true);
    } catch (err: any) {
      setFail(err.message);
    } finally {
      setBusy(false);
    }
  };

  const requestDeletion = async () => {
    try {
      await profile.requestDeletion();
      setDeleted(true);
    } catch (err: any) {
      setFail(err.message);
    }
    setConfirm(false);
  };

  return (
    <>
      <form
        className="card form"
        onSubmit={submit}
        noValidate
        style={{ maxWidth: "46rem" }}
      >
        <div className="field" data-invalid={errors.name ? "true" : "false"}>
          <label htmlFor="pf-name">Name</label>
          <input
            id="pf-name"
            value={v.name}
            onChange={set("name")}
            autoComplete="name"
          />
          {errors.name && <span className="field__error">{errors.name}</span>}
        </div>
        <div className="field">
          <label htmlFor="pf-college">College</label>
          <input
            id="pf-college"
            value={v.college}
            onChange={set("college")}
            autoComplete="organization"
          />
        </div>
        <div className="field">
          <label htmlFor="pf-dept">Department</label>
          <input
            id="pf-dept"
            value={v.department}
            onChange={set("department")}
          />
        </div>
        {role === "student" && (
          <div className="field">
            <label htmlFor="pf-year">Year</label>
            <select id="pf-year" value={v.year} onChange={set("year")}>
              {["1st year", "2nd year", "3rd year", "4th year"].map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </div>
        )}
        <div className="field" data-invalid={errors.bio ? "true" : "false"}>
          <label htmlFor="pf-bio">Short bio</label>
          <textarea id="pf-bio" value={v.bio} onChange={set("bio")} />
          <span className="field__hint">{v.bio.length} of 280 characters.</span>
          {errors.bio && <span className="field__error">{errors.bio}</span>}
        </div>

        <fieldset
          style={{
            border: 0,
            padding: 0,
            margin: 0,
            display: "grid",
            gap: 12,
          }}
        >
          <legend className="card__label">Preferences</legend>
          <label className="check">
            <input
              type="checkbox"
              checked={v.anonymousByDefault}
              onChange={toggle("anonymousByDefault")}
            />
            Post anonymously by default
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={v.notifyEmail}
              onChange={toggle("notifyEmail")}
            />
            Email me about replies and updates
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={v.notifyPulse}
              onChange={toggle("notifyPulse")}
            />
            Remind me about the Confusion Pulse during lectures
          </label>
        </fieldset>

        {ok && <p className="notice notice--ok" role="status">Profile saved.</p>}
        {fail && <p className="notice notice--error" role="alert">{fail}</p>}
        <div>
          <button className="btn btn--primary" type="submit" disabled={busy}>
            {busy ? "Saving" : "Save profile"}
          </button>
        </div>
      </form>

      <section
        className="card"
        style={{ maxWidth: "46rem" }}
        aria-labelledby="acct-title"
      >
        <h2 id="acct-title" className="card__title">
          Your data
        </h2>
        <p className="card__text">
          Read how your information is handled in the{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>. You can ask for your account and data to be deleted.
        </p>
        {deleted && (
          <p className="notice notice--ok" role="status" style={{ marginTop: 12 }}>
            Deletion request recorded. In this demo nothing is actually deleted.
          </p>
        )}
        <button
          type="button"
          className="btn btn--sm"
          style={{ marginTop: 16 }}
          onClick={() => setConfirm(true)}
        >
          Request account deletion
        </button>
      </section>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Delete your account?"
      >
        <p>
          This asks us to delete your account and personal data. Some records may be
          kept where the law requires it.
        </p>
        <div className="row" style={{ marginTop: 20 }}>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={requestDeletion}
          >
            Yes, request deletion
          </button>
          <button
            type="button"
            className="btn btn--sm"
            onClick={() => setConfirm(false)}
          >
            Keep my account
          </button>
        </div>
      </Modal>
    </>
  );
}

export default function ProfilePage() {
  const { role } = useRole();
  const { data, loading, error, reload } = useAsync(() => profile.get(role), [role]);

  return (
    <>
      <PageHeader
        eyebrow="Shared"
        title="My *profile.*"
        lead="Your details and preferences."
      />
      <div className="app-body">
        {loading && <Loading />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {data && <ProfileForm key={data.id} initial={data} role={role} />}
      </div>
    </>
  );
}
