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
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Brand */}
          <div className="flex items-center gap-8">
            <Logo asLink href="/" height={32} showBadge badgeText="Voice Platform" />

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/60 shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <Link
              href="/notifications"
              className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 shadow-xs"
              title="Notifications"
            >
              <Bell className="h-3.5 w-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-bold text-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Points Balance Chip */}
            <Link
              href="/leaderboard"
              className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/70 px-2.5 py-1 text-xs transition-all hover:bg-amber-100 shadow-xs"
              title="Leaderboard Points"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span className="font-bold text-amber-900">{user.points}</span>
              <span className="text-[10px] text-amber-700 font-medium">pts</span>
            </Link>

            {/* User Profile / Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSwitcherOpen(!switcherOpen)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-left text-xs transition-all hover:bg-slate-50 shadow-xs"
              >
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                    user.role === "faculty"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-indigo-100 text-indigo-800 border border-indigo-200"
                  }`}
                >
                  {user.display_name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="font-semibold text-slate-800 text-xs leading-none">{user.display_name}</p>
                  <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{user.college}</p>
                </div>
                <ChevronDown className="h-3 w-3 text-slate-400" />
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
                            className={`rounded px-1.5 py-0.5 text-[9px] font-medium uppercase ${
                              u.role === "faculty"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-indigo-50 text-indigo-700 border border-indigo-200"
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-around border-t border-slate-200 bg-white/95 backdrop-blur-xl px-2 py-2">
        {navLinks
          .filter((link) => !link.desktopOnly)
          .map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1 px-3 py-1 text-[10px] font-medium transition-all ${
                  isActive ? "text-indigo-600 font-semibold" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                    isActive ? "bg-indigo-50 text-indigo-600 border border-indigo-200/60" : "text-slate-400"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span>{link.label}</span>
              </Link>
            );
          })}
      </nav>
    </>
  );
}
