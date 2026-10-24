"use client";

import Link from "next/link";
import useAsync from "@/hooks/useAsync";
import { dashboard } from "@/services";
import PageHeader from "@/components/ui/PageHeader";
import TiltCard from "@/components/ui/TiltCard";
import Reveal from "@/components/ui/Reveal";
import { Loading, ErrorState } from "@/components/ui/States";
import { timeAgo } from "@/utils/format";
import { ArrowRight } from "@/components/Icons";
import RequireRole from "@/components/App/RequireRole";

function StudentDashboardContent() {
  const { data, loading, error, reload } = useAsync(() => dashboard.student(), []);

  return (
    <>
      <PageHeader
        eyebrow="Student"
        title="Pick up where you *left* *off.*"
        lead="Your open questions, the next lesson, and the topic your class finds hardest."
      />
      <div className="app-body">
        {loading && <Loading />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {data && (
          <div className="grid grid--3">
            <Reveal>
              <TiltCard className="card">
                <p className="card__label">Next lesson</p>
                <h2 className="card__title">{data.suggestedLesson?.title || "Recursion in four steps"}</h2>
                <p className="card__text">
                  {data.suggestedLesson?.minutes || 6} minutes on {data.suggestedLesson?.concept || "Recursion"}.
                </p>
                <Link className="card__link" href="/app/lessons">
                  Open lessons <ArrowRight size={16} />
                </Link>
              </TiltCard>
            </Reveal>

            <Reveal delay={80}>
              <TiltCard className="card">
                <p className="card__label">Recent questions</p>
                <ul className="list">
                  {(data.openDoubts || []).map((d: any) => (
                    <li key={d.id}>
                      <p>{d.question}</p>
                      <p className="meta">{timeAgo(d.createdAt)}</p>
                    </li>
                  ))}
                </ul>
                <Link className="card__link" href="/app/tutor">
                  Ask the tutor <ArrowRight size={16} />
                </Link>
              </TiltCard>
            </Reveal>

            <Reveal delay={160}>
              <TiltCard className="card">
                <p className="card__label">Hardest topic in Data Structures</p>
                <h2 className="card__title">{data.topFlagged?.name || "Semaphores"}</h2>
                <div className="bar" aria-hidden="true">
                  <span style={{ ["--w" as any]: data.topFlagged?.heat || 60 }} />
                </div>
                <Link className="card__link" href="/app/confusion">
                  Open the Confusion Map <ArrowRight size={16} />
                </Link>
              </TiltCard>
            </Reveal>

            <Reveal delay={240}>
              <TiltCard className="card">
                <p className="card__label">Your points</p>
                <p className="big-number">{data.points ?? 240}</p>
                <p className="card__text">{data.streak ?? 4} day study streak.</p>
                <Link className="card__link" href="/app/rewards">
                  See the leaderboard <ArrowRight size={16} />
                </Link>
              </TiltCard>
            </Reveal>

            <Reveal delay={320}>
              <TiltCard className="card">
                <p className="card__label">Latest in the class feed</p>
                <p className="card__text">{data.latestPost?.body || "Welcome to the class community feed!"}</p>
                <p className="meta">
                  {data.latestPost?.author || "Community"}, {timeAgo(data.latestPost?.createdAt || new Date().toISOString())}
                </p>
                <Link className="card__link" href="/app/community">
                  Open the feed <ArrowRight size={16} />
                </Link>
              </TiltCard>
            </Reveal>
          </div>
        )}
      </div>
    </>
  );
}

export default function StudentDashboardPage() {
  return (
    <RequireRole role="student">
      <StudentDashboardContent />
    </RequireRole>
  );
}
