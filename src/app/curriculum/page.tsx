"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { CurriculumPost, User } from "@/lib/types";
import { Plus, GraduationCap } from "lucide-react";

export default function CurriculumPage() {
  const [posts, setPosts] = useState<CurriculumPost[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(apiClient.getCurrentUser());
  const [isPosting, setIsPosting] = useState(false);

  // Faculty post form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [concept, setConcept] = useState("");

  useEffect(() => {
    setCurrentUser(apiClient.getCurrentUser());
    loadCurriculum();
  }, []);

  const loadCurriculum = async () => {
    const list = await apiClient.getCurriculum();
    setPosts(list);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !concept.trim()) return;

    await apiClient.createCurriculumPost({ title, body, concept });
    setTitle("");
    setBody("");
    setConcept("");
    setIsPosting(false);
    loadCurriculum();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 mb-16 md:mb-0">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Curriculum & Course Notes</h1>
            <span className="craft-badge craft-badge-blue">
              Official Syllabus
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Faculty-posted syllabus updates, lecture note clarifications, and semiconductor lab guidelines.
          </p>
        </div>

        {currentUser.role === "faculty" && (
          <button
            onClick={() => setIsPosting(!isPosting)}
            className="evil-btn evil-btn-emerald px-4 py-2 text-xs font-semibold gap-1.5 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Post Notice</span>
          </button>
        )}
      </div>

      {/* Faculty Post Form */}
      {isPosting && (
        <form
          onSubmit={handleCreatePost}
          className="mb-8 craft-panel p-6 shadow-md space-y-4 cube-enter"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Publish Academic Update</h3>
            <span className="text-[10px] text-emerald-700 font-bold">Instructor Verified</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Update Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Integration of Transformer LoRA into Linear Algebra syllabus"
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-all shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Subject / Target Concept</label>
            <input
              type="text"
              required
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="e.g. Eigenvalues & Diagonalization"
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-all shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Notice Content & Problem Context</label>
            <textarea
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Explain the curricular modification, reading materials, and what students should revise..."
              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-all shadow-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsPosting(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button type="submit" className="evil-btn evil-btn-primary px-5 py-2 text-xs font-semibold">
              Publish Notice
            </button>
          </div>
        </form>
      )}

      {/* Curriculum Posts List */}
      <div className="space-y-5">
        {posts.map((post) => (
          <div
            key={post.id}
            className="craft-panel p-6 shadow-sm transition-all hover:shadow-md hover:border-slate-300"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <span className="craft-badge craft-badge-blue text-[10px]">
                {post.concept}
              </span>

              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
                  {post.faculty_name || "Faculty Member"} ({post.faculty_college || "Engineering Dept"})
                </span>
                <span>•</span>
                <span>{post.created_at}</span>
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-900 tracking-tight mb-2">{post.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{post.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
