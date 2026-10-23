"use client";

import { useRef, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import TutoLoader from "@/components/TutoLoader";

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
          <div className="absolute h-32 w-32 border border-red-500/40 animate-ping" />
        )}

        {/* Main Mic Button */}
        <button
          onClick={toggleMic}
          disabled={state === "thinking" || state === "speaking"}
          className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-xs transition-all duration-150 cursor-pointer ${
            state === "listening"
              ? "bg-red-600 text-white border-2 border-red-700 shadow-md"
              : state === "thinking"
              ? "bg-neutral-100 text-neutral-900 border-2 border-neutral-300 cursor-wait"
              : state === "speaking"
              ? "bg-neutral-950 text-white border-2 border-red-600 shadow-md"
              : "bg-neutral-950 text-white border border-neutral-900 hover:bg-red-600 hover:border-red-600"
          }`}
          aria-label="Voice Tutor Microphone"
        >
          {state === "listening" ? (
            <div className="flex flex-col items-center">
              <MicOff className="h-6 w-6 text-white" />
              <span className="text-[10px] font-mono font-bold tracking-widest text-white mt-1">STOP</span>
            </div>
          ) : state === "thinking" ? (
            <TutoLoader variant="voice" size="sm" color="red" />
          ) : state === "speaking" ? (
            <div className="flex items-center gap-1">
              <span className="h-4 w-1 bg-red-500 rounded-none animate-bounce [animation-delay:-0.3s]" />
              <span className="h-6 w-1 bg-white rounded-none animate-bounce [animation-delay:-0.15s]" />
              <span className="h-4 w-1 bg-red-500 rounded-none animate-bounce" />
            </div>
          ) : (
            <Mic className="h-7 w-7 text-white" />
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
