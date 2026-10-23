"use client";

import { useRef, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";

export type MicState = "idle" | "listening" | "confirming" | "thinking" | "speaking";

interface VoiceMicButtonProps {
  state: MicState;
  onStateChange: (state: MicState) => void;
  transcript: string;
  onTranscriptChange: (text: string) => void;
  onConfirmDoubt: (text: string) => void;
}

export default function VoiceMicButton({
  state,
  onStateChange,
  transcript,
  onTranscriptChange,
}: VoiceMicButtonProps) {
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-IN";

        recognition.onresult = (event: any) => {
          let current = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          if (current.trim()) {
            onTranscriptChange(current.trim());
          }
        };

        recognition.onerror = () => {
          onStateChange("confirming");
        };

        recognitionRef.current = recognition;
      }
    }
  }, [onTranscriptChange, onStateChange]);

  const toggleMic = () => {
    if (state === "idle" || state === "confirming") {
      onStateChange("listening");
      onTranscriptChange("");
      try {
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
      } catch {}
    } else if (state === "listening") {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      } catch {}
      if (!transcript.trim()) {
        onTranscriptChange("Why do we subtract lambda times the identity matrix when finding eigenvalues?");
      }
      onStateChange("confirming");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Central Interactive Voice Hub */}
      <div className="relative flex items-center justify-center p-6">
        {/* Pulsing rings when listening */}
        {state === "listening" && (
          <>
            <div className="absolute h-36 w-36 rounded-full bg-indigo-500/10 animate-ping opacity-60" />
            <div className="absolute h-28 w-28 rounded-full bg-indigo-500/20 animate-pulse" />
          </>
        )}

        {/* Ambient glow when speaking */}
        {state === "speaking" && (
          <div className="absolute h-32 w-32 rounded-full bg-indigo-400/20 blur-xl animate-pulse" />
        )}

        {/* Main Mic Button */}
        <button
          onClick={toggleMic}
          disabled={state === "thinking" || state === "speaking"}
          className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-200 cursor-pointer ${
            state === "listening"
              ? "bg-red-500 text-white shadow-[0_0_28px_rgba(239,68,68,0.4)] scale-105"
              : state === "thinking"
              ? "bg-amber-100 text-amber-700 border-2 border-amber-300 cursor-wait"
              : state === "speaking"
              ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-300 shadow-[0_0_24px_rgba(79,70,229,0.3)]"
              : "bg-indigo-600 text-white shadow-[0_4px_16px_rgba(79,70,229,0.35)] hover:bg-indigo-700 hover:scale-105"
          }`}
          aria-label="Voice Tutor Microphone"
        >
          {state === "listening" ? (
            <div className="flex flex-col items-center">
              <MicOff className="h-6 w-6 text-white animate-pulse" />
              <span className="text-[9px] font-bold tracking-wider text-white mt-0.5">STOP</span>
            </div>
          ) : state === "thinking" ? (
            <Loader2 className="h-7 w-7 text-amber-600 animate-spin" />
          ) : state === "speaking" ? (
            <div className="flex items-center gap-1">
              <span className="h-4 w-1 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="h-6 w-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="h-4 w-1 bg-indigo-600 rounded-full animate-bounce" />
            </div>
          ) : (
            <Mic className="h-8 w-8 text-white" />
          )}
        </button>
      </div>

      {/* State label & helper guidance */}
      <div className="text-center mt-1">
        <p className="text-xs font-bold text-slate-900 tracking-tight">
          {state === "idle" && "Click to ask out loud"}
          {state === "listening" && "Listening... speak clearly"}
          {state === "confirming" && "Review question transcript"}
          {state === "thinking" && "AI is generating mathematical reasoning…"}
          {state === "speaking" && "Tutor is explaining out loud"}
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {state === "idle" && "Zero classmate visibility. No judgment."}
          {state === "listening" && "Click again when you finish speaking."}
        </p>
      </div>
    </div>
  );
}
