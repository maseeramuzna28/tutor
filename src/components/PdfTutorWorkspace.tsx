"use client";

import React, { useState, useRef, useEffect, MouseEvent } from "react";
import { gsap } from "gsap";
import {
  FileText,
  Upload,
  Mic,
  MicOff,
  PenTool,
  Highlighter,
  Eraser,
  Undo2,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Send,
  Layers,
  ArrowRight,
  Shield,
  HelpCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import MathStepRenderer from "@/components/MathStepRenderer";
import TutoLoader from "@/components/TutoLoader";
import { StepItem } from "@/lib/types";

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

interface PreloadedDoc {
  id: string;
  title: string;
  courseCode: string;
  subject: string;
  pageCount: number;
  pageContent: {
    pageNumber: number;
    subheading: string;
    bodyParagraph: string;
    primaryLatex: string;
    secondaryLatex: string;
    diagramLabel: string;
    defaultQuestion: string;
    solutionSpoken: string;
    solutionSteps: StepItem[];
    // Rich Sketched Explanations drawn directly ON the PDF page
    aiSketchesOnPdf: {
      id: string;
      targetTerm: string;
      circleCoords: { cx: number; cy: number; rx: number; ry: number };
      arrowPath: string; // SVG path for curved sketched arrow
      notePlacement: { x: number; y: number; width: number; height: number };
      title: string;
      body: string;
      color: string;
    }[];
  };
}

const PRELOADED_DOCS: PreloadedDoc[] = [
  {
    id: "ece-301",
    title: "Continuous-Time Fourier Transform & Duality Properties",
    courseCode: "ECE 301",
    subject: "Signals and Systems",
    pageCount: 8,
    pageContent: {
      pageNumber: 3,
      subheading: "Section 4.3 • Symmetrical Duality of Time and Spectral Frequency",
      bodyParagraph:
        "The duality property of the continuous-time Fourier transform is a direct mathematical consequence of the deep symmetry between the forward synthesis equation and the inverse analysis integral. Because the two integrals differ only by a sign in the complex exponent and a constant factor of 1/(2π), any transform pair yields a dual frequency relationship.",
      primaryLatex: "x(t) \\longleftrightarrow X(\\omega) \\implies X(t) \\longleftrightarrow 2\\pi x(-\\omega)",
      secondaryLatex: "\\mathcal{F}\\left\\{\\text{rect}\\left(\\frac{t}{T}\\right)\\right\\} = T \\cdot \\text{sinc}\\left(\\frac{\\omega T}{2\\pi}\\right)",
      diagramLabel: "Figure 4.12: Dual relationship between rectangular gate pulse and infinite sinc waveform spectrum.",
      defaultQuestion:
        "In equation 4.3, why is there a factor of 2π attached to x(-ω) on the right side, but not when doing the inverse Fourier transform directly?",
      solutionSpoken:
        "Notice the 2π factor I circled on your PDF: it balances the 1/(2π) normalization from the inverse Fourier definition. And look at the minus sign on omega: that comes directly from the negative exponent in the forward transform. I've sketched the complete breakdown directly onto your lecture sheet.",
      solutionSteps: [
        {
          step_number: 1,
          title: "Inverse Fourier Integral Definition",
          latex: "x(t) = \\frac{1}{2\\pi} \\int_{-\\infty}^{\\infty} X(\\omega) e^{j\\omega t} \\, d\\omega",
          explanation: "The standard synthesis equation has a 1/(2π) normalization factor in radian frequency ω.",
        },
        {
          step_number: 2,
          title: "Variable Substitution (t ↔ ω)",
          latex: "2\\pi x(t) = \\int_{-\\infty}^{\\infty} X(u) e^{jut} \\, du \\implies 2\\pi x(-\\omega) = \\int_{-\\infty}^{\\infty} X(t) e^{-j\\omega t} \\, dt",
          explanation: "Replacing t with -ω and renaming the dummy integration variable u to t exposes the exact forward transform integral.",
        },
        {
          step_number: 3,
          title: "Dual Transform Identity",
          latex: "\\mathcal{F}\\{X(t)\\} = 2\\pi x(-\\omega)",
          explanation: "Evaluating the forward Fourier transform of the time waveform X(t) yields 2π times x(-ω), proving the theorem.",
        },
      ],
      aiSketchesOnPdf: [
        {
          id: "sk_1",
          targetTerm: "2π factor",
          circleCoords: { cx: 345, cy: 302, rx: 28, ry: 18 },
          arrowPath: "M 370 295 C 410 270, 440 250, 470 240",
          notePlacement: { x: 420, y: 195, width: 220, height: 68 },
          title: "AI SKETCH: 2π NORMALIZATION",
          body: "Arises from the 1/(2π) coefficient in the synthesis integral. Multiplying across transfers 2π here.",
          color: "#dc2626",
        },
        {
          id: "sk_2",
          targetTerm: "-ω sign reversal",
          circleCoords: { cx: 405, cy: 302, rx: 25, ry: 18 },
          arrowPath: "M 410 320 C 430 360, 450 380, 460 400",
          notePlacement: { x: 380, y: 400, width: 230, height: 68 },
          title: "AI SKETCH: EXPONENT REVERSAL",
          body: "The minus sign on (-ω) emerges from e^{-jωt} forward transform kernel conjugate symmetry.",
          color: "#b45309",
        },
      ],
    },
  },
  {
    id: "math-201",
    title: "Spectral Decomposition and Matrix Orthogonality",
    courseCode: "MATH 201",
    subject: "Linear Algebra",
    pageCount: 14,
    pageContent: {
      pageNumber: 5,
      subheading: "Section 7.2 • Invertibility of (A - λI) and Non-trivial Eigenvectors",
      bodyParagraph:
        "A non-zero vector v is said to be an eigenvector of square operator A corresponding to scalar eigenvalue λ if the vector's direction remains invariant under transformation. In order to solve the homogeneous system without collapsing to the trivial zero vector, the operator matrix must be singular.",
      primaryLatex: "(A - \\lambda I) v = 0 \\quad \\text{where } v \\neq 0 \\iff \\det(A - \\lambda I) = 0",
      secondaryLatex: "p(\\lambda) = \\det(A - \\lambda I) = (-1)^n \\lambda^n + c_{n-1}\\lambda^{n-1} + \\dots + \\det(A)",
      diagramLabel: "Figure 7.4: Nullspace projection showing kernel dimension dim(Null(A - λI)) ≥ 1.",
      defaultQuestion:
        "Why must the determinant of (A - λI) strictly equal zero for an eigenvector to exist? What happens if the determinant is non-zero?",
      solutionSpoken:
        "Look at the red circled condition on your PDF: if the determinant were non-zero, the matrix would be invertible. An invertible matrix forces its null space to contain only the zero vector. But eigenvectors must be non-zero! I've sketched the contradiction proof directly on your notes.",
      solutionSteps: [
        {
          step_number: 1,
          title: "Homogeneous System Formulation",
          latex: "(A - \\lambda I) v = \\mathbf{0}",
          explanation: "Subtracting λv from both sides groups the linear transformation into a single matrix operator.",
        },
        {
          step_number: 2,
          title: "Invertibility Contradiction Proof",
          latex: "\\text{If } \\det(A - \\lambda I) \\neq 0 \\implies (A - \\lambda I)^{-1} \\text{ exists}",
          explanation: "An invertible matrix has a trivial nullspace containing only the zero vector.",
        },
        {
          step_number: 3,
          title: "Forced Collapse to Zero",
          latex: "v = (A - \\lambda I)^{-1} \\mathbf{0} = \\mathbf{0} \\quad (\\text{Contradiction: } v \\neq \\mathbf{0})",
          explanation: "Because eigenvectors must be non-trivial, (A - λI) is required to be singular.",
        },
      ],
      aiSketchesOnPdf: [
        {
          id: "sk_3",
          targetTerm: "det(A - λI) = 0",
          circleCoords: { cx: 435, cy: 300, rx: 70, ry: 22 },
          arrowPath: "M 450 280 C 470 240, 500 220, 520 200",
          notePlacement: { x: 420, y: 140, width: 230, height: 72 },
          title: "AI SKETCH: SINGULARITY CRITERION",
          body: "Non-trivial kernel: det = 0 ensures the nullspace has dimension >= 1, permitting non-zero vectors v.",
          color: "#dc2626",
        },
      ],
    },
  },
];

// Helper to convert array of points to smooth SVG path
function pointsToSvgPath(points: StrokePoint[]): string {
  if (!points || points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y} L ${points[0].x + 0.1} ${points[0].y + 0.1}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    path += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
  }
  path += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;
  return path;
}

