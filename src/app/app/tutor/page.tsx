"use client";

import { useEffect, useRef, useState } from "react";
import useAsync from "@/hooks/useAsync";
import { tutor } from "@/services";
import PageHeader from "@/components/ui/PageHeader";
import Tabs, { TabPanel } from "@/components/ui/Tabs";
import { Loading, ErrorState, Empty } from "@/components/ui/States";
import { Mic, ArrowRight } from "@/components/Icons";
import { timeAgo } from "@/utils/format";
import RequireRole from "@/components/App/RequireRole";
import VisualFlowchart, { MathBlock } from "@/components/ui/VisualFlowchart";

function AnswerView({
  answer,
  shown,
  setShown,
}: {
  answer: {
    id: string;
    question: string;
    isDemo: boolean;
    concept?: string;
    root_cause?: string;
    subject?: string;
    flowchart?: any;
    steps: Array<{ title: string; body: string; latex?: string }>;
  };
  shown: number;
  setShown: (n: number | ((prev: number) => number)) => void;
}) {
  const [more, setMore] = useState<Record<number, { loading?: boolean; text?: string; error?: string }>>({});
  const [speaking, setSpeaking] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const [pinned, setPinned] = useState(false);

  const pinToNotebook = () => {
    try {
      const stored = localStorage.getItem("tuto_notebook_pages_v1");
      const currentPages = stored ? JSON.parse(stored) : [];
      const newPage = {
        id: `page-${Date.now()}`,
        title: `${answer.concept || 'Tutor Solution'}: ${answer.question.slice(0, 35)}`,
        subject: answer.subject || "Academic Studies",
        updatedAt: "Just now",
        content: `# ${answer.concept || 'AI Socratic Solution'}\n\n**Question**: ${answer.question}\n\n**Prerequisite Knowledge Gap**: ${answer.root_cause || 'None'}\n\n## Step-by-Step Proof Pipeline\n` +
          answer.steps.map((s: any, idx: number) => `### Step ${idx + 1}: ${s.title}\n${s.body}`).join('\n\n') +
          ((answer as any).analogy ? `\n\n> **Analogy**: ${(answer as any).analogy}\n` : '') +
          `\n*Captured from AI Tutor on ${new Date().toLocaleDateString()}*\n`,
      };
      localStorage.setItem("tuto_notebook_pages_v1", JSON.stringify([newPage, ...currentPages]));
      setPinned(true);
      setTimeout(() => setPinned(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setCanSpeak(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const clarify = async (i: number) => {
    setMore((m) => ({ ...m, [i]: { loading: true } }));
    try {
      const r = await tutor.clarify({
        answerId: answer.id,
        stepIndex: i,
        stepTitle: answer.steps[i].title,
      });
      setMore((m) => ({ ...m, [i]: { text: r.text } }));
    } catch (err: any) {
      setMore((m) => ({ ...m, [i]: { error: err.message } }));
    }
  };

  const toggleSpeak = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const text = answer.steps
      .slice(0, shown)
      .map((s, i) => `Step ${i + 1}. ${s.title}. ${s.body}`)
      .join(" ");
    const u = new SpeechSynthesisUtterance(text);
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  };

  return (
    <section className="grid" aria-label="Answer">
      {answer.isDemo ? (
        <p className="notice">
          Demo response. This was not written by an AI. It shows how a step by step answer will look once the AI backend is connected.
        </p>
      ) : (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            background: "rgba(200, 16, 46, 0.06)",
            border: "1px solid rgba(200, 16, 46, 0.25)",
            color: "var(--signal-red, #c8102e)",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "12px",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            borderRadius: "2px",
            marginBottom: "16px",
            width: "fit-content",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 8px rgba(16, 185, 129, 0.6)",
            }}
          />
          AI Socratic Solution Active • {(answer as any).model || "TUTO Academic Engine"}
        </div>
      )}

      {/* Visual Pipeline Flowchart & Concept Diagram */}
      <VisualFlowchart
        flowchart={
          answer.flowchart || {
            title: "Solution Logic Pipeline",
            nodes: [
              {
                id: "start",
                label: answer.question.length > 30 ? answer.question.slice(0, 28) + "..." : answer.question,
                type: "start",
                stepIndex: 0,
                tag: "Problem State",
                desc: "Define boundary conditions and unknowns.",
              },
              ...answer.steps.map((s, idx) => ({
                id: `step-${idx + 1}`,
                label: s.title,
                type: idx === answer.steps.length - 1 ? "end" : (idx === 1 ? "decision" : "process"),
                stepIndex: idx,
                tag: `Step ${idx + 1}`,
                desc: (s.body.split(".")[0] || s.title) + ".",
              })),
            ],
          }
        }
        currentStep={shown}
        onSelectStep={(n) => setShown(n)}
        concept={answer.concept || "Root-Cause Learning"}
        rootCause={answer.root_cause || "Foundational Prerequisite Gap"}
        subject={answer.subject || "Computer Science & Engineering"}
      />

      <ol className="steps">
        {answer.steps.slice(0, shown).map((s, i) => (
          <li className="step" key={i}>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
            {s.latex && <MathBlock formula={s.latex} />}
            <button
              type="button"
              className="btn-text"
              onClick={() => clarify(i)}
              disabled={more[i] && more[i].loading}
            >
              I am confused here
            </button>
            {more[i] && (
              <div className="step__more" role="status">
                {more[i].loading && "Finding a simpler explanation..."}
                {more[i].text}
                {more[i].error && <span className="field__error">{more[i].error}</span>}
              </div>
            )}
          </li>
        ))}
      </ol>
      <div className="row">
        {shown < answer.steps.length && (
          <>
            <button
              type="button"
              className="btn btn--sm"
              onClick={() => setShown(shown + 1)}
            >
              Show next step <ArrowRight size={16} />
            </button>
            <button
              type="button"
              className="btn-text"
              onClick={() => setShown(answer.steps.length)}
            >
              Show all steps
            </button>
          </>
        )}
        {canSpeak && (
          <button
            type="button"
            className="btn-text"
            aria-pressed={speaking}
            onClick={toggleSpeak}
          >
            {speaking ? "Stop reading" : "Read aloud"}
          </button>
        )}
        <button
          type="button"
          className="btn-text"
          onClick={pinToNotebook}
          style={{
            color: pinned ? "#10b981" : "var(--red, #c8102e)",
            fontWeight: 500,
          }}
        >
          {pinned ? "✓ Pinned to Smart Notebook" : "📓 Pin to Notebook"}
        </button>
      </div>
    </section>
  );
}

function VoicePanel({ onUse }: { onUse: (t: string) => void }) {
  const [listening, setListening] = useState(false);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const [supported, setSupported] = useState<boolean | null>(null);
  const recRef = useRef<any>(null);

  useEffect(() => {
    const hasSR = Boolean(
      typeof window !== "undefined" &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    );
    setSupported(hasSR);

    return () => {
      if (recRef.current) recRef.current.stop();
    };
  }, []);

  if (supported === false) {
    return (
      <div className="state">
        Voice input is not supported in this browser. Try a recent version of Chrome or Edge, or type your question on the Ask tab.
      </div>
    );
  }

  const start = () => {
    setErr("");
    setText("");
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e: any) =>
      setText(Array.from(e.results).map((r: any) => r[0].transcript).join(" "));
    rec.onerror = (e: any) => {
      setErr(
        e.error === "not-allowed"
          ? "Microphone access was blocked. Allow it in your browser settings to use voice."
          : "Voice input stopped unexpectedly. Try again."
      );
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  };

  const stop = () => {
    if (recRef.current) recRef.current.stop();
  };

  return (
    <div className="grid" style={{ maxWidth: "40rem" }}>
      <button
        type="button"
        className="mic"
        aria-pressed={listening}
        onClick={listening ? stop : start}
      >
        <Mic size={32} />
        <span className="sr-only">
          {listening ? "Stop listening" : "Start speaking"}
        </span>
      </button>
      <p className="meta">
        {listening ? "Listening. Speak your question." : "Press the microphone and speak your question."}
      </p>
      <p className="meta">
        Your browser may send your audio to its own speech service to turn it into text.
      </p>
      {err && <p className="notice notice--error" role="alert">{err}</p>}
      <div className="field">
        <label htmlFor="voice-text">What I heard</label>
        <textarea
          id="voice-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <button
        type="button"
        className="btn btn--primary"
        disabled={text.trim().length < 5}
        onClick={() => onUse(text)}
      >
        Ask this question <ArrowRight />
      </button>
    </div>
  );
}

function PdfUploadPanel({ onAnalyzed }: { onAnalyzed: (solution: any) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF document first.");
      return;
    }
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    if (prompt.trim()) {
      formData.append("question", prompt.trim());
    }

    try {
      const res = await fetch("/api/pdf/analyze", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to analyze PDF document.");
      }
      const json = await res.json();
      const data = json.data || json;
      onAnalyzed(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze PDF.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="voice-panel" style={{ maxWidth: "46rem" }}>
      <p className="meta" style={{ marginBottom: "16px" }}>
        Upload a lecture note, research paper, or assignment PDF. TUTO will deconstruct its foundational theorems, extract knowledge gaps, and construct an interactive Socratic execution flowchart.
      </p>

      {error && <p className="notice notice--error" role="alert">{error}</p>}

      <form onSubmit={handleUpload}>
        <div className="field">
          <label htmlFor="pdf-doc">PDF Document</label>
          <input
            id="pdf-doc"
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{
              padding: "16px",
              border: "1px dashed var(--rule, #cfccc7)",
              background: "var(--surface, #fcfcfb)",
              width: "100%",
            }}
          />
          {file && (
            <p className="meta" style={{ marginTop: "8px" }}>
              Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        <div className="field" style={{ marginTop: "16px" }}>
          <label htmlFor="pdf-focus">Optional Question or Focus (Leave blank for full chapter analysis)</label>
          <input
            id="pdf-focus"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Explain the convergence proof in section 2, or what are the edge cases?"
          />
        </div>

        <div style={{ marginTop: "20px" }}>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={!file || uploading}
          >
            {uploading ? "Deconstructing PDF…" : "Analyze PDF with Socratic Tutor"} <ArrowRight />
          </button>
        </div>
      </form>
    </div>
  );
}

function TutorContent() {
  const [tab, setTab] = useState("ask");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<any>(null);
  const [shown, setShown] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const history = useAsync(() => tutor.history(), []);

  const onPdfAnalyzed = (data: any) => {
    setQuestion(`Analysis of ${data.fileName}`);
    setAnswer({
      id: `pdf-${Date.now()}`,
      question: data.concept ? `${data.concept} (${data.fileName})` : data.fileName,
      isDemo: false,
      subject: data.subject,
      concept: data.concept,
      root_cause: data.root_cause,
      flowchart: data.flowchart,
      steps: (data.steps || []).map((s: any) => ({
        title: s.title,
        body: s.explanation,
        latex: s.equation_or_code,
      })),
      analogy: data.analogy,
    });
    setShown(1);
    setTab("ask");
  };

  const ask = async (q?: string) => {
    const text = (q !== undefined ? q : question).trim();
    if (text.length < 5) {
      setError("Write at least a few words so the question is clear.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const a = await tutor.ask({ question: text });
      setQuestion(text);
      setAnswer(a);
      setShown(1);
      setTab("ask");
      history.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Student"
        title="Ask, and see *how* the answer is *built.*"
        lead="Answers arrive one step at a time. Press a step you did not follow and ask for it again."
      />
      <div className="app-body">
        <Tabs
          idPrefix="tutor"
          label="Tutor modes"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "ask", label: "Ask" },
            { id: "pdf", label: "Upload PDF" },
            { id: "voice", label: "Voice" },
            { id: "history", label: "History" },
          ]}
        />

        <TabPanel idPrefix="tutor" id="ask" value={tab}>
          <form
            className="form"
            style={{ maxWidth: "46rem" }}
            onSubmit={(e) => {
              e.preventDefault();
              ask();
            }}
          >
            <div className="field" data-invalid={error ? "true" : "false"}>
              <label htmlFor="q">Your question</label>
              <textarea
                id="q"
                value={question}
                maxLength={600}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <span className="field__hint">
                Do not include passwords or personal details.
              </span>
              {error && (
                <span className="field__error" role="alert">
                  {error}
                </span>
              )}
            </div>
            <div>
              <button className="btn btn--primary" type="submit" disabled={busy}>
                {busy ? "Working on it" : "Get a step by step answer"} <ArrowRight />
              </button>
            </div>
          </form>
          {busy && <Loading label="Building your answer" />}
          {answer && !busy && (
            <div style={{ marginTop: 32 }}>
              <AnswerView
                key={answer.id}
                answer={answer}
                shown={shown}
                setShown={setShown}
              />
            </div>
          )}
        </TabPanel>

        <TabPanel idPrefix="tutor" id="pdf" value={tab}>
          <PdfUploadPanel onAnalyzed={onPdfAnalyzed} />
        </TabPanel>

        <TabPanel idPrefix="tutor" id="voice" value={tab}>
          <VoicePanel onUse={(t) => ask(t)} />
        </TabPanel>

        <TabPanel idPrefix="tutor" id="history" value={tab}>
          {history.loading && <Loading />}
          {history.error && <ErrorState error={history.error} onRetry={history.reload} />}
          {history.data && history.data.length === 0 && (
            <Empty
              title="No questions yet"
              text="Questions you ask will appear here."
            />
          )}
          {history.data && history.data.length > 0 && (
            <ul className="list" style={{ maxWidth: "46rem" }}>
              {history.data.map((d: any) => (
                <li key={d.id} className="row" style={{ justifyContent: "space-between" }}>
                  <div>
                    <p>{d.question}</p>
                    <p className="meta">{timeAgo(d.createdAt)}</p>
                  </div>
                  <button
                    type="button"
                    className="btn-text"
                    onClick={() => {
                      setQuestion(d.question);
                      setTab("ask");
                    }}
                  >
                    Ask again
                  </button>
                </li>
              ))}
            </ul>
          )}
        </TabPanel>
      </div>
    </>
  );
}

export default function TutorPage() {
  return (
    <RequireRole role="student">
      <TutorContent />
    </RequireRole>
  );
}
