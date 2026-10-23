"use client";

import { useEffect, useRef } from "react";

export default function HeroTelemetryCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Mouse coordinates (normalized and pixel)
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      active: false,
    };

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    let time = 0;

    const render = () => {
      time += 0.015;

      // Smooth mouse lerp
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;
      } else {
        mouse.x += (-1000 - mouse.x) * 0.05;
        mouse.y += (-1000 - mouse.y) * 0.05;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Architectural Mathematical Grid
      const gridSize = 48;
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(41, 37, 36, 0.45)"; // stone-800 subtle hairline

      ctx.beginPath();
      for (let x = 0; x <= width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // 2. Draw Precision Coordinate Crosshairs at intersections
      const crossSize = 3;
      ctx.strokeStyle = "rgba(120, 113, 108, 0.28)"; // stone-500 tick marks
      ctx.beginPath();
      for (let x = gridSize; x < width; x += gridSize * 2) {
        for (let y = gridSize; y < height; y += gridSize * 2) {
          ctx.moveTo(x - crossSize, y);
          ctx.lineTo(x + crossSize, y);
          ctx.moveTo(x, y - crossSize);
          ctx.lineTo(x, y + crossSize);
        }
      }
      ctx.stroke();

      // 3. Audio Fourier Waveforms (Primary & Secondary Harmonics)
      const centerY = height * 0.58;

      // Harmonic 1: Deep Crimson Fourier Fundamental
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(220, 38, 38, 0.38)"; // crimson red
      for (let x = 0; x <= width; x += 3) {
        const distToMouse = Math.hypot(x - mouse.x, centerY - mouse.y);
        const mouseDeflection = mouse.active && distToMouse < 220
          ? Math.cos((distToMouse / 220) * (Math.PI / 2)) * 32
          : 0;

        const y =
          centerY +
          Math.sin(x * 0.007 + time * 1.6) * 36 +
          Math.cos(x * 0.003 - time * 0.9) * 18 +
          Math.sin(x * 0.015 + time * 2.4) * 8 -
          mouseDeflection;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Harmonic 2: Higher Frequency Resonance / Phase shifted
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(185, 28, 28, 0.22)"; // stone/crimson secondary
      for (let x = 0; x <= width; x += 4) {
        const distToMouse = Math.hypot(x - mouse.x, centerY - mouse.y);
        const mouseDeflection = mouse.active && distToMouse < 180
          ? Math.sin((distToMouse / 180) * Math.PI) * 20
          : 0;

        const y =
          centerY +
          Math.sin(x * 0.011 - time * 2.1) * 22 +
          Math.cos(x * 0.006 + time * 1.4) * 14 +
          mouseDeflection;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 4. Subtle Cursor Telemetry HUD
      if (mouse.active && mouse.x > 0 && mouse.x < width && mouse.y > 0 && mouse.y < height) {
        // Subtle tracking ring
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 18, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Crosshairs
        ctx.beginPath();
        ctx.moveTo(mouse.x - 26, mouse.y);
        ctx.lineTo(mouse.x + 26, mouse.y);
        ctx.moveTo(mouse.x, mouse.y - 26);
        ctx.lineTo(mouse.x, mouse.y + 26);
        ctx.strokeStyle = "rgba(239, 68, 68, 0.25)";
        ctx.stroke();

        // Telemetry Coordinates
        ctx.font = "9px monospace";
        ctx.fillStyle = "rgba(248, 113, 113, 0.75)";
        const coordText = `f₀: ${(440 + Math.sin(time) * 12).toFixed(1)}Hz | [${Math.floor(mouse.x)}, ${Math.floor(mouse.y)}]`;
        ctx.fillText(coordText, mouse.x + 12, mouse.y - 12);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (canvas) {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-auto">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: "100%", height: "100%" }}
      />
      {/* Subtle radial falloff to keep center text readability high */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(12,10,9,0.85)_85%,rgba(12,10,9,0.98)_100%)] pointer-events-none" />
    </div>
  );
}
