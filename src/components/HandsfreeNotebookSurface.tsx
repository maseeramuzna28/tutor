"use client";

import React, { useState, useRef, useEffect, MouseEvent } from "react";
import {
  PenTool,
  Highlighter,
  Eraser,
  Undo2,
  Trash2,
  Download,
  Mic,
  MicOff,
  Sparkles,
  Bookmark,
  Plus,
  Check,
  Copy,
  ChevronDown,
  FileText,
  Grid,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { StepItem } from "@/lib/types";

export interface NoteEntry {
  id: string;
  timestamp: string;
  title: string;
  content: string;
  latex?: string;
  type: "tutor-step" | "voice-dictated" | "student-typed";
}

interface StrokePoint {
  x: number;
  y: number;
}

interface FreehandStroke {
  id: string;
  points: StrokePoint[];
  color: string;
  width: number;
  isHighlighter?: boolean;
}

interface HandsfreeNotebookProps {
  activeStep?: StepItem | null;
  activeConcept?: string;
  onScribeFormula?: (text: string) => void;
  className?: string;
}

export default function HandsfreeNotebookSurface({
  activeStep,
  activeConcept,
  className = "",
}: HandsfreeNotebookProps) {
  // Tools: 'pen' | 'highlighter' | 'eraser'
  const [activeTool, setActiveTool] = useState<"pen" | "highlighter" | "eraser">("pen");
  const [penColor, setPenColor] = useState<string>("#1e3a8a"); // University Blue default
  const [penWidth, setPenWidth] = useState<number>(2.5);
  const [paperStyle, setPaperStyle] = useState<"lined" | "grid" | "plain">("lined");

  // Freehand Strokes state
  const [strokes, setStrokes] = useState<FreehandStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<StrokePoint[] | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Typed / Voice Notes entries
  const [notes, setNotes] = useState<NoteEntry[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("tuto_notebook_notes");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: "note-init-1",
        timestamp: "Just now",
        title: "Study Objective",
        content: "Hands-Free Auto-Scribe enabled. Key derivations and voice thoughts will pin here automatically.",
        type: "student-typed",
      },
    ];
  });

  // Hands-free Voice Dictation Pen state
  const [isVoicePenActive, setIsVoicePenActive] = useState<boolean>(false);
  const [voiceInterimText, setVoiceInterimText] = useState<string>("");
  const recognitionRef = useRef<any>(null);

  // Canvas ref
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // New typed note input
  const [typedInput, setTypedInput] = useState<string>("");
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  // Persist notes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("tuto_notebook_notes", JSON.stringify(notes));
      } catch {}
    }
  }, [notes]);

  // Hands-Free Speech Recognition Hook
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const finalTranscript = event.results[i][0].transcript.trim();
          if (finalTranscript) {
            handleAutoScribeVoiceNote(finalTranscript);
          }
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setVoiceInterimText(interim);
    };

    recognition.onerror = () => {
      setIsVoicePenActive(false);
      setVoiceInterimText("");
    };

    recognition.onend = () => {
      if (isVoicePenActive) {
        try {
          recognition.start();
        } catch {}
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [isVoicePenActive]);

  const toggleVoicePen = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isVoicePenActive) {
      recognitionRef.current.stop();
      setIsVoicePenActive(false);
      setVoiceInterimText("");
    } else {
      try {
        recognitionRef.current.start();
        setIsVoicePenActive(true);
      } catch {
        setIsVoicePenActive(false);
      }
    }
  };

  const handleAutoScribeVoiceNote = (text: string) => {
    const newEntry: NoteEntry = {
      id: `voice-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      title: "Voice Scribble",
      content: text,
      type: "voice-dictated",
    };
    setNotes((prev) => [newEntry, ...prev]);
    setVoiceInterimText("");
  };

  // Auto-Scribe current Tutor Step
  const handleScribeCurrentStep = (step?: StepItem | null) => {
    const target = step || activeStep;
    if (!target) return;

    // Check if already scribed
    const existing = notes.find((n) => n.id === `step-${target.step_number}`);
    if (existing) return;

    const newEntry: NoteEntry = {
      id: `step-${target.step_number}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      title: `Step ${target.step_number}: ${target.title}`,
      content: target.explanation,
      latex: target.latex,
      type: "tutor-step",
    };

    setNotes((prev) => [newEntry, ...prev]);
  };

  // Whenever activeStep updates with auto_notes, optionally append
  useEffect(() => {
    if (activeStep) {
      handleScribeCurrentStep(activeStep);
    }
  }, [activeStep?.step_number]);

  // Pen Stroke Coordinate calculation
  const getCoordinates = (e: MouseEvent): StrokePoint | null => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: MouseEvent) => {
    const pt = getCoordinates(e);
    if (!pt) return;
    setIsDrawing(true);
    setCurrentStroke([pt]);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDrawing || !currentStroke) return;
    const pt = getCoordinates(e);
    if (!pt) return;
    setCurrentStroke((prev) => (prev ? [...prev, pt] : [pt]));
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentStroke || currentStroke.length === 0) {
      setIsDrawing(false);
      setCurrentStroke(null);
      return;
    }

    if (activeTool === "eraser") {
      setIsDrawing(false);
      setCurrentStroke(null);
      return;
    }

    const newStroke: FreehandStroke = {
      id: `stroke-${Date.now()}`,
      points: currentStroke,
      color: activeTool === "highlighter" ? "#facc15" : penColor,
      width: activeTool === "highlighter" ? 14 : penWidth,
      isHighlighter: activeTool === "highlighter",
    };

    setStrokes((prev) => [...prev, newStroke]);
    setIsDrawing(false);
    setCurrentStroke(null);
  };

  const handleUndoStroke = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleClearStrokes = () => {
    if (window.confirm("Clear all freehand pen sketches on this notebook page?")) {
      setStrokes([]);
    }
  };

  const handleAddTypedNote = () => {
    if (!typedInput.trim()) return;
    const newEntry: NoteEntry = {
      id: `typed-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      title: activeConcept ? `${activeConcept} Note` : "Student Note",
      content: typedInput.trim(),
      type: "student-typed",
    };
    setNotes((prev) => [newEntry, ...prev]);
    setTypedInput("");
    setIsAddingNote(false);
  };

  const handleCopyNote = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNoteId(id);
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  const pointsToSvgPath = (points: StrokePoint[]): string => {
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x} ${points[0].y} L ${points[0].x + 0.1} ${points[0].y + 0.1}`;
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const xc = (points[i].x + points[i - 1].x) / 2;
      const yc = (points[i].y + points[i - 1].y) / 2;
      d += ` Q ${points[i - 1].x} ${points[i - 1].y}, ${xc} ${yc}`;
    }
    return d;
  };

  return (
    <div className={`flex flex-col border border-stone-300 bg-amber-50/20 shadow-xs rounded-none ${className}`}>
      {/* Notebook Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-stone-200 bg-stone-100 px-3.5 py-2.5 gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-900">
              HANDS-FREE NOTEBOOK SURFACE
            </span>
          </div>
          <span className="text-[10px] font-mono text-stone-500 hidden sm:inline">
            • Ephemeral Pen + Auto-Scribe
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Handsfree Voice Pen Toggle */}
          <button
            onClick={toggleVoicePen}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono uppercase tracking-wider border transition-all ${
              isVoicePenActive
                ? "bg-red-600 text-white border-red-700 animate-pulse"
                : "bg-white text-stone-700 border-stone-300 hover:border-stone-900"
            }`}
            title="Hands-Free Voice Pen: Dictate verbal thoughts directly to lined paper"
          >
            {isVoicePenActive ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3 text-stone-400" />}
            <span>{isVoicePenActive ? "Listening (Voice Pen ON)" : "Voice Pen"}</span>
          </button>

          {/* Scribe Active Step Button */}
          {activeStep && (
            <button
              onClick={() => handleScribeCurrentStep(activeStep)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono uppercase tracking-wider bg-stone-900 text-white hover:bg-red-600 transition-colors"
              title="Pin current formula & step directly into notebook"
            >
              <Sparkles className="h-3 w-3 text-amber-300" />
              <span>Scribe Step {activeStep.step_number}</span>
            </button>
          )}

          {/* Paper Style Toggle */}
          <div className="flex border border-stone-300 bg-white">
            <button
              onClick={() => setPaperStyle("lined")}
              className={`p-1 text-xs font-mono ${paperStyle === "lined" ? "bg-stone-200 text-stone-900" : "text-stone-500"}`}
              title="College Ruled Lined Paper"
            >
              <FileText className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setPaperStyle("grid")}
              className={`p-1 text-xs font-mono ${paperStyle === "grid" ? "bg-stone-200 text-stone-900" : "text-stone-500"}`}
              title="Engineering Grid Paper"
            >
              <Grid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Pen Tools & Colors Sub-Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-stone-200 bg-white px-3.5 py-1.5 text-xs">
        {/* Tool Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-stone-300 p-0.5 bg-stone-50">
            <button
              onClick={() => setActiveTool("pen")}
              className={`flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono uppercase ${
                activeTool === "pen" ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <PenTool className="h-3 w-3" />
              <span>Pen</span>
            </button>
            <button
              onClick={() => setActiveTool("highlighter")}
              className={`flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono uppercase ${
                activeTool === "highlighter" ? "bg-amber-400 text-stone-950 font-bold" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Highlighter className="h-3 w-3" />
              <span>Highlighter</span>
            </button>
            <button
              onClick={() => setActiveTool("eraser")}
              className={`flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono uppercase ${
                activeTool === "eraser" ? "bg-red-100 text-red-800" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Eraser className="h-3 w-3" />
              <span>Eraser</span>
            </button>
          </div>

          {/* Color Palette (Pen mode) */}
          {activeTool === "pen" && (
            <div className="flex items-center gap-1 ml-1">
              {[
                { color: "#1e3a8a", name: "Royal Blue" },
                { color: "#1c1917", name: "Charcoal Black" },
                { color: "#b91c1c", name: "Crimson Red" },
                { color: "#047857", name: "Emerald Green" },
              ].map((c) => (
                <button
                  key={c.color}
                  onClick={() => setPenColor(c.color)}
                  style={{ backgroundColor: c.color }}
                  className={`h-4 w-4 rounded-full border transition-transform ${
                    penColor === c.color ? "scale-125 border-stone-950 ring-1 ring-stone-400" : "border-white"
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          )}

          {/* Pen Width */}
          {activeTool === "pen" && (
            <div className="flex items-center gap-1 ml-2 text-[10px] font-mono text-stone-500">
              <span>Width:</span>
              {[1.5, 2.5, 4.5].map((w) => (
                <button
                  key={w}
                  onClick={() => setPenWidth(w)}
                  className={`px-1.5 py-0.2 border text-[10px] font-mono ${
                    penWidth === w ? "border-stone-900 bg-stone-200 text-stone-900 font-bold" : "border-stone-300 text-stone-500"
                  }`}
                >
                  {w === 1.5 ? "Fine" : w === 2.5 ? "Med" : "Bold"}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Undo & Clear */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndoStroke}
            disabled={strokes.length === 0}
            className="inline-flex items-center gap-1 text-[11px] font-mono uppercase text-stone-600 hover:text-stone-950 disabled:opacity-30"
          >
            <Undo2 className="h-3 w-3" />
            <span>Undo Pen</span>
          </button>
          <button
            onClick={handleClearStrokes}
            disabled={strokes.length === 0}
            className="inline-flex items-center gap-1 text-[11px] font-mono uppercase text-stone-400 hover:text-red-600 disabled:opacity-30"
          >
            <Trash2 className="h-3 w-3" />
            <span>Clear Ink</span>
          </button>
        </div>
      </div>

      {/* Voice Pen Live Dictation Banner */}
      {isVoicePenActive && (
        <div className="border-b border-red-200 bg-red-50/90 px-4 py-2 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
            <span className="font-mono text-red-900 font-semibold">
              Hands-Free Mic Listening: Speak to scribe notes onto the page...
            </span>
          </div>
          {voiceInterimText && (
            <span className="italic text-red-800 text-[11px] truncate max-w-xs">
              &ldquo;{voiceInterimText}&rdquo;
            </span>
          )}
        </div>
      )}

      {/* The Notebook Page Canvas Area */}
      <div
        ref={containerRef}
        className={`relative w-full min-h-[480px] select-none overflow-hidden transition-all ${
          paperStyle === "lined"
            ? "bg-[linear-gradient(to_bottom,transparent_27px,#e2e8f0_28px)] bg-[size:100%_28px] bg-[#fdfbf7]"
            : paperStyle === "grid"
            ? "bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:20px_20px] bg-[#fdfbf7]"
            : "bg-[#fdfbf7]"
        }`}
      >
        {/* Notebook Left Margin Rule (Red Line for authentic lined pad) */}
        {paperStyle === "lined" && (
          <div className="absolute left-10 top-0 bottom-0 w-[1.5px] bg-red-300 pointer-events-none" />
        )}

        {/* Freehand SVG Sketch Layer */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full cursor-crosshair z-10"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Render Completed Strokes */}
          {strokes.map((stroke) => (
            <path
              key={stroke.id}
              d={pointsToSvgPath(stroke.points)}
              fill="none"
              stroke={stroke.color}
              strokeWidth={stroke.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={stroke.isHighlighter ? 0.45 : 0.9}
            />
          ))}

          {/* Active Drawing Stroke Preview */}
          {currentStroke && (
            <path
              d={pointsToSvgPath(currentStroke)}
              fill="none"
              stroke={activeTool === "highlighter" ? "#facc15" : penColor}
              strokeWidth={activeTool === "highlighter" ? 14 : penWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={activeTool === "highlighter" ? 0.45 : 0.9}
            />
          )}
        </svg>

        {/* Structured Notes & Formula Cards on the Page (Placed in Content Margin) */}
        <div className="relative z-0 p-4 pl-14 sm:pl-16 space-y-3 pointer-events-auto">
          {notes.length === 0 ? (
            <div className="pt-16 text-center text-stone-400 font-mono text-xs">
              <p>Notebook page is blank.</p>
              <p className="text-[11px] mt-1 text-stone-500">
                Use the pen to doodle formulas, or speak with Voice Pen to scribe thoughts hands-free.
              </p>
            </div>
          ) : (
            notes.map((entry) => (
              <div
                key={entry.id}
                className={`relative group p-3.5 border transition-all ${
                  entry.type === "tutor-step"
                    ? "border-amber-300 bg-amber-50/70 shadow-xs"
                    : entry.type === "voice-dictated"
                    ? "border-red-200 bg-white/90 shadow-xs"
                    : "border-stone-200 bg-white/80"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        entry.type === "tutor-step"
                          ? "bg-amber-600"
                          : entry.type === "voice-dictated"
                          ? "bg-red-600"
                          : "bg-blue-600"
                      }`}
                    />
                    <span className="font-mono text-xs font-bold text-stone-900">
                      {entry.title}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">
                      • {entry.timestamp}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopyNote(entry.id, entry.content + (entry.latex ? `\n${entry.latex}` : ""))}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-stone-400 hover:text-stone-900"
                    title="Copy note text"
                  >
                    {copiedNoteId === entry.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>

                <p className="text-xs text-stone-800 leading-relaxed font-sans">
                  {entry.content}
                </p>

                {entry.latex && (
                  <div className="mt-2 p-2 bg-stone-900 text-amber-200 font-mono text-xs border border-stone-800">
                    <span className="text-[10px] uppercase text-stone-400 block font-mono">
                      Formula Key
                    </span>
                    {entry.latex}
                  </div>
                )}
              </div>
            ))
          )}

          {/* Quick Add Note Input */}
          {isAddingNote ? (
            <div className="p-3 border border-stone-400 bg-white shadow-sm mt-3">
              <input
                type="text"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTypedNote();
                }}
                placeholder="Type note or formula observation..."
                className="w-full text-xs p-1.5 border border-stone-200 focus:outline-none focus:border-stone-900 font-sans"
                autoFocus
              />
              <div className="mt-2 flex items-center justify-end gap-2 text-xs font-mono">
                <button
                  onClick={() => setIsAddingNote(false)}
                  className="px-2 py-0.5 text-stone-500 hover:text-stone-900 uppercase"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTypedNote}
                  className="px-3 py-1 bg-stone-900 text-white uppercase text-[11px]"
                >
                  Save Note
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingNote(true)}
              className="inline-flex items-center gap-1.5 text-[11px] font-mono text-stone-500 hover:text-stone-900 uppercase pt-2"
            >
              <Plus className="h-3 w-3" />
              <span>Add typed margin note</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-3.5 py-1.5 text-[10px] font-mono text-stone-500">
        <div className="flex items-center gap-3">
          <span>Strokes: {strokes.length}</span>
          <span>Notes pinned: {notes.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-700 font-semibold">● Local Storage Synced</span>
        </div>
      </div>
    </div>
  );
}
