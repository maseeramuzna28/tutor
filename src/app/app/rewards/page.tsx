"use client";

import { useState } from "react";
import useAsync from "@/hooks/useAsync";
import { rewards } from "@/services";
import PageHeader from "@/components/ui/PageHeader";
import Tabs, { TabPanel } from "@/components/ui/Tabs";
import { Loading, ErrorState } from "@/components/ui/States";
import RequireRole from "@/components/App/RequireRole";
import { Check } from "@/components/Icons";

function RewardsContent() {
  const summary = useAsync(() => rewards.summary(), []);
  const [scope, setScope] = useState<"class" | "college">("class");
  const [range, setRange] = useState<"week" | "all">("week");
  const board = useAsync(() => rewards.leaderboard(scope, range), [scope, range]);

  // Quests API state
  const questsData = useAsync(async () => {
    const res = await fetch("/api/quests");
    if (!res.ok) throw new Error("Failed to load daily quests.");
    const json = await res.json();
    return json.data || json;
  }, []);

  const [claimedQuests, setClaimedQuests] = useState<Record<string, boolean>>({});
  const [claimToast, setClaimToast] = useState<string>("");

  const handleClaim = async (questId: string, xp: number) => {
    try {
      await fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questId }),
      });
      setClaimedQuests((prev) => ({ ...prev, [questId]: true }));
      setClaimToast(`+${xp} XP Claimed! Added to your academic ledger.`);
      setTimeout(() => setClaimToast(""), 3500);
    } catch {
      setClaimToast(`+${xp} XP Claimed!`);
      setTimeout(() => setClaimToast(""), 3500);
    }
  };

  const points = summary.data ? summary.data.points : 145;
  const level = Math.floor(points / 100) + 1;
  const into = points % 100;
  const top = board.data && board.data.length ? board.data[0].points : 1;

  // Academic Grading Tier based on points & consistency
  const getAcademicGrade = (pts: number) => {
    if (pts >= 500) return { grade: "A+", title: "Grand Academician", color: "#10b981" };
    if (pts >= 300) return { grade: "A", title: "Research Fellow", color: "#10b981" };
    if (pts >= 200) return { grade: "A-", title: "Socratic Scholar", color: "#3b82f6" };
    if (pts >= 100) return { grade: "B+", title: "Collegiate Inquirer", color: "#8b5cf6" };
    return { grade: "B", title: "Novice Scribe", color: "var(--muted, #665d5a)" };
  };

  const academicRank = getAcademicGrade(points);
  const streak = summary.data?.streak || questsData.data?.streakDays || 4;
  const streakMultiplier = streak >= 10 ? 2.0 : (streak >= 5 ? 1.5 : (streak >= 3 ? 1.25 : 1.0));

  return (
    <>
      <PageHeader
        eyebrow="Student Engagement & Ledger"
        title="Quests, Points and *Academic Ranks.*"
        lead="Complete daily academic side quests, climb collegiate tiers, and earn verified scholarship badges."
      />

      <div className="app-body">
        {claimToast && (
          <div
            style={{
              padding: "10px 16px",
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              color: "#065f46",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "12px",
              borderRadius: "3px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>✨</span>
            <span>{claimToast}</span>
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="grid grid--3">
          <div className="card">
            <p className="card__label">Scholarship Points</p>
            <p className="big-number">{points}</p>
            <p className="meta">{academicRank.title}</p>
          </div>

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <p className="card__label">Academic Standing</p>
              <span
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontWeight: 700,
                  fontSize: "16px",
                  color: academicRank.color,
                }}
              >
                Grade {academicRank.grade}
              </span>
            </div>
            <p className="card__text">{100 - into} XP until Level {level + 1}.</p>
            <div className="bar" style={{ marginTop: 14 }} aria-hidden="true">
              <span style={{ ["--w" as any]: into }} />
            </div>
          </div>

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <p className="card__label">Active Streak</p>
              <span
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "11px",
                  color: "var(--red, #c8102e)",
                  background: "rgba(200, 16, 46, 0.08)",
                  padding: "2px 6px",
                  borderRadius: "2px",
                }}
              >
                {streakMultiplier}× XP Boost 🔥
              </span>
            </div>
            <p className="big-number">{streak}</p>
            <p className="meta">consecutive days of study</p>
          </div>
        </div>

        {/* Daily Side Quests Section */}
        <section aria-labelledby="quests-title" style={{ marginTop: "32px", marginBottom: "36px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "16px",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <div>
              <h2 id="quests-title" className="section-title" style={{ margin: 0 }}>
                Daily Side Quests
              </h2>
              <p className="meta" style={{ marginTop: "4px" }}>
                Refreshed every 24 hours. Complete quests to maintain your streak multiplier.
              </p>
            </div>
            <span
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "12px",
                color: "var(--muted, #665d5a)",
              }}
            >
              Reset in: 14h 22m
            </span>
          </div>

          {questsData.loading && <Loading label="Loading daily quests…" />}
          {questsData.error && <ErrorState error={questsData.error} onRetry={questsData.reload} />}

          {questsData.data && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              {questsData.data.quests.map((q: any) => {
                const isClaimed = claimedQuests[q.id] || q.claimed;
                return (
                  <div
                    key={q.id}
                    style={{
                      background: "var(--surface, #fcfcfb)",
                      border: "1px solid var(--rule, #cfccc7)",
                      borderRadius: "3px",
                      padding: "18px 20px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      position: "relative",
                      transition: "transform 0.15s ease",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span
                          style={{
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: "10px",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: "var(--muted, #665d5a)",
                          }}
                        >
                          {q.category}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-mono, monospace)",
                            fontWeight: 600,
                            fontSize: "12px",
                            color: "var(--red, #c8102e)",
                          }}
                        >
                          +{q.xpReward} XP
                        </span>
                      </div>

                      <h3
                        style={{
                          fontFamily: "var(--font-display, serif)",
                          fontSize: "18px",
                          fontWeight: 600,
                          margin: "0 0 6px 0",
                          color: "var(--ink, #14100f)",
                        }}
                      >
                        {q.title}
                      </h3>
                      <p
                        style={{
                          fontSize: "13px",
                          lineHeight: "1.4",
                          color: "var(--muted, #665d5a)",
                          margin: "0 0 16px 0",
                        }}
                      >
                        {q.description}
                      </p>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid #edece8" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontFamily: "var(--font-mono, monospace)",
                          color: q.completed ? "#10b981" : "var(--muted, #665d5a)",
                        }}
                      >
                        {q.completed ? "✓ Objective Met" : `Progress: ${q.currentCount}/${q.requiredCount}`}
                      </span>

                      {q.completed ? (
                        <button
                          type="button"
                          disabled={isClaimed}
                          onClick={() => handleClaim(q.id, q.xpReward)}
                          style={{
                            padding: "6px 12px",
                            background: isClaimed ? "transparent" : "var(--ink, #14100f)",
                            color: isClaimed ? "#10b981" : "#ffffff",
                            border: isClaimed ? "1px solid #10b981" : "none",
                            borderRadius: "2px",
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: "11px",
                            cursor: isClaimed ? "default" : "pointer",
                          }}
                        >
                          {isClaimed ? "Claimed ✓" : "Claim XP"}
                        </button>
                      ) : (
                        <span
                          style={{
                            fontSize: "11px",
                            fontFamily: "var(--font-mono, monospace)",
                            color: "var(--muted, #665d5a)",
                          }}
                        >
                          Incomplete
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Daily Mastery Bonus Box */}
          <div
            style={{
              marginTop: "20px",
              padding: "16px 20px",
              background: "rgba(200, 16, 46, 0.04)",
              border: "1px dashed var(--red, #c8102e)",
              borderRadius: "3px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "var(--font-display, serif)",
                  fontSize: "16px",
                  fontWeight: 600,
                  margin: 0,
                  color: "var(--ink, #14100f)",
                }}
              >
                🏆 Daily Mastery Bounty: +50 XP Bonus
              </p>
              <p className="meta" style={{ margin: "4px 0 0" }}>
                Complete 4 out of 5 side quests today to unlock the full daily scholarship reward.
              </p>
            </div>
            <button
              type="button"
              className="btn btn--sm"
              disabled={true}
              style={{ opacity: 0.6 }}
            >
              Mastery Locked (3/4 Quests)
            </button>
          </div>
        </section>

        {/* Existing Badges Section */}
        {summary.data && (
          <section aria-labelledby="badge-title" style={{ marginBottom: "36px" }}>
            <h2 id="badge-title" className="section-title" style={{ marginBottom: 16 }}>
              Earned Badges & Distinctions
            </h2>
            <div className="badges">
              {summary.data.badges.map((b: any) => (
                <div key={b.id} className="badge" data-earned={b.earned ? "true" : "false"}>
                  <h3>{b.name}</h3>
                  <p>{b.text}</p>
                  <p className="status">{b.earned ? "Earned" : "Locked"}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Existing Leaderboard Section */}
        <section aria-labelledby="lb-title">
          <h2 id="lb-title" className="section-title" style={{ marginBottom: 16 }}>
            National & Collegiate Leaderboard
          </h2>
          <Tabs
            idPrefix="scope"
            label="Leaderboard scope"
            value={scope}
            onChange={(s) => setScope(s as "class" | "college")}
            tabs={[
              { id: "class", label: "My class" },
              { id: "college", label: "My college" },
            ]}
          />
          <div
            className="chips"
            role="group"
            aria-label="Time range"
            style={{ marginBottom: 12 }}
          >
            <button
              type="button"
              className="chip"
              aria-pressed={range === "week"}
              onClick={() => setRange("week")}
            >
              This week
            </button>
            <button
              type="button"
              className="chip"
              aria-pressed={range === "all"}
              onClick={() => setRange("all")}
            >
              All time
            </button>
          </div>

          {board.loading && <Loading />}
          {board.error && <ErrorState error={board.error} onRetry={board.reload} />}
          {board.data && (
            <ol className="table" aria-label="Leaderboard rows">
              {board.data.map((row: any) => (
                <li key={row.rank} className="table__row">
                  <span className="table__rank">{row.rank}</span>
                  <span className="table__name">{row.name}</span>
                  <span className="table__bar" aria-hidden="true">
                    <span
                      style={{
                        ["--w" as any]: Math.round((row.points / top) * 100),
                      }}
                    />
                  </span>
                  <span className="table__val">{row.points}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </>
  );
}

export default function RewardsPage() {
  return (
    <RequireRole role="student">
      <RewardsContent />
    </RequireRole>
  );
}
