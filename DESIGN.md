---
version: 2.0.0
name: TUTO-bright-3color-system
description: |
  A luminous, modern university developer-platform design system inspired by Stripe and Wise.
  Built on a bright, crisp canvas (#f8fafc -> #ffffff), pure white card surfaces,
  slate ink typography (#0f172a / #475569), and an authoritative 3-color palette:
  1. Electric Indigo (#4f46e5) - Primary AI voice signal & platform actions
  2. Solar Amber (#d97706) - Confusion telemetry, spikes, and academic credits
  3. Fresh Emerald (#059669) - Verified staff solutions & anonymity protection

colors:
  canvas-base: "#f8fafc"
  canvas-surface: "#ffffff"
  canvas-surface-hover: "#f1f5f9"
  
  border-hairline: "#e2e8f0"
  border-hairline-hover: "#cbd5e1"
  border-hairline-bright: "#94a3b8"
  
  text-primary: "#0f172a"
  text-secondary: "#475569"
  text-tertiary: "#64748b"
  
  palette:
    color-1-indigo: "#4f46e5"
    color-1-soft: "rgba(79, 70, 229, 0.08)"
    color-1-border: "rgba(79, 70, 229, 0.20)"
    
    color-2-amber: "#d97706"
    color-2-soft: "rgba(217, 119, 6, 0.08)"
    color-2-border: "rgba(217, 119, 6, 0.20)"
    
    color-3-emerald: "#059669"
    color-3-soft: "rgba(5, 150, 105, 0.08)"
    color-3-border: "rgba(5, 150, 105, 0.20)"

typography:
  display-hero:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif"
    fontSize: 56px
    fontWeight: 700
    letterSpacing: "-0.03em"
    lineHeight: 1.08
  card-title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif"
    fontSize: 16px
    fontWeight: 700
    letterSpacing: "-0.015em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', sans-serif"
    fontSize: 13px
    lineHeight: 1.5
    color: "#475569"
  badge:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif"
    fontSize: 11px
    fontWeight: 600

components:
  panel:
    background: "#ffffff"
    border: "1px solid #e2e8f0"
    borderRadius: "14px"
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.04)"
  button-primary:
    background: "#4f46e5"
    color: "#ffffff"
    borderRadius: "10px"
    fontWeight: 600
  button-secondary:
    background: "#ffffff"
    border: "1px solid #e2e8f0"
    color: "#0f172a"
    borderRadius: "10px"
