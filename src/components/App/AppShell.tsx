"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRole, Role } from "@/context/RoleContext";
import { notifications } from "@/services";
import { DemoNote } from "../ui/States";
import { Menu, Close } from "../Icons";

interface NavItem {
  to: string;
  label: string;
  planned?: boolean;
}

const GROUPS: Record<"student" | "faculty" | "shared", NavItem[]> = {
  student: [
    { to: "/app/dashboard", label: "Dashboard" },
    { to: "/app/tutor", label: "AI Tutor" },
    { to: "/app/notebook", label: "Smart Notebook" },
    { to: "/app/community", label: "Community" },
    { to: "/app/projects", label: "College Projects" },
    { to: "/app/confusion", label: "Confusion Map" },
    { to: "/app/concepts", label: "Concept Clusters" },
    { to: "/app/lessons", label: "Micro Lessons" },
    { to: "/app/rewards", label: "Points and Leaderboards" },
  ],
  faculty: [
    { to: "/app/faculty", label: "Faculty Dashboard" },
    { to: "/app/outcomes", label: "Outcome Dashboard" },
    { to: "/app/curriculum", label: "Curriculum Updates" },
  ],
  shared: [
    { to: "/app/notifications", label: "Notifications" },
    { to: "/app/profile", label: "My Profile" },
    { to: "/app/lectures", label: "Live Lectures", planned: true },
  ],
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { role, setRole } = useRole();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    let alive = true;
    const load = () =>
      notifications
        .list(role)
        .then((list) => {
          if (alive) setUnread(list.filter((n) => !n.read).length);
        })
        .catch(() => {});
    load();
    window.addEventListener("tuto:notifications-changed", load);
    return () => {
      alive = false;
      window.removeEventListener("tuto:notifications-changed", load);
    };
  }, [role]);

  const switchRole = (next: Role) => {
    setRole(next);
    router.push(next === "faculty" ? "/app/faculty" : "/app/dashboard");
  };

  const sections = [
    {
      title: role === "faculty" ? "Faculty area" : "Student area",
      items: GROUPS[role],
    },
    { title: "Shared", items: GROUPS.shared },
  ];

  return (
    <div className="app">
      {open && (
        <button
          type="button"
          className="scrim"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`side${open ? " is-open" : ""}`} aria-label="App navigation">
        <Link href="/" className="wordmark" aria-label="TUTO home">
          TUTO<span className="wordmark__mark" aria-hidden="true" />
        </Link>
        {sections.map((g) => (
          <nav key={g.title} className="side__group" aria-label={g.title}>
            <h2>{g.title}</h2>
            <ul className="side__list">
              {g.items.map((item) => {
                const isActive = pathname === item.to;
                return (
                  <li key={item.to}>
                    <Link
                      href={item.to}
                      className={`side__link${isActive ? " active" : ""}`}
                      data-planned={item.planned ? "true" : "false"}
                    >
                      {item.label}
                      {item.planned && <span className="side__tag">Planned</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        ))}
      </aside>

      <div className="app__main">
        <div className="topbar">
          <button
            type="button"
            className="topbar__menu"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <Close /> : <Menu />}
          </button>
          <div className="topbar__right">
            <span className="seg__label">Demo role</span>
            <div className="seg" role="group" aria-label="Demo role">
              <button
                type="button"
                aria-pressed={role === "student"}
                onClick={() => switchRole("student")}
              >
                Student
              </button>
              <button
                type="button"
                aria-pressed={role === "faculty"}
                onClick={() => switchRole("faculty")}
              >
                Faculty
              </button>
            </div>
            <Link href="/app/notifications" className="notif-link">
              Notifications
              {unread > 0 && (
                <span className="count" aria-label={`${unread} unread`}>
                  {unread}
                </span>
              )}
            </Link>
          </div>
        </div>
        <DemoNote />
        <main id="main" key={pathname} className="page">
          {children}
        </main>
      </div>
    </div>
  );
}
