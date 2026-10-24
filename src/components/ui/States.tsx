"use client";

import React from "react";
import { env } from "@/config/env";

export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="state" role="status">
      <span className="state__bar" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
}: {
  error: Error | { message?: string } | null;
  onRetry?: () => void;
}) {
  return (
    <div className="state state--error" role="alert">
      <p>Something went wrong. {error && error.message ? error.message : ""}</p>
      {onRetry && (
        <button type="button" className="btn btn--sm" onClick={() => onRetry()}>
          Try again
        </button>
      )}
    </div>
  );
}

export function Empty({ title, text }: { title: string; text?: string }) {
  return (
    <div className="state">
      <p className="state__title">{title}</p>
      {text && <p>{text}</p>}
    </div>
  );
}

export function DemoNote() {
  if (!env.useMock) return null;
  return (
    <p className="demo-note">
      Demo data. Every page here uses sample content until the backend is connected.
    </p>
  );
}

export function AccessNote({ needs }: { needs: string }) {
  return (
    <div className="app-body">
      <div className="state state--error" role="alert">
        <p className="state__title">This area is for {needs} accounts.</p>
        <p>
          In this preview, change the demo role in the top bar. Real access control will
          come from the backend.
        </p>
      </div>
    </div>
  );
}
