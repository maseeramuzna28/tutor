"use client";

import React from "react";
import { motion } from "motion/react";
import Image from "next/image";

export interface TutoLoaderProps {
  variant?: "voice" | "page" | "inline" | "academic";
  size?: "sm" | "md" | "lg";
  color?: "indigo" | "amber" | "emerald" | "multi";
  label?: string;
  className?: string;
}

export default function TutoLoader({
  variant = "voice",
  size = "md",
  color = "indigo",
  label,
  className = "",
}: TutoLoaderProps) {
  // Sizing definitions
  const barConfig = {
    sm: { height: "h-4", width: "w-0.5", maxScale: 1.8, minScale: 0.35, gap: "gap-1" },
    md: { height: "h-7", width: "w-1", maxScale: 2.2, minScale: 0.3, gap: "gap-1.5" },
    lg: { height: "h-11", width: "w-1.5", maxScale: 2.5, minScale: 0.25, gap: "gap-2" },
  }[size];

  // Palette definitions (strict adherence to 3-color palette: Electric Indigo, Solar Amber, Fresh Emerald)
  const barColors = {
    indigo: "bg-indigo-600",
    amber: "bg-amber-600",
    emerald: "bg-emerald-600",
    multi: "bg-gradient-to-t from-indigo-600 via-indigo-500 to-amber-500",
  }[color];

  // 1. Acoustic Neural Wave (Primary AI Voice & Thinking Loader)
  if (variant === "voice") {
    // 5 acoustic harmonic bars with balanced sinusoidal phase shifts
    const harmonicDelays = [0, 0.18, 0.36, 0.18, 0];
    const harmonicScales = [
      [0.35, 1.4, 0.35],
      [0.45, 2.0, 0.45],
      [0.6, 2.5, 0.6],
      [0.45, 2.0, 0.45],
      [0.35, 1.4, 0.35],
    ];

    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div className={`flex items-center justify-center ${barConfig.gap} py-2`}>
          {harmonicDelays.map((delay, index) => (
            <motion.span
              key={index}
              animate={{
                scaleY: harmonicScales[index],
                opacity: [0.55, 1, 0.55],
              }}
              transition={{
                duration: 1.1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: delay,
              }}
              className={`rounded-full ${barConfig.width} ${barConfig.height} ${
                index === 2 && color === "multi" ? "bg-amber-500" : barColors
              } origin-center will-change-transform shadow-xs`}
            />
          ))}
        </div>
        {label && (
          <p className="mt-2 text-[11px] font-semibold text-slate-600 tracking-tight flex items-center gap-1.5 animate-pulse">
            <span>{label}</span>
          </p>
        )}
      </div>
    );
  }

  // 2. Inline / Button Spectral Dots (Compact, non-intrusive)
  if (variant === "inline") {
    const dotSizes = {
      sm: "h-1.5 w-1.5",
      md: "h-2 w-2",
      lg: "h-2.5 w-2.5",
    }[size];

    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        {[0, 0.15, 0.3].map((delay, i) => (
          <motion.span
            key={i}
            animate={{
              y: ["0%", "-40%", "0%"],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay,
            }}
            className={`rounded-full ${dotSizes} ${barColors}`}
          />
        ))}
        {label && <span className="ml-1 text-xs text-slate-600 font-medium">{label}</span>}
      </div>
    );
  }

  // 3. Academic Horizon Shimmer (Full-Page & Route Suspense Loader)
  if (variant === "page") {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md ${className}`}>
        {/* Top Viewport Glowing Progress Tracer */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden z-50">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              repeat: Infinity,
              duration: 1.4,
              ease: "easeInOut",
            }}
            className="h-full w-1/2 bg-gradient-to-r from-transparent via-indigo-600 to-amber-500 shadow-[0_0_12px_rgba(79,70,229,0.5)]"
          />
        </div>

        {/* Centered Brand Mark with Breathing Harmonic Wave */}
        <div className="flex flex-col items-center gap-5">
          <motion.div
            animate={{
              scale: [0.98, 1.02, 0.98],
              opacity: [0.9, 1, 0.9],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative flex items-center justify-center"
          >
            <Image
              src="/logo.png"
              alt="TUTO Logo"
              width={110}
              height={50}
              priority
              className="h-9 w-auto object-contain"
            />
          </motion.div>

          {/* Acoustic Wave under logo */}
          <div className="flex items-center gap-1 py-1">
            {[0, 0.16, 0.32, 0.16, 0].map((delay, i) => (
              <motion.span
                key={i}
                animate={{
                  scaleY: [0.4, 1.8, 0.4],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.0,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay,
                }}
                className={`w-1 h-4 rounded-full ${i === 2 ? "bg-amber-500" : "bg-indigo-600"} origin-center`}
              />
            ))}
          </div>

          <div className="text-center">
            <p className="text-xs font-semibold text-slate-800 tracking-tight">
              {label || "Connecting to Academic Intelligence…"}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Zero-knowledge encrypted student channel
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback / academic variant
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        className="h-4 w-4 rounded-full border-2 border-indigo-600 border-t-transparent"
      />
      {label && <span className="text-xs text-slate-600 font-medium">{label}</span>}
    </div>
  );
}
