"use client";

import React from "react";

export interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  idPrefix?: string;
}

export default function Tabs({
  tabs,
  value,
  onChange,
  label,
  idPrefix = "tab",
}: TabsProps) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          id={`${idPrefix}-${t.id}`}
          aria-selected={value === t.id}
          aria-controls={`${idPrefix}-panel-${t.id}`}
          className="tabs__tab"
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function TabPanel({
  id,
  value,
  idPrefix = "tab",
  children,
}: {
  id: string;
  value: string;
  idPrefix?: string;
  children: React.ReactNode;
}) {
  if (value !== id) return null;
  return (
    <div
      role="tabpanel"
      id={`${idPrefix}-panel-${id}`}
      aria-labelledby={`${idPrefix}-${id}`}
    >
      {children}
    </div>
  );
}