export default function PdfTutorWorkspace() {
  const [selectedDoc, setSelectedDoc] = useState<PreloadedDoc>(PRELOADED_DOCS[0]);
  const [currentPage, setCurrentPage] = useState<number>(3);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Digital Sketch Pen Tools
  const [activeTool, setActiveTool] = useState<"pen" | "highlighter" | "pan">("pen");
  const [penColor, setPenColor] = useState<string>("#dc2626"); // Editorial crimson red
  const [penWidth, setPenWidth] = useState<number>(3);

  // Freehand Strokes Drawn by Student
  const [strokes, setStrokes] = useState<FreehandStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<StrokePoint[] | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Toggle Visibility of Sketch Layers
  const [showStudentSketches, setShowStudentSketches] = useState(true);
  const [showAiSketches, setShowAiSketches] = useState(true);

  // Voice Interaction States
  const [isListeningSpeech, setIsListeningSpeech] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState("");
  const [isReasoning, setIsReasoning] = useState(false);
  const [reasoningPhase, setReasoningPhase] = useState("");
  const [hasSolution, setHasSolution] = useState(false);

  // Audio Playback
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Upload Reference
  const [customFileName, setCustomFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Fullscreen ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // GSAP animation on solution arrival
  useEffect(() => {
    if (hasSolution) {
      gsap.fromTo(
        ".ai-solution-block",
        { opacity: 0, y: 16, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" }
      );
      gsap.fromTo(
        ".ai-sketch-note",
        { opacity: 0, scale: 0.88 },
        { opacity: 1, scale: 1, stagger: 0.12, duration: 0.45, ease: "back.out(1.5)" }
      );
    }
  }, [hasSolution]);

  // Speech Recognition initialization
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-IN";

        recognition.onresult = (event: any) => {
          let current = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          if (current.trim()) {
            setSpokenTranscript(current.trim());
          }
        };

        recognition.onend = () => {
          setIsListeningSpeech(false);
        };

        recognition.onerror = () => {
          setIsListeningSpeech(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Handle PDF Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomFileName(file.name);
      setStrokes([]);
      setHasSolution(false);
      setSpokenTranscript("");
    }
  };

  // Sketch Pen Mouse/Touch Handlers
  const getCanvasCoords = (e: MouseEvent<HTMLDivElement>): StrokePoint | null => {
    const rect = canvasContainerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const scale = zoomLevel / 100;
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (activeTool === "pan") return;
    const coords = getCanvasCoords(e);
    if (!coords) return;

    setIsDrawing(true);
    setCurrentStroke([coords]);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !currentStroke) return;
    const coords = getCanvasCoords(e);
    if (!coords) return;

    setCurrentStroke((prev) => (prev ? [...prev, coords] : [coords]));
  };

  const handleMouseUp = () => {
    if (isDrawing && currentStroke && currentStroke.length > 2) {
      const newStroke: FreehandStroke = {
        id: `stroke_${Date.now()}`,
        points: currentStroke,
        color: activeTool === "highlighter" ? "rgba(217, 119, 6, 0.35)" : penColor,
        width: activeTool === "highlighter" ? 14 : penWidth,
        isHighlighter: activeTool === "highlighter",
      };
      setStrokes((prev) => [...prev, newStroke]);
    }
    setIsDrawing(false);
    setCurrentStroke(null);
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleClearAll = () => {
    setStrokes([]);
    setHasSolution(false);
    stopAudio();
  };

  // Voice Interaction
  const handleToggleMic = () => {
    if (isListeningSpeech) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListeningSpeech(false);
    } else {
      setSpokenTranscript("");
      try {
        recognitionRef.current?.start();
        setIsListeningSpeech(true);
      } catch {
        setSpokenTranscript(selectedDoc.pageContent.defaultQuestion);
      }
    }
  };

  // Trigger Reasoning
  const handleTriggerReasoning = async (queryText?: string) => {
    const questionToSolve = queryText || spokenTranscript || selectedDoc.pageContent.defaultQuestion;
    if (!questionToSolve.trim()) return;

    setSpokenTranscript(questionToSolve);
    setIsReasoning(true);
    setHasSolution(false);
    stopAudio();

    setReasoningPhase("Cropping hand-sketched circle coordinates on PDF…");
    await new Promise((r) => setTimeout(r, 450));

    setReasoningPhase("Multimodal model analyzing formula syntax…");
    await new Promise((r) => setTimeout(r, 600));

    setReasoningPhase("Generating visual sketch annotations & spoken answer…");
    await new Promise((r) => setTimeout(r, 550));

    setIsReasoning(false);
    setReasoningPhase("");
    setHasSolution(true);

    playSpokenAudio(selectedDoc.pageContent.solutionSpoken);
  };

  // Audio Playback
  const playSpokenAudio = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-IN";
      utterance.rate = 1.0;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopAudio = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  return (
    <div
      className={`border border-stone-200 bg-white transition-all ${
        isFullscreen
          ? "fixed inset-0 z-50 overflow-y-auto bg-stone-900/95 backdrop-blur-md p-3 sm:p-6"
          : "relative"
      }`}
    >
      {/* Top Document Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-stone-50/90 px-4 py-2.5 font-mono text-xs">
        {/* Document Switcher & Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-red-600" />
            <span className="font-bold text-stone-900 uppercase">
              {customFileName ? customFileName : selectedDoc.title}
            </span>
          </div>

          <span className="text-stone-300">|</span>

          {/* Preset document selector */}
          <select
            value={selectedDoc.id}
            onChange={(e) => {
              const doc = PRELOADED_DOCS.find((d) => d.id === e.target.value);
              if (doc) {
                setSelectedDoc(doc);
                setCustomFileName(null);
                setStrokes([]);
                setHasSolution(false);
                setSpokenTranscript("");
                stopAudio();
              }
            }}
            className="border border-stone-300 bg-white px-2 py-1 text-[11px] text-stone-800 font-mono focus:border-red-600 focus:outline-none"
          >
            {PRELOADED_DOCS.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.courseCode} • {doc.subject}
              </option>
            ))}
          </select>
        </div>

        {/* Action Controls & Fullscreen Trigger */}
        <div className="flex items-center gap-2">
          {/* Custom PDF Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 border border-stone-300 bg-white px-2.5 py-1 text-[11px] text-stone-700 hover:border-stone-900 transition-colors uppercase font-mono"
            title="Upload any university PDF handout"
          >
            <Upload className="h-3 w-3" />
            <span>Upload PDF</span>
          </button>

          {/* Page Navigator */}
          <div className="flex items-center border border-stone-300 bg-white">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 hover:bg-stone-100 text-stone-600"
              title="Previous Page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 text-[11px] text-stone-800 font-bold">
              PAGE {currentPage} / {selectedDoc.pageCount}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(selectedDoc.pageCount, p + 1))}
              className="p-1 hover:bg-stone-100 text-stone-600"
              title="Next Page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center border border-stone-300 bg-white">
            <button
              onClick={() => setZoomLevel((z) => Math.max(80, z - 10))}
              className="p-1 hover:bg-stone-100 text-stone-600"
              title="Zoom Out"
            >
              <ZoomOut className="h-3 w-3" />
            </button>
            <span className="px-1.5 text-[10px] text-stone-600">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(140, z + 10))}
              className="p-1 hover:bg-stone-100 text-stone-600"
              title="Zoom In"
            >
              <ZoomIn className="h-3 w-3" />
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono uppercase font-bold border transition-all ${
              isFullscreen
                ? "bg-red-600 text-white border-red-700 shadow-sm"
                : "bg-stone-950 text-white border-stone-900 hover:bg-red-600"
            }`}
            title={isFullscreen ? "Exit Fullscreen (ESC)" : "Full Screen PDF Workspace"}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            <span>{isFullscreen ? "Exit Fullscreen" : "Full Screen PDF"}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className={`grid grid-cols-1 ${isFullscreen ? "lg:grid-cols-12 gap-4 mt-3" : "lg:grid-cols-12"} min-h-[660px]`}>
        {/* Left Column (7 cols): PDF Sheet with Real Sketch Pen Layer */}
        <div
          className={`${
            isFullscreen
              ? "lg:col-span-8 bg-stone-900 border border-stone-800 p-4 sm:p-6"
              : "lg:col-span-7 border-b lg:border-b-0 lg:border-r border-stone-200 bg-stone-100/60 p-4 sm:p-6"
          } flex flex-col justify-between`}
        >
          <div>
            {/* Real Sketch Pen Toolstrip */}
            <div className="flex flex-wrap items-center justify-between gap-2 border border-stone-300 bg-white px-3 py-2 mb-4 font-mono text-xs">
              {/* Pen Type Controls */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-stone-500 mr-1">Pen Tool:</span>

                {/* Freehand Sketch Pen */}
                <button
                  onClick={() => setActiveTool("pen")}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] uppercase transition-all ${
                    activeTool === "pen"
                      ? "bg-red-600 text-white font-bold"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                  title="Freehand sketch pen to circle equations directly"
                >
                  <PenTool className="h-3 w-3" />
                  <span>Sketch Pen</span>
                </button>

                {/* Highlighter */}
                <button
                  onClick={() => setActiveTool("highlighter")}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] uppercase transition-all ${
                    activeTool === "highlighter"
                      ? "bg-amber-600 text-white font-bold"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                  title="Highlighter marker"
                >
                  <Highlighter className="h-3 w-3" />
                  <span>Highlight</span>
                </button>

                {/* Read Only Pan */}
                <button
                  onClick={() => setActiveTool("pan")}
                  className={`px-2 py-1 text-[11px] uppercase transition-all ${
                    activeTool === "pan"
                      ? "bg-stone-900 text-white font-bold"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                  title="Pan without sketching"
                >
                  Pan
                </button>

                {/* Ink Color Selector */}
                {activeTool === "pen" && (
                  <div className="flex items-center gap-1 pl-2 border-l border-stone-200">
                    <button
                      onClick={() => setPenColor("#dc2626")}
                      className={`h-4 w-4 rounded-none bg-red-600 border ${
                        penColor === "#dc2626" ? "ring-2 ring-stone-900 ring-offset-1" : ""
                      }`}
                      title="Crimson Red Pen"
                    />
                    <button
                      onClick={() => setPenColor("#b45309")}
                      className={`h-4 w-4 rounded-none bg-amber-600 border ${
                        penColor === "#b45309" ? "ring-2 ring-stone-900 ring-offset-1" : ""
                      }`}
                      title="Amber Pen"
                    />
                    <button
                      onClick={() => setPenColor("#0c0a09")}
                      className={`h-4 w-4 rounded-none bg-stone-950 border ${
                        penColor === "#0c0a09" ? "ring-2 ring-stone-900 ring-offset-1" : ""
                      }`}
                      title="Ink Black Pen"
                    />
                  </div>
                )}
              </div>

              {/* Layer Toggles & Undo / Clear */}
              <div className="flex items-center gap-2">
                {/* AI Sketch Layer Toggle */}
                {hasSolution && (
                  <button
                    onClick={() => setShowAiSketches(!showAiSketches)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase font-bold border transition-colors ${
                      showAiSketches
                        ? "bg-stone-950 text-white border-stone-950"
                        : "bg-white text-stone-500 border-stone-300"
                    }`}
                    title="Toggle AI Explanatory Sketches drawn on the PDF"
                  >
                    {showAiSketches ? <Eye className="h-3 w-3 text-red-500" /> : <EyeOff className="h-3 w-3" />}
                    <span>AI Sketch Layer</span>
                  </button>
                )}

                <button
                  onClick={handleUndo}
                  disabled={strokes.length === 0}
                  className="inline-flex items-center gap-1 text-[11px] text-stone-600 hover:text-stone-950 disabled:opacity-30 uppercase font-mono"
                  title="Undo last pen stroke"
                >
                  <Undo2 className="h-3 w-3" />
                  <span>Undo</span>
                </button>

                <button
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1 text-[11px] text-stone-500 hover:text-red-600 transition-colors uppercase font-mono"
                  title="Clear all strokes and annotations"
                >
                  <Eraser className="h-3 w-3" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* The Document Page Sheet */}
            <div
              ref={canvasContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className={`relative mx-auto max-w-2xl bg-white border border-stone-300 shadow-md p-6 sm:p-10 select-none transition-transform ${
                activeTool !== "pan" ? "cursor-crosshair" : "cursor-default"
              }`}
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: "top center",
              }}
            >
              {/* Document Masthead */}
              <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-6 font-mono text-[10px] text-stone-400 uppercase tracking-widest">
                <span>{selectedDoc.courseCode} LECTURE HANDOUT</span>
                <span>PAGE 0{currentPage}</span>
              </div>

              {/* Document Text & Math Body */}
              <div className="space-y-5">
                <h3 className="font-serif font-bold text-lg text-stone-950 leading-snug">
                  {selectedDoc.pageContent.subheading}
                </h3>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans text-justify">
                  {selectedDoc.pageContent.bodyParagraph}
                </p>

                {/* Primary Mathematical Target */}
                <div className="relative my-6 p-5 border border-stone-200 bg-stone-50/70 font-mono text-center text-sm">
                  <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider text-right mb-1">
                    [Eq. 4.3a]
                  </div>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: `<div class="katex-display font-serif text-stone-950 font-bold">${selectedDoc.pageContent.primaryLatex}</div>`,
                    }}
                  />
                  <div className="flex items-center justify-center gap-1 text-[10px] text-stone-400 mt-2 font-mono">
                    <PenTool className="h-2.5 w-2.5 text-red-600" />
                    <span>Use the sketch pen to circle this equation with your mouse</span>
                  </div>
                </div>

                {/* Secondary Formula */}
                <div className="p-3.5 border border-stone-200 bg-white font-mono text-center text-xs">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: `<div class="katex-display text-stone-800">${selectedDoc.pageContent.secondaryLatex}</div>`,
                    }}
                  />
                </div>

                <div className="p-2.5 border-l-2 border-stone-300 bg-stone-50 font-mono text-[11px] text-stone-600">
                  {selectedDoc.pageContent.diagramLabel}
                </div>
              </div>

              {/* SVG Layer for Freehand Pen Strokes + AI Explanatory Sketches ON the PDF */}
              <svg className="absolute inset-0 h-full w-full pointer-events-none z-20 overflow-visible">
                <defs>
                  {/* Arrow marker for AI sketched explanations */}
                  <marker
                    id="ai-arrow-red"
                    markerWidth="8"
                    markerHeight="8"
                    refX="6"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path d="M0,0 L0,6 L6,3 z" fill="#dc2626" />
                  </marker>
                  <marker
                    id="ai-arrow-amber"
                    markerWidth="8"
                    markerHeight="8"
                    refX="6"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path d="M0,0 L0,6 L6,3 z" fill="#b45309" />
                  </marker>
                </defs>

                {/* 1. Student's Hand-Drawn Pen Strokes */}
                {showStudentSketches &&
                  strokes.map((stroke) => (
                    <path
                      key={stroke.id}
                      d={pointsToSvgPath(stroke.points)}
                      fill="none"
                      stroke={stroke.color}
                      strokeWidth={stroke.width}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={stroke.isHighlighter ? 0.4 : 0.9}
                    />
                  ))}

                {/* Currently In-Progress Pen Stroke */}
                {isDrawing && currentStroke && (
                  <path
                    d={pointsToSvgPath(currentStroke)}
                    fill="none"
                    stroke={activeTool === "highlighter" ? "rgba(217, 119, 6, 0.4)" : penColor}
                    strokeWidth={activeTool === "highlighter" ? 14 : penWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* 2. AI SKETCH EXPLANATIONS DRAWN DIRECTLY ON THE PDF */}
                {hasSolution &&
                  showAiSketches &&
                  selectedDoc.pageContent.aiSketchesOnPdf.map((aiSketch) => (
                    <g key={aiSketch.id} className="ai-sketch-note">
                      {/* Animated hand-sketched highlight ellipse around the specific term */}
                      <ellipse
                        cx={aiSketch.circleCoords.cx}
                        cy={aiSketch.circleCoords.cy}
                        rx={aiSketch.circleCoords.rx}
                        ry={aiSketch.circleCoords.ry}
                        fill="rgba(220, 38, 38, 0.08)"
                        stroke={aiSketch.color}
                        strokeWidth="2.5"
                        strokeDasharray="4 2"
                      />

                      {/* Sketched Curved Arrow pointing from circled term to margin note */}
                      <path
                        d={aiSketch.arrowPath}
                        fill="none"
                        stroke={aiSketch.color}
                        strokeWidth="2"
                        strokeDasharray="3 2"
                        markerEnd={aiSketch.color === "#dc2626" ? "url(#ai-arrow-red)" : "url(#ai-arrow-amber)"}
                      />

                      {/* Hand-sketched Explanation Note Card ON THE PDF SHEET */}
                      <g
                        transform={`translate(${aiSketch.notePlacement.x}, ${aiSketch.notePlacement.y})`}
                        className="drop-shadow-sm"
                      >
                        {/* Note card background */}
                        <rect
                          x="0"
                          y="0"
                          width={aiSketch.notePlacement.width}
                          height={aiSketch.notePlacement.height}
                          fill="#ffffff"
                          stroke={aiSketch.color}
                          strokeWidth="1.5"
                        />
                        {/* Title header */}
                        <rect x="0" y="0" width={aiSketch.notePlacement.width} height="18" fill={aiSketch.color} />
                        <text
                          x="8"
                          y="12"
                          fill="#ffffff"
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                          letterSpacing="0.05em"
                        >
                          {aiSketch.title}
                        </text>
                        {/* Explanation text */}
                        <foreignObject x="8" y="22" width={aiSketch.notePlacement.width - 16} height="42">
                          <p
                            style={{
                              fontSize: "10px",
                              lineHeight: "1.25",
                              color: "#1c1917",
                              fontFamily: "sans-serif",
                              margin: 0,
                            }}
                          >
                            {aiSketch.body}
                          </p>
                        </foreignObject>
                      </g>
                    </g>
                  ))}
              </svg>
            </div>
          </div>

          {/* Quick Helper Banner */}
          <div className="mt-4 p-2.5 border border-stone-200 bg-white font-mono text-[11px] text-stone-600 flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-red-600 inline-block" />
              <span>Draw freely with the Sketch Pen to circle any doubt</span>
            </span>
            <span className="text-stone-400">
              {strokes.length > 0 ? `${strokes.length} pen stroke(s) recorded` : "Pen ready on canvas"}
            </span>
          </div>
        </div>

        {/* Right Column (5 cols): AI Multimodal Voice & Reasoning Console */}
        <div
          className={`${
            isFullscreen
              ? "lg:col-span-4 bg-white border border-stone-300 p-4 sm:p-6"
              : "lg:col-span-5 p-4 sm:p-6 bg-white"
          } flex flex-col justify-between space-y-5`}
        >
          <div className="space-y-4">
            {/* Header: Call AI Over with Voice */}
            <div className="border-b border-stone-200 pb-3">
              <div className="flex items-center justify-between">
                <span className="editorial-kicker">MULTIMODAL REASONING</span>
                <span className="font-mono text-[10px] text-stone-400 uppercase">SPEECH + SKETCH</span>
              </div>
              <h2 className="text-xl font-serif text-stone-950 font-normal mt-0.5">
                Call AI Tutor Over Your Doubt
              </h2>
            </div>

            {/* Voice Input Dispatcher */}
            <div className="border border-stone-200 bg-stone-50/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase font-bold text-stone-700 flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-none inline-block ${
                      isListeningSpeech ? "bg-red-600 animate-ping" : "bg-stone-400"
                    }`}
                  />
                  <span>{isListeningSpeech ? "Listening to Voice..." : "Speak Your Question"}</span>
                </span>

                <button
                  onClick={handleToggleMic}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 font-mono text-xs uppercase font-bold transition-all ${
                    isListeningSpeech
                      ? "bg-red-600 text-white animate-pulse"
                      : "bg-stone-950 text-white hover:bg-red-600"
                  }`}
                >
                  {isListeningSpeech ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                  <span>{isListeningSpeech ? "STOP SPEECH" : "ASK VIA VOICE"}</span>
                </button>
              </div>

              {/* Spoken Query Display / Edit Input */}
              <div className="bg-white border border-stone-300 p-2.5">
                <textarea
                  rows={2}
                  value={spokenTranscript}
                  onChange={(e) => setSpokenTranscript(e.target.value)}
                  placeholder="Click 'Ask via Voice' or speak your question about the circled area..."
                  className="w-full text-xs text-stone-900 placeholder-stone-400 font-sans focus:outline-none resize-none"
                />
              </div>

              {/* Preload Doubt Button */}
              {!spokenTranscript && (
                <button
                  onClick={() => setSpokenTranscript(selectedDoc.pageContent.defaultQuestion)}
                  className="w-full text-left p-2 border border-stone-200 bg-white hover:border-red-600 font-mono text-[11px] text-stone-600 transition-colors"
                >
                  <span className="text-red-600 font-bold mr-1">Preload Doubt:</span>
                  &ldquo;{selectedDoc.pageContent.defaultQuestion.slice(0, 75)}…&rdquo;
                </button>
              )}

              {/* Action Button: Solve with Reasoning Engine */}
              <button
                onClick={() => handleTriggerReasoning()}
                disabled={isReasoning || (!spokenTranscript.trim() && strokes.length === 0)}
                className="editorial-btn editorial-btn-red w-full py-2.5 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>SEND TO REASONING ENGINE</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* AI Reasoning State */}
            {isReasoning && (
              <div className="border border-stone-200 bg-stone-50 p-5 text-center space-y-3">
                <TutoLoader variant="voice" size="md" color="red" label={reasoningPhase} />
                <p className="font-mono text-[10px] text-stone-500 uppercase tracking-widest">
                  Analyzing Document Pixels + Mathematical Grammar
                </p>
              </div>
            )}

            {/* Visual Solution with Speech & Display Explanatory Sketch */}
            {hasSolution && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Spoken Audio Player Bar */}
                <div className="border border-stone-950 bg-stone-950 text-white p-3.5 space-y-2">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 bg-red-600 rounded-none inline-block animate-pulse" />
                      <span className="font-mono text-[10px] uppercase font-bold text-red-500 tracking-wider">
                        AUDIO TUTOR EXPLANATION
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (isPlayingAudio) {
                          stopAudio();
                        } else {
                          playSpokenAudio(selectedDoc.pageContent.solutionSpoken);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-stone-700 bg-stone-900 font-mono text-[10px] uppercase hover:border-red-500 text-stone-200 transition-colors"
                    >
                      {isPlayingAudio ? (
                        <>
                          <VolumeX className="h-3 w-3 text-red-500" />
                          <span>Pause Audio</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 text-white" />
                          <span>Replay Spoken Audio</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Audio Waveform Graphic */}
                  <div className="flex items-center gap-1 h-4">
                    {[16, 28, 12, 34, 20, 40, 18, 30, 24, 38, 14, 28, 20, 36].map((h, i) => (
                      <motion.span
                        key={i}
                        animate={{
                          height: isPlayingAudio ? [6, h, 8] : 6,
                          backgroundColor: isPlayingAudio ? "#dc2626" : "#78716c",
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.6 + (i % 3) * 0.2,
                          ease: "easeInOut",
                        }}
                        className="w-1 bg-stone-600 rounded-none"
                      />
                    ))}
                    <span className="ml-2 font-mono text-[9px] text-stone-400 uppercase">
                      {isPlayingAudio ? "Speaking at 1.0x Rate" : "Audio Ready"}
                    </span>
                  </div>

                  <p className="text-xs text-stone-300 font-serif italic leading-relaxed pt-1">
                    &ldquo;{selectedDoc.pageContent.solutionSpoken}&rdquo;
                  </p>
                </div>

                {/* Confirmation of Sketches Rendered On PDF */}
                <div className="border border-stone-200 bg-stone-50 p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-1.5">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-red-600" />
                      <span>Sketched Explanations Projected on PDF</span>
                    </span>
                    <button
                      onClick={() => setShowAiSketches(!showAiSketches)}
                      className="text-[10px] font-mono text-red-600 underline uppercase"
                    >
                      {showAiSketches ? "Hide PDF Sketches" : "Show PDF Sketches"}
                    </button>
                  </div>

                  <div className="space-y-1.5 font-mono text-xs">
                    {selectedDoc.pageContent.aiSketchesOnPdf.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 border border-stone-200 bg-white flex items-start gap-2 text-stone-800"
                      >
                        <span className="h-1.5 w-1.5 bg-red-600 rounded-none shrink-0 mt-1" />
                        <div>
                          <p className="font-bold text-[11px] text-red-600 uppercase">{item.title}</p>
                          <p className="text-stone-600 text-[11px] font-sans">{item.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step-by-Step Formal LaTeX Derivation */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-stone-900">
                      Formal Mathematical Derivation
                    </span>
                    <span className="font-mono text-[10px] text-stone-500 uppercase">LaTeX Verified</span>
                  </div>
                  <MathStepRenderer steps={selectedDoc.pageContent.solutionSteps} />
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Anonymity Guarantee */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-between font-mono text-[10px] text-stone-500">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-red-600" />
              <span>Zero PDF storage on server disk</span>
            </span>
            <span>Client RAM Buffer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
