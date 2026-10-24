"use client";

import Link from "next/link";
import useAsync from "@/hooks/useAsync";
import { dashboard } from "@/services";
import PageHeader from "@/components/ui/PageHeader";
import Reveal from "@/components/ui/Reveal";
import TiltCard from "@/components/ui/TiltCard";
import { Loading, ErrorState } from "@/components/ui/States";
import { ArrowRight } from "@/components/Icons";
import RequireRole from "@/components/App/RequireRole";

function FacultyContent() {
  const { data, loading, error, reload } = useAsync(() => dashboard.faculty(), []);

  return (
    <>
      <PageHeader
        eyebrow="Faculty"
        title="Your sections at a *glance.*"
        lead="Open questions, flagged topics and recent student questions, in one place."
      >
        <Link className="btn btn--primary" href="/app/curriculum">
          Publish an update <ArrowRight />
        </Link>
      </PageHeader>
      <div className="app-body">
        {loading && <Loading />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {data && (
          <>
            <section aria-labelledby="sec-title">
              <h2 id="sec-title" className="section-title" style={{ marginBottom: 16 }}>
                Sections
              </h2>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Section</th>
                      <th>Enrolled</th>
                      <th>Open questions</th>
                      <th>Flagged topics</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sections.map((s: any) => (
                      <tr key={s.course + s.section}>
                        <td>{s.course}</td>
                        <td>{s.section}</td>
                        <td>{s.enrolled}</td>
                        <td>{s.openDoubts}</td>
                        <td>{s.flagged}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="grid grid--2">
              <Reveal>
                <TiltCard className="card">
                  <p className="card__label">Most flagged topics</p>
                  <ul className="list">
                    {data.flagged.map((t: any) => (
                      <li key={t.id}>
                        <p>
                          <strong>{t.name}</strong>
                        </p>
                        <div className="bar" style={{ marginTop: 6 }} aria-hidden="true">
                          <span style={{ ["--w" as any]: t.heat }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </TiltCard>
              </Reveal>
              <Reveal delay={100}>
                <TiltCard className="card">
                  <p className="card__label">Recent student questions</p>
                  <ul className="list">
                    {data.recentQuestions.map((q: string) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                  <Link className="card__link" href="/app/outcomes">
                    Open outcome dashboard <ArrowRight size={16} />
                  </Link>
                </TiltCard>
              </Reveal>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default function FacultyDashboardPage() {
  return (
    <RequireRole role="faculty">
      <FacultyContent />
    </RequireRole>
  );
}
