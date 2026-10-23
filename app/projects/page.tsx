"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { Project, User } from "@/lib/types";
import {
  Plus,
  Users,
  Send,
  ExternalLink,
  GraduationCap,
  CheckCircle,
} from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(apiClient.getCurrentUser());
  const [isPosting, setIsPosting] = useState(false);
  const [requestModalProject, setRequestModalProject] = useState<Project | null>(null);
  const [requestMsg, setRequestMsg] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);

  // New project form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [rolesStr, setRolesStr] = useState("");
  const [link, setLink] = useState("");

  useEffect(() => {
    setCurrentUser(apiClient.getCurrentUser());
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const list = await apiClient.getProjects();
    setProjects(list);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    await apiClient.createProject({
      title,
      description,
      tags: tagsStr.split(",").map((t) => t.trim()).filter(Boolean),
      roles_needed: rolesStr.split(",").map((r) => r.trim()).filter(Boolean),
      link: link.trim() || undefined,
    });

    setTitle("");
    setDescription("");
    setTagsStr("");
    setRolesStr("");
    setLink("");
    setIsPosting(false);
    loadProjects();
  };

  const handleSendRequest = async () => {
    if (!requestModalProject || !requestMsg.trim()) return;
    await apiClient.requestToJoinProject(requestModalProject.id, requestMsg);
    setRequestSuccess(true);
    setTimeout(() => {
      setRequestSuccess(false);
      setRequestModalProject(null);
      setRequestMsg("");
    }, 1800);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 mb-16 md:mb-0">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Project Collaboration Hub</h1>
            <span className="craft-badge craft-badge-emerald">
              Cross-Campus
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Build with engineering peers from institutions across India. Post initiatives, recruit team members, and earn verified points.
          </p>
        </div>

        <button
          onClick={() => setIsPosting(!isPosting)}
          className="evil-btn evil-btn-primary px-4 py-2 text-xs font-semibold gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Post a Project (+15 pts)</span>
        </button>
      </div>

      {/* Post Project Form */}
      {isPosting && (
        <form
          onSubmit={handleCreateProject}
          className="mb-8 craft-panel p-6 shadow-md space-y-4 cube-enter"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Create Collaboration Project</h3>
            <span className="text-[11px] text-indigo-600 font-bold">+15 Points on Submit</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Project Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed LLM Inference for Low-Power Microcontrollers"
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-all shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Project Description & Goal</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe your research, prototype goal, and what technologies you are using..."
              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-all shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tags (comma-separated)</label>
              <input
                type="text"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                placeholder="Robotics, WebGPU, Embedded, AI"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-all shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Roles Needed (comma-separated)</label>
              <input
                type="text"
                value={rolesStr}
                onChange={(e) => setRolesStr(e.target.value)}
                placeholder="Frontend Dev, ML Quantizer, Hardware Lead"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-all shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Repository / Spec Link (optional)</label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-all shadow-xs"
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
              Publish Project
            </button>
          </div>
        </form>
      )}

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="flex flex-col justify-between craft-panel p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2.5">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
                  {proj.owner_college}
                </span>
                <span>{proj.created_at}</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 tracking-tight mb-2">{proj.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">{proj.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {proj.tags.map((t) => (
                  <span
                    key={t}
                    className="craft-badge text-[10px] py-0.5"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Roles Needed */}
              <div className="mb-4 rounded-xl bg-amber-50/50 border border-amber-200/70 p-3 text-xs">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                  Open Positions:
                </span>
                <div className="flex flex-wrap gap-1">
                  {proj.roles_needed.map((r) => (
                    <span
                      key={r}
                      className="craft-badge craft-badge-amber text-[10px]"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Users className="h-3.5 w-3.5" />
                <span>{proj.contributions_count || 1} collaborators</span>
              </div>

              <div className="flex items-center gap-2">
                {proj.link && (
                  <a
                    href={proj.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    title="View Repository"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}

                <button
                  onClick={() => setRequestModalProject(proj)}
                  className="evil-btn evil-btn-secondary px-3 py-1.5 text-xs font-semibold"
                >
                  Join Team
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Join Request Modal */}
      {requestModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md craft-panel-elevated p-6 shadow-2xl space-y-4 cube-enter">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Request to Join {requestModalProject.title}
              </h3>
              <span className="craft-badge craft-badge-blue text-[10px]">+20 pts</span>
            </div>

            <p className="text-xs text-slate-600">
              Send a note to the project owner explaining your skills and how you can contribute.
            </p>

            <textarea
              value={requestMsg}
              onChange={(e) => setRequestMsg(e.target.value)}
              rows={4}
              placeholder="e.g. Hi! I'm a 3rd year student with experience in PyTorch quantization and embedded C. I'd love to help with the benchmark pipeline..."
              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-all shadow-xs"
            />

            {requestSuccess && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Request delivered to owner! (+20 pts awarded on acceptance)</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRequestModalProject(null)}
                className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={handleSendRequest}
                disabled={!requestMsg.trim() || requestSuccess}
                className="evil-btn evil-btn-primary px-4 py-1.5 text-xs font-semibold gap-1.5"
              >
                <Send className="h-3 w-3" />
                <span>Submit Request</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
