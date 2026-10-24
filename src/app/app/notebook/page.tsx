"use client";

import { useState, useEffect, useRef } from "react";
import PageHeader from "@/components/ui/PageHeader";
import RequireRole from "@/components/App/RequireRole";
import { MathBlock } from "@/components/ui/VisualFlowchart";
import { Plus, Check } from "@/components/Icons";

interface NotePage {
  id: string;
  title: string;
  subject: string;
  updatedAt: string;
  content: string;
}

const DEFAULT_PAGES: NotePage[] = [
  {
    id: "page-1",
    title: "Graph Traversal: DFS & Stack Invariants",
    subject: "Computer Science",
    updatedAt: "Just now",
    content: `# Depth-First Search (DFS) & Call Stacks

Depth-First Search dives along each branch of a graph until reaching a dead end, then backtracks.

## 1. Visited Tracking Set
Without visited tracking, cyclic graphs lead to infinite call stack recursion:

\`\`\`python
visited = set()

def dfs(graph, node):
    if node in visited:
        return
    visited.add(node)
    for neighbor in graph[node]:
        dfs(graph, neighbor)
\`\`\`

## 2. Invariant & Complexity
- Time Complexity: $\\mathcal{O}(V + E)$
- Space Complexity: $\\mathcal{O}(V)$ for the recursive call stack depth.
- Invariant: Every vertex is pushed and popped from the stack at most once.

> **Analogy**: Exploring a labyrinth with a ball of string, marking visited corridors with chalk so you never walk in circles.
`,
  },
  {
    id: "page-2",
    title: "Linear Algebra: Eigenvalue Geometry",
    subject: "Mathematics",
    updatedAt: "Yesterday",
    content: `# Eigenvalues and Invariance

When matrix $A$ transforms vector $v$, eigenvectors maintain their spatial direction and merely stretch by factor $\\lambda$:

$$A v = \\lambda v \\iff (A - \\lambda I) v = 0$$

For non-trivial vector solutions $v \\neq 0$:
$$\\det(A - \\lambda I) = 0$$

Solve roots of the characteristic polynomial $p(\\lambda)$ to find all eigenvalues.
`,
  },
];

export default function SmartNotebookPage() {
  const [pages, setPages] = useState<NotePage[]>(DEFAULT_PAGES);
  const [activeId, setActiveId] = useState<string>("page-1");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [savedStatus, setSavedStatus] = useState<string>("Saved");
  const [isUploadingPdf, setIsUploadingPdf] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("tuto_notebook_pages_v1");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPages(parsed);
          setActiveId(parsed[0].id);
        }
      }
    } catch {
      // fallback to default
    }
  }, []);

  // Sync to localStorage
  const savePages = (newPages: NotePage[]) => {
    setPages(newPages);
    setSavedStatus("Saving…");
    try {
      localStorage.setItem("tuto_notebook_pages_v1", JSON.stringify(newPages));
      setTimeout(() => setSavedStatus("Saved"), 400);
    } catch {
      setSavedStatus("Saved locally");
    }
  };

  const activePage = pages.find((p) => p.id === activeId) || pages[0];

  const updateActiveContent = (text: string) => {
    const updated = pages.map((p) =>
      p.id === activeId ? { ...p, content: text, updatedAt: "Just now" } : p
    );
    savePages(updated);
  };

  const updateActiveTitle = (title: string) => {
    const updated = pages.map((p) =>
      p.id === activeId ? { ...p, title, updatedAt: "Just now" } : p
    );
    savePages(updated);
  };

  const addNewPage = () => {
    const newPage: NotePage = {
      id: `page-${Date.now()}`,
      title: "Untitled Academic Notes",
      subject: "General Studies",
      updatedAt: "Just now",
      content: `# New Lecture Notes\n\nDate: ${new Date().toLocaleDateString()}\n\nWrite your thoughts, derivations, or paste AI Tutor solutions here...\n`,
    };
    const updated = [newPage, ...pages];
    savePages(updated);
    setActiveId(newPage.id);
  };

  const deleteCurrentPage = () => {
    if (pages.length <= 1) return;
    const remaining = pages.filter((p) => p.id !== activeId);
    savePages(remaining);
    setActiveId(remaining[0].id);
  };

  // PDF Upload & Extraction handler
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPdf(true);
    setUploadStatus(`Analyzing ${file.name}…`);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/pdf/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to parse PDF document.");
      const json = await res.json();
      const data = json.data || json;

      // Format extracted insights as a structured note
      const pdfNotes = `

---
## 📄 Notes Extracted from: ${file.name}
**Subject**: ${data.subject || "Academic Paper"} | **Pages**: ${data.totalPages}

### Executive Socratic Summary
${data.summary}

### Key Concept Invariant: ${data.concept}
> **Root Cause Prerequisite Gap**: ${data.root_cause || "None"}

${data.steps && data.steps.length > 0 ? `### Step-by-Step Proof Outline\n` + data.steps.map((s: any, idx: number) => `**Step ${idx + 1}: ${s.title}**\n${s.explanation}\n${s.equation_or_code ? `\n${s.equation_or_code}\n` : ""}`).join("\n\n") : ""}

