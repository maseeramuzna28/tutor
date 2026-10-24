"use client";

import { useEffect, useRef } from "react";

const CELL = 48;

export default function GridBackground({ tone = "light" }: { tone?: "light" | "dark" }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const host = wrap ? wrap.parentElement : null;
    if (!wrap || !canvas || !host) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reduce || !fine) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const color = tone === "dark" ? "255,92,108" : "200,16,46";
    const cells = new Map<string, number>();
    let w = 0,
      h = 0,
      raf = 0;
    let gx = -999,
      gy = -999,
      tx = -999,
      ty = -999;

    const resize = () => {
      const r = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      for (const [key, a] of cells) {
        const [cx, cy] = key.split(",").map(Number);
        ctx.fillStyle = `rgba(${color},${(a * 0.16).toFixed(3)})`;
        ctx.fillRect(cx * CELL + 1, cy * CELL + 1, CELL - 1, CELL - 1);
        const next = a - 0.025;
        if (next <= 0) cells.delete(key);
        else cells.set(key, next);
      }
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      wrap.style.setProperty("--gx", `${gx.toFixed(1)}px`);
      wrap.style.setProperty("--gy", `${gy.toFixed(1)}px`);
      const settled = cells.size === 0 && Math.abs(tx - gx) < 0.5 && Math.abs(ty - gy) < 0.5;
      raf = settled ? 0 : requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      cells.set(`${Math.floor(x / CELL)},${Math.floor(y / CELL)}`, 1);
      tx = x;
      ty = y;
      if (gx < -900) {
        gx = x;
        gy = y;
      }
      if (!raf) raf = requestAnimationFrame(frame);
    };

    host.addEventListener("pointermove", onMove);
    return () => {
      host.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [tone]);

  return (
    <div className="gridbg" ref={wrapRef} aria-hidden="true">
      <canvas ref={canvasRef} />
      <span className="gridbg__glow" />
    </div>
  );
}
