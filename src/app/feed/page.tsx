"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { Question, Answer, User } from "@/lib/types";
import {
  ThumbsUp,
  MessageSquare,
  CheckCircle2,
  Send,
  RotateCcw,
  GraduationCap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import MathStepRenderer from "@/components/MathStepRenderer";
import TutoLoader from "@/components/TutoLoader";

export default function FeedPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answersMap, setAnswersMap] = useState<Record<string, Answer[]>>({});
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedQId, setExpandedQId] = useState<string | null>(null);
  const [newAnswerText, setNewAnswerText] = useState<Record<string, string>>({});
  const [undoReportToast, setUndoReportToast] = useState<string | null>(null);
  const currentUser: User = apiClient.getCurrentUser();

  useEffect(() => {
    loadFeed();
  }, [selectedSubject, selectedCollege]);

  const loadFeed = async () => {
    setLoading(true);
    const data = await apiClient.getFeed(selectedSubject, selectedCollege);
    setQuestions(data);

    for (const q of data) {
      apiClient.getAnswers(q.id).then((ans) => {
        setAnswersMap((prev) => ({ ...prev, [q.id]: ans }));
      });
    }
    setLoading(false);
  };

  const handleUpvote = async (qId: string) => {
    const res = await apiClient.upvote("question", qId);
    if (res.success) {
      setQuestions((prev) =>
        prev.map((q) => (q.id === qId ? { ...q, upvotes_count: res.count, has_upvoted: true } : q))
      );
    }
  };

  const handleStaffVerify = async (ansId: string, qId: string) => {
    if (currentUser.role !== "faculty") return;
    const res = await apiClient.toggleStaffVerify(ansId);
    setAnswersMap((prev) => ({
      ...prev,
      [qId]: (prev[qId] || []).map((a) =>
        a.id === ansId ? { ...a, is_staff_verified: res.is_staff_verified } : a
      ),
    }));
  };

  const handleSubmitAnswer = async (qId: string) => {
    const text = newAnswerText[qId];
    if (!text || !text.trim()) return;
    const ans = await apiClient.submitAnswer(qId, text);
    setAnswersMap((prev) => ({
      ...prev,
      [qId]: [...(prev[qId] || []), ans],
    }));
    setNewAnswerText((prev) => ({ ...prev, [qId]: "" }));
  };

  const handleReport = () => {
    setUndoReportToast(`Flagged for academic review. Tap Undo to cancel.`);
    setTimeout(() => {
      setUndoReportToast(null);
    }, 5000);
  };

  const subjects = ["Engineering Mathematics", "Calculus", "Data Structures & Algorithms", "Analog Electronics"];
  const colleges = ["IIT Bombay", "NIT Trichy", "BITS Pilani", "IIT Madras", "Anna University"];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 mb-16 md:mb-0">
      {/* Undo Toast */}
      {undoReportToast && (
        <div className="fixed bottom-16 md:bottom-6 right-6 z-50 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs text-slate-900 shadow-xl flex items-center gap-3 cube-enter">
          <span>{undoReportToast}</span>
          <button
            onClick={() => setUndoReportToast(null)}
            className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-100"
          >
            Undo
          </button>
        </div>
      )}

      {/* Feed Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Community Questions</h1>
            <span className="craft-badge craft-badge-blue">
              Verified Discussions
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Explore anonymous doubts shared by students. Contribute verified peer answers to earn academic points.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none transition-all shadow-xs"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none transition-all shadow-xs"
          >
            <option value="">All Institutions</option>
            {colleges.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {(selectedSubject || selectedCollege) && (
            <button
              onClick={() => {
                setSelectedSubject("");
                setSelectedCollege("");
              }}
              className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 px-2 py-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-5">
        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-4 bg-white border border-stone-200 rounded-none">
              <TutoLoader variant="voice" size="sm" color="red" label="Loading peer discussion feed…" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-stone-200 bg-white p-6 animate-pulse space-y-3 rounded-none">
                <div className="flex justify-between">
                  <div className="h-4 w-28 bg-slate-100 rounded" />
                  <div className="h-4 w-20 bg-slate-100 rounded" />
                </div>
                <div className="h-5 w-3/4 bg-slate-100 rounded" />
                <div className="h-10 w-full bg-slate-50 rounded-xl" />
              </div>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="craft-panel p-12 text-center shadow-xs">
            <p className="text-sm font-semibold text-slate-800">No questions match this filter</p>
            <p className="text-xs text-slate-500 mt-1">
              {selectedSubject ? `No results for '${selectedSubject}'.` : "No public questions have been posted yet."}
            </p>
            <button
              onClick={() => {
                setSelectedSubject("");
                setSelectedCollege("");
              }}
              className="evil-btn evil-btn-secondary px-4 py-2 text-xs font-semibold mt-4"
            >
              Clear filters
            </button>
          </div>
        ) : (
          questions.map((question) => {
            const isExpanded = expandedQId === question.id;
            const answers = answersMap[question.id] || [];

            return (
              <div
                key={question.id}
                className="craft-panel p-6 transition-all hover:shadow-md hover:border-slate-300"
              >
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="craft-badge craft-badge-blue text-[10px]">
                      {question.concept}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">{question.subject}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
                      Anonymous • {question.college}
                    </span>
                    <span>•</span>
                    <span>{question.created_at}</span>
                  </div>
                </div>

                {/* Question Text */}
                <h3 className="text-base font-bold text-slate-900 tracking-tight mb-2.5">{question.text}</h3>

                {/* Spoken Answer Snippet */}
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 text-xs text-slate-700 italic mb-4">
                  &ldquo;{question.spoken_answer}&rdquo;
                </div>

                {/* Derivation Steps */}
                {isExpanded && question.steps && question.steps.length > 0 && (
                  <div className="my-4 border-t border-slate-100 pt-4 cube-enter">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-3">
                      Mathematical Derivation Steps:
                    </p>
                    <MathStepRenderer steps={question.steps} />
                  </div>
                )}

                {/* Bottom Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3.5 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleUpvote(question.id)}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all border ${
                        question.has_upvoted
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                          : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{question.upvotes_count || 0}</span>
                    </button>

                    <button
                      onClick={() => setExpandedQId(isExpanded ? null : question.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>{answers.length} Answers</span>
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReport()}
                      className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors font-medium"
                    >
                      Report
                    </button>
                  </div>
                </div>

                {/* Answers Section */}
                {isExpanded && (
                  <div className="mt-5 space-y-3.5 border-t border-slate-100 pt-4 cube-enter">
                    <h4 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                      Answers ({answers.length})
                    </h4>

                    {answers.map((answer) => (
                      <div
                        key={answer.id}
                        className={`rounded-xl border p-4 text-xs transition-all ${
                          answer.is_staff_verified
                            ? "border-emerald-200 bg-emerald-50/50"
                            : "border-slate-200 bg-slate-50/60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">
                              {answer.author_name || "Peer Contributor"}
                            </span>
                            <span className="text-[10px] text-slate-500">{answer.author_college}</span>
                            {answer.author_role === "faculty" && (
                              <span className="craft-badge craft-badge-amber text-[9px] py-0.5">
                                Faculty
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {answer.is_staff_verified && (
                              <span className="craft-badge craft-badge-emerald text-[9px]">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                Staff Verified (+25)
                              </span>
                            )}

                            {currentUser.role === "faculty" && (
                              <button
                                onClick={() => handleStaffVerify(answer.id, question.id)}
                                className="text-[10px] font-semibold text-slate-600 hover:text-emerald-700 underline transition-colors"
                              >
                                {answer.is_staff_verified ? "Revoke Verification" : "Verify Answer"}
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-slate-700 leading-relaxed">{answer.text}</p>
                      </div>
                    ))}

                    {/* Add Answer Box */}
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        value={newAnswerText[question.id] || ""}
                        onChange={(e) =>
                          setNewAnswerText({ ...newAnswerText, [question.id]: e.target.value })
                        }
                        placeholder={
                          currentUser.role === "faculty"
                            ? "Add instructor solution (attaches Staff Verified badge)..."
                            : "Write helpful explanation (earn +10 points)..."
                        }
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-all shadow-xs"
                      />
                      <button
                        onClick={() => handleSubmitAnswer(question.id)}
                        disabled={!newAnswerText[question.id]?.trim()}
                        className="evil-btn evil-btn-primary px-4 py-2 text-xs font-semibold gap-1.5"
                      >
                        <Send className="h-3 w-3" />
                        <span>Post</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