### Intuitive Analogy
> ${data.analogy || "Structural stability relies on anchored fundamentals."}

### High-Yield Flashcards
${data.studyCards?.map((c: any) => `- **Q: ${c.prompt}**\n  *A: ${c.solution}*`).join("\n") || ""}
`;

      const newContent = activePage.content + pdfNotes;
      updateActiveContent(newContent);
      setUploadStatus("PDF integrated into note!");
      setTimeout(() => setUploadStatus(""), 3500);
    } catch (err: any) {
      console.error("PDF upload error:", err);
      setUploadStatus("Error extracting PDF text.");
      setTimeout(() => setUploadStatus(""), 4000);
    } finally {
      setIsUploadingPdf(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const insertSnippet = (snippet: string) => {
    updateActiveContent(activePage.content + "\n" + snippet);
  };

  return (
    <RequireRole role="student">
      <PageHeader
        eyebrow="Student Workspace"
        title="Smart *Notebook.*"
        lead="A live academic notebook with ruled paper, formula rendering, and PDF chapter extraction."
      />

      <div className="app-body" style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Notebook Container */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            gap: "24px",
            background: "var(--surface, #fcfcfb)",
            border: "1px solid var(--rule, #cfccc7)",
            borderRadius: "4px",
            minHeight: "750px",
            boxShadow: "0 8px 30px rgba(20, 16, 15, 0.05)",
            overflow: "hidden",
          }}
        >
          {/* Left Binder: Page Directory */}
          <aside
            style={{
              background: "#edece8",
              borderRight: "1px solid var(--rule, #cfccc7)",
              padding: "20px 16px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                paddingBottom: "12px",
                borderBottom: "1px solid #dcd9d4",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--muted, #665d5a)",
                  margin: 0,
                }}
              >
                Binder Pages ({pages.length})
              </h2>
              <button
                type="button"
                onClick={addNewPage}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "var(--ink, #14100f)",
                  color: "#fff",
                  border: "none",
                  padding: "4px 8px",
                  fontSize: "11px",
                  fontFamily: "var(--font-mono, monospace)",
                  cursor: "pointer",
                  borderRadius: "2px",
                }}
              >
                <Plus size={14} /> New
              </button>
            </div>

            {/* Pages List */}
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
              {pages.map((p) => {
                const isActive = p.id === activeId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActiveId(p.id)}
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      background: isActive ? "#ffffff" : "transparent",
                      border: isActive ? "1px solid #cfccc7" : "1px solid transparent",
                      borderLeft: isActive ? "3px solid var(--red, #c8102e)" : "3px solid transparent",
                      borderRadius: "2px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-body, sans-serif)",
                        fontSize: "13px",
                        fontWeight: isActive ? 600 : 400,
                        color: "var(--ink, #14100f)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {p.title || "Untitled Note"}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "10px",
                        fontFamily: "var(--font-mono, monospace)",
                        color: "var(--muted, #665d5a)",
                        marginTop: "4px",
                      }}
                    >
                      <span>{p.subject || "Notes"}</span>
                      <span>{p.updatedAt}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* PDF Uploader Trigger */}
            <div
              style={{
                marginTop: "16px",
                paddingTop: "14px",
                borderTop: "1px solid #dcd9d4",
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,application/pdf"
                style={{ display: "none" }}
                onChange={handlePdfUpload}
              />
              <button
                type="button"
                disabled={isUploadingPdf}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  background: "transparent",
                  border: "1px dashed var(--red, #c8102e)",
                  color: "var(--red, #c8102e)",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "12px",
                  cursor: isUploadingPdf ? "wait" : "pointer",
                  borderRadius: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <span>📄</span>
                <span>{isUploadingPdf ? "Reading PDF…" : "Import PDF to Note"}</span>
              </button>
              {uploadStatus && (
                <p
                  style={{
                    fontSize: "11px",
                    fontFamily: "var(--font-mono, monospace)",
                    color: "var(--red, #c8102e)",
                    marginTop: "6px",
                    textAlign: "center",
                  }}
                >
                  {uploadStatus}
                </p>
              )}
            </div>
          </aside>

          {/* Right Ruled Notebook Pad */}
          <main
            style={{
              padding: "24px 36px 36px 40px",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            {/* Header: Title & Controls */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                paddingBottom: "16px",
                borderBottom: "1px solid var(--rule, #cfccc7)",
                marginBottom: "20px",
              }}
            >
              <div style={{ flex: 1, marginRight: "16px" }}>
                <input
                  type="text"
                  value={activePage.title}
                  onChange={(e) => updateActiveTitle(e.target.value)}
                  placeholder="Note Title…"
                  style={{
                    fontFamily: "var(--font-display, serif)",
                    fontSize: "26px",
                    fontWeight: 600,
                    color: "var(--ink, #14100f)",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    width: "100%",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginTop: "4px",
                    fontSize: "11px",
                    fontFamily: "var(--font-mono, monospace)",
                    color: "var(--muted, #665d5a)",
                  }}
                >
                  <span>{activePage.subject}</span>
                  <span>•</span>
                  <span>{savedStatus}</span>
                  <span>•</span>
                  <span>{activePage.content.split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div
                  style={{
                    display: "inline-flex",
                    border: "1px solid var(--rule, #cfccc7)",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveTab("write")}
                    style={{
                      padding: "6px 12px",
                      background: activeTab === "write" ? "var(--ink, #14100f)" : "transparent",
                      color: activeTab === "write" ? "#ffffff" : "var(--ink, #14100f)",
                      border: "none",
                      fontSize: "12px",
                      fontFamily: "var(--font-mono, monospace)",
                      cursor: "pointer",
                    }}
                  >
                    Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    style={{
                      padding: "6px 12px",
                      background: activeTab === "preview" ? "var(--ink, #14100f)" : "transparent",
                      color: activeTab === "preview" ? "#ffffff" : "var(--ink, #14100f)",
                      border: "none",
                      fontSize: "12px",
                      fontFamily: "var(--font-mono, monospace)",
                      cursor: "pointer",
                    }}
                  >
                    Math Preview
                  </button>
                </div>

                {pages.length > 1 && (
                  <button
                    type="button"
                    onClick={deleteCurrentPage}
                    title="Delete page"
                    style={{
                      padding: "6px 10px",
                      background: "transparent",
                      border: "1px solid #e5e5e5",
                      color: "var(--muted, #665d5a)",
                      fontSize: "12px",
                      fontFamily: "var(--font-mono, monospace)",
                      cursor: "pointer",
                      borderRadius: "2px",
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            {/* Quick Math & Snippet Bar */}
            {activeTab === "write" && (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "14px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={() => insertSnippet("\n$$A v = \\lambda v$$\n")}
                  style={{
                    padding: "4px 8px",
                    background: "rgba(20, 16, 15, 0.04)",
                    border: "1px solid var(--rule, #cfccc7)",
                    borderRadius: "2px",
                    fontSize: "11px",
                    fontFamily: "var(--font-mono, monospace)",
                    cursor: "pointer",
                  }}
                >
                  + Equation $$...$$
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet("\n```python\n# Implementation logic\n```\n")}
                  style={{
                    padding: "4px 8px",
                    background: "rgba(20, 16, 15, 0.04)",
                    border: "1px solid var(--rule, #cfccc7)",
                    borderRadius: "2px",
                    fontSize: "11px",
                    fontFamily: "var(--font-mono, monospace)",
                    cursor: "pointer",
                  }}
                >
                  + Code Block
                </button>
                <button
                  type="button"
                  onClick={() => insertSnippet("\n> **Theorem**: If $P$ then $Q$.\n")}
                  style={{
                    padding: "4px 8px",
                    background: "rgba(20, 16, 15, 0.04)",
                    border: "1px solid var(--rule, #cfccc7)",
                    borderRadius: "2px",
                    fontSize: "11px",
                    fontFamily: "var(--font-mono, monospace)",
                    cursor: "pointer",
                  }}
                >
                  + Theorem Block
                </button>
              </div>
            )}

            {/* Ruled Notebook Paper Body */}
            <div
              style={{
                flex: 1,
                position: "relative",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Classic Academic Left Margin Line (Red ruling line) */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "32px",
                  top: 0,
                  bottom: 0,
                  width: "1.5px",
                  background: "rgba(200, 16, 46, 0.28)",
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              />

              {activeTab === "write" ? (
                <textarea
                  value={activePage.content}
                  onChange={(e) => updateActiveContent(e.target.value)}
                  placeholder="Start writing notes, proofs, and definitions..."
                  style={{
                    flex: 1,
                    minHeight: "550px",
                    width: "100%",
                    padding: "8px 16px 16px 50px",
                    background: "repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(20, 16, 15, 0.07) 28px)",
                    border: "none",
                    outline: "none",
                    fontFamily: "var(--font-body, sans-serif)",
                    fontSize: "15px",
                    lineHeight: "28px",
                    color: "var(--ink, #14100f)",
                    resize: "none",
                    position: "relative",
                    zIndex: 1,
                  }}
                />
              ) : (
                <div
                  style={{
                    flex: 1,
                    minHeight: "550px",
                    padding: "8px 16px 16px 50px",
                    background: "repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(20, 16, 15, 0.05) 28px)",
                    lineHeight: "28px",
                    fontSize: "15px",
                  }}
                >
                  {activePage.content.split("\n\n").map((block, idx) => {
                    const trimmed = block.trim();
                    if (trimmed.startsWith("$$") && trimmed.endsWith("$$")) {
                      return <MathBlock key={idx} formula={trimmed} />;
                    }
                    if (trimmed.startsWith("# ")) {
                      return (
                        <h1 key={idx} style={{ fontFamily: "var(--font-display, serif)", fontSize: "24px", margin: "16px 0 8px" }}>
                          {trimmed.slice(2)}
                        </h1>
                      );
                    }
                    if (trimmed.startsWith("## ")) {
                      return (
                        <h2 key={idx} style={{ fontFamily: "var(--font-display, serif)", fontSize: "19px", margin: "14px 0 6px" }}>
                          {trimmed.slice(3)}
                        </h2>
                      );
                    }
                    if (trimmed.startsWith("### ")) {
                      return (
                        <h3 key={idx} style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "14px", textTransform: "uppercase", margin: "12px 0 4px" }}>
                          {trimmed.slice(4)}
                        </h3>
                      );
                    }
                    if (trimmed.startsWith("```")) {
                      return (
                        <pre
                          key={idx}
                          style={{
                            background: "var(--ink, #14100f)",
                            color: "#f4f4f2",
                            padding: "12px",
                            borderRadius: "3px",
                            fontFamily: "var(--font-mono, monospace)",
                            fontSize: "12px",
                            overflowX: "auto",
                            margin: "12px 0",
                          }}
                        >
                          {trimmed.replace(/^```[a-z]*\n|```$/g, "")}
                        </pre>
                      );
                    }
                    if (trimmed.startsWith("> ")) {
                      return (
                        <blockquote
                          key={idx}
                          style={{
                            borderLeft: "3px solid var(--red, #c8102e)",
                            paddingLeft: "12px",
                            margin: "12px 0",
                            color: "var(--ink-2, #3a3330)",
                            fontStyle: "italic",
                          }}
                        >
                          {trimmed.slice(2)}
                        </blockquote>
                      );
                    }
                    return (
                      <p key={idx} style={{ margin: "0 0 12px 0" }}>
                        {trimmed}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </RequireRole>
  );
}
