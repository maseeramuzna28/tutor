"use client";

import React, { useEffect, useMemo, useRef } from "react";
import RevealText from "../ui/RevealText";
import "./Wall3D.css";

const COL_GAP = 350;
const ROW_GAP = 270;
const CARD_W = 290;
const Y_OFFSETS = [-60, 60, -20, 80, -40, 50];
const Z_PATTERN = [0, -70, 30, -40];
const MOUSE_EASE = 0.06; // lower = slower, smoother camera

function seeded(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export interface WallItemBase {
  id: string | number;
  [key: string]: any;
}

export interface WallCardLayout extends WallItemBase {
  index: number;
  x: number;
  y: number;
  z: number;
  rz: number;
  ry: number;
  depth: number;
  opacity: number;
}

function buildLayout<T extends WallItemBase>(items: T[], cols: number): WallCardLayout[] {
  const rows = Math.ceil(items.length / cols);
  const mid = (cols - 1) / 2;
  return items.map((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const dist = Math.abs(col - mid);
    const z = 120 - dist * 110 + Z_PATTERN[i % Z_PATTERN.length];
    return {
      ...item,
      index: i,
      x: Math.round((col - mid) * COL_GAP),
      y: Math.round(
        Y_OFFSETS[col % Y_OFFSETS.length] +
          (row - (rows - 1) / 2) * ROW_GAP +
          (seeded(i + 3) - 0.5) * 30
      ),
      z: Math.round(z),
      rz: Number(((seeded(i + 11) - 0.5) * 6).toFixed(2)),
      ry: Number(((col - mid) * -2.5).toFixed(2)),
      depth: Number(clamp((z + 220) / 340, 0.2, 1.2).toFixed(3)),
      opacity: Number((1 - dist * 0.12).toFixed(2)),
    };
  });
}

interface Wall3DProps<T extends WallItemBase> {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  items: T[];
  renderCard: (card: WallCardLayout) => React.ReactNode;
  cols?: number;
}

export default function Wall3D<T extends WallItemBase>({
  id,
  eyebrow,
  title,
  subtitle,
  items,
  renderCard,
  cols = 4,
}: Wall3DProps<T>) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLUListElement>(null);
  const layout = useMemo(() => buildLayout(items, cols), [items, cols]);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const world = worldRef.current;
    if (!section || !stage || !world) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const designWidth = ((cols - 1) * COL_GAP + CARD_W) * 1.04;

    const resize = () => {
      world.style.setProperty("--scale", clamp(stage.clientWidth / designWidth, 0.8, 1.15).toFixed(3));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);

    if (reduce) {
      section.classList.add("is-in");
      return () => ro.disconnect();
    }

    let tx = 0,
      ty = 0,
      cx = 0,
      cy = 0,
      raf = 0,
      visible = false;

    const tick = () => {
      cx += (tx - cx) * MOUSE_EASE;
      cy += (ty - cy) * MOUSE_EASE;
      world.style.setProperty("--mx", cx.toFixed(4));
      world.style.setProperty("--my", cy.toFixed(4));
      raf = visible ? requestAnimationFrame(tick) : 0;
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          section.classList.add("is-in");
          if (!raf) raf = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.15 }
    );
    io.observe(section);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = stage.getBoundingClientRect();
      tx = clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1);
      ty = clamp(((e.clientY - r.top) / r.height - 0.5) * 2, -1, 1);
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
    };
    const onScroll = () => {
      const r = stage.getBoundingClientRect();
      ty = clamp(((r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight) * 1.2, -1, 1);
      tx = Math.sin(window.scrollY / 260) * 0.6;
    };

    if (touch) {
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    } else {
      section.addEventListener("pointermove", onMove);
      section.addEventListener("pointerleave", onLeave);
    }

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
    };
  }, [cols]);

  return (
    <section className="w3d" id={id} ref={sectionRef} aria-labelledby={`${id}-title`}>
      <header className="w3d__head">
        <p className="eyebrow">{eyebrow}</p>
        <RevealText as="h2" id={`${id}-title`} className="w3d__title" text={title} />
        {subtitle && <p className="w3d__sub">{subtitle}</p>}
      </header>

      <div className="w3d__stage" ref={stageRef}>
        <ul className="w3d__world" ref={worldRef}>
          {layout.map((c) => (
            <li
              key={c.id}
              className="w3d__slot"
              style={{
                ["--x" as any]: c.x,
                ["--y" as any]: c.y,
                ["--z" as any]: c.z,
                ["--ry" as any]: c.ry,
                ["--rz" as any]: c.rz,
                ["--depth" as any]: c.depth,
                ["--i" as any]: c.index,
                ["--o" as any]: c.opacity,
              }}
            >
              <div className="w3d__enter">
                <div className="w3d__float">{renderCard(c)}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
