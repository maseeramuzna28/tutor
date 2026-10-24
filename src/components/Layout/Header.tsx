"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Close, ArrowRight } from "../Icons";

const links = [
  { to: "/#students", label: "Students" },
  { to: "/#faculty", label: "Faculty" },
  { to: "/#platform", label: "Platform" },
  { to: "/#planned", label: "Planned" },
  { to: "/app", label: "App preview" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // App shell has its own sticky topbar inside /app routes
  if (pathname?.startsWith("/app")) return null;

  return (
    <header className="site-header">
      <div className="container site-header__bar">
        <Link href="/" className="wordmark" aria-label="TUTO home">
          TUTO<span className="wordmark__mark" aria-hidden="true" />
        </Link>

        <nav
          id="site-nav"
          className={`site-nav${open ? " is-open" : ""}`}
          aria-label="Primary"
        >
          <ul className="site-nav__list">
            {links.map((l) => (
              <li key={l.to}>
                <Link className="site-nav__link" href={l.to}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="site-nav__actions">
            <Link className="site-nav__link" href="/login">
              Sign in
            </Link>
            <Link className="btn btn--primary btn--sm" href="/signup">
              <span>Get started</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </nav>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="visually-hidden">
            {open ? "Close menu" : "Open menu"}
          </span>
          {open ? <Close /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
