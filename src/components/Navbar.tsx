"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { User } from "@/lib/types";
import Logo from "@/components/Logo";
import {
  Mic,
  MessageSquare,
  Activity,
  FolderGit2,
  BookOpen,
  Award,
  Bell,
  Sparkles,
  ChevronDown,
  User as UserIcon,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User>(apiClient.getCurrentUser());
  const [unreadCount, setUnreadCount] = useState(0);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const allUsers = apiClient.getAllUsers();

  useEffect(() => {
    setUser(apiClient.getCurrentUser());
    apiClient.getNotifications().then((notifs) => {
      setUnreadCount(notifs.filter((n) => n.status === "unread").length);
    });
  }, [pathname]);

  const handleSwitchUser = (selectedUser: User) => {
    apiClient.setCurrentUser(selectedUser);
    setUser(selectedUser);
    setSwitcherOpen(false);
    window.location.reload();
  };

  const navLinks = [
    { href: "/tutor", label: "AI Tutor", icon: Mic },
    { href: "/feed", label: "Doubts Feed", icon: MessageSquare },
    { href: "/projects", label: "Projects", icon: FolderGit2 },
    ...(user.role === "faculty"
      ? [
          {
            href: "/faculty",
            label: "Faculty Pulse",
            icon: Activity,
          },
        ]
      : []),
    { href: "/leaderboard", label: "Leaderboard", icon: Award, desktopOnly: true },
    { href: "/curriculum", label: "Curriculum", icon: BookOpen, desktopOnly: true },
    { href: "/profile", label: "Profile", icon: UserIcon },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
          {/* Brand */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <Logo asLink href="/" height={28} showBadge={false} />
              <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-stone-200 font-mono text-[10px] uppercase tracking-wider text-stone-500">
                <span className="h-1.5 w-1.5 bg-red-600 inline-block animate-pulse" />
                <span>Academic Audio Telemetry</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all rounded-none ${
                      isActive
                        ? "bg-stone-950 text-white font-bold border border-stone-950"
                        : "text-stone-600 hover:text-red-600 hover:bg-stone-50 border border-transparent"
                    }`}
                  >
                    <Icon className={`h-3 w-3 ${isActive ? "text-red-500" : "text-stone-400"}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            {/* Notification Bell */}
            <Link
              href="/notifications"
              className="relative flex h-8 w-8 items-center justify-center rounded-none border border-stone-200 bg-white text-stone-700 transition-all hover:border-stone-900 hover:text-stone-950"
              title="Notifications"
            >
              <Bell className="h-3.5 w-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-none bg-red-600 px-1 text-[9px] font-mono font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Points Balance Chip */}
            <Link
              href="/leaderboard"
              className="flex items-center gap-1.5 rounded-none border border-stone-300 bg-stone-50 px-2.5 py-1 text-xs font-mono transition-all hover:border-red-600"
              title="Academic Credits"
            >
              <span className="text-[10px] text-stone-500 uppercase tracking-widest font-semibold">PTS</span>
              <span className="font-bold text-stone-900">{user.points}</span>
            </Link>

            {/* User Profile / Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSwitcherOpen(!switcherOpen)}
                className="flex items-center gap-2 rounded-none border border-stone-300 bg-white px-2.5 py-1 text-left text-xs transition-all hover:border-stone-900"
              >
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-none text-[10px] font-mono font-bold ${
                    user.role === "faculty"
                      ? "bg-red-600 text-white"
                      : "bg-stone-900 text-white"
                  }`}
                >
                  {user.display_name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="font-mono font-bold text-stone-900 text-xs leading-none">{user.display_name}</p>
                  <p className="text-[9px] font-mono text-stone-500 uppercase leading-tight mt-0.5">{user.college}</p>
                </div>
                <ChevronDown className="h-3 w-3 text-stone-400" />
              </button>

              {switcherOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 cube-enter">
                  <div className="px-2.5 py-2 border-b border-slate-100 mb-1">
                    <p className="text-[11px] font-semibold text-slate-900">Active Profile</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Switch student or instructor view</p>
                  </div>
                  <div className="space-y-0.5">
                    {allUsers.map((u) => {
                      const isCurrent = u.id === user.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => handleSwitchUser(u)}
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-all ${
                            isCurrent
                              ? "bg-indigo-50 text-indigo-700 font-semibold"
                              : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <div>
                            <p className="text-xs">{u.display_name}</p>
                            <p className="text-[10px] text-slate-400">{u.college}</p>
                          </div>
                          <span
                            className={`rounded-none px-1.5 py-0.5 text-[9px] font-mono uppercase ${
                              u.role === "faculty"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-stone-100 text-stone-700 border border-stone-300"
                            }`}
                          >
                            {u.role}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around border-t border-stone-200 bg-white/95 backdrop-blur-md px-2 py-1.5">
        {navLinks
          .filter((link) => !link.desktopOnly)
          .map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[9px] font-mono uppercase tracking-wider transition-all ${
                  isActive ? "text-red-600 font-bold" : "text-stone-500 hover:text-stone-900"
                }`}
              >
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-none transition-all ${
                    isActive ? "bg-red-50 text-red-600 border border-red-200" : "text-stone-400"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span>{link.label}</span>
              </Link>
            );
          })}
      </nav>
    </>
  );
}
