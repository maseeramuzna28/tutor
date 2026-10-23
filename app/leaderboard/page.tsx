"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { User } from "@/lib/types";
import { Award, Trophy, Globe, Building2 } from "lucide-react";

export default function LeaderboardPage() {
  const [scope, setScope] = useState<"college" | "national">("national");
  const [board, setBoard] = useState<
    { rank: number; display_name: string; college: string; points: number; is_current: boolean }[]
  >([]);
  const [currentUser, setCurrentUser] = useState<User>(apiClient.getCurrentUser());

  useEffect(() => {
    setCurrentUser(apiClient.getCurrentUser());
    loadBoard();
  }, [scope]);

  const loadBoard = async () => {
    const list = await apiClient.getLeaderboard(scope);
    setBoard(list);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 mb-16 md:mb-0">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Academic Recognition</h1>
            <span className="craft-badge craft-badge-amber">
              Verified Credits
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Points earned through peer assistance, verified answers, and collaborative project contributions.
          </p>
        </div>

        {/* Scope Toggle */}
        <div className="flex rounded-lg border border-slate-200 bg-white p-1 text-xs shadow-xs">
          <button
            onClick={() => setScope("national")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-semibold transition-all ${
              scope === "national"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>All India</span>
          </button>

          <button
            onClick={() => setScope("college")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-semibold transition-all ${
              scope === "college"
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>{currentUser.college}</span>
          </button>
        </div>
      </div>

      {/* Point Rules Summary */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="craft-panel p-3 shadow-xs">
          <p className="text-sm font-bold text-indigo-600">+5 pts</p>
          <p className="text-[10px] font-medium text-slate-500 mt-0.5">Post Doubt to Community</p>
        </div>
        <div className="craft-panel p-3 shadow-xs">
          <p className="text-sm font-bold text-indigo-600">+10 pts</p>
          <p className="text-[10px] font-medium text-slate-500 mt-0.5">Peer Solution Provided</p>
        </div>
        <div className="craft-panel p-3 shadow-xs">
          <p className="text-sm font-bold text-emerald-600">+25 pts</p>
          <p className="text-[10px] font-medium text-slate-500 mt-0.5">Staff Verified Solution</p>
        </div>
        <div className="craft-panel p-3 shadow-xs">
          <p className="text-sm font-bold text-amber-600">+20 pts</p>
          <p className="text-[10px] font-medium text-slate-500 mt-0.5">Project Collaboration</p>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="craft-panel overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50/80 px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-600">
          <div className="col-span-2">Rank</div>
          <div className="col-span-5">Scholar</div>
          <div className="col-span-3">Institution</div>
          <div className="col-span-2 text-right">Points</div>
        </div>

        <div className="divide-y divide-slate-100">
          {board.map((item) => {
            const isTop3 = item.rank <= 3;

            return (
              <div
                key={item.rank}
                className={`grid grid-cols-12 items-center px-6 py-3.5 text-xs transition-colors ${
                  item.is_current
                    ? "bg-indigo-50/50 font-semibold"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="col-span-2 flex items-center gap-2">
                  {item.rank === 1 ? (
                    <Trophy className="h-4 w-4 text-amber-500" />
                  ) : item.rank === 2 ? (
                    <Award className="h-4 w-4 text-slate-400" />
                  ) : item.rank === 3 ? (
                    <Award className="h-4 w-4 text-amber-700" />
                  ) : (
                    <span className="font-mono text-slate-400 font-semibold pl-1">#{item.rank}</span>
                  )}
                </div>

                <div className="col-span-5 flex items-center gap-2">
                  <span className={item.is_current ? "font-bold text-indigo-700" : "font-medium text-slate-900"}>
                    {item.display_name}
                  </span>
                  {item.is_current && (
                    <span className="craft-badge craft-badge-blue text-[9px] py-0.2">
                      You
                    </span>
                  )}
                </div>

                <div className="col-span-3 text-slate-500 text-[11px] font-medium truncate">{item.college}</div>

                <div className="col-span-2 text-right">
                  <span className="font-bold text-slate-900">{item.points}</span>
                  <span className="text-[10px] text-slate-400 font-medium ml-1">pts</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
