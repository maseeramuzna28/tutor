"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { User, UserRole } from "@/lib/types";
import {
  ArrowRight,
  ShieldCheck,
  Building2,
  ChevronDown,
} from "lucide-react";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const allUsers = apiClient.getAllUsers();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [college, setCollege] = useState("IIT Bombay");
  const [displayName, setDisplayName] = useState("");
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const collegesList = [
    "IIT Bombay",
    "IIT Madras",
    "IIT Delhi",
    "NIT Trichy",
    "BITS Pilani",
    "DTU Delhi",
    "Anna University",
  ];

  const handleQuickLogin = (u: User) => {
    apiClient.setCurrentUser(u);
    if (u.role === "faculty") {
      router.push("/faculty");
    } else {
      router.push("/tutor");
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const name = displayName.trim() || email.split("@")[0] || "University Student";

    const newUser: User = {
      id: `usr_${Date.now()}`,
      display_name: name,
      role,
      college,
      points: 50,
    };

    apiClient.setCurrentUser(newUser);
    if (role === "faculty") {
      router.push("/faculty");
    } else {
      router.push("/tutor");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 mb-16 md:mb-0">
      <div className="craft-panel p-8 shadow-lg">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo height={42} />
          </div>

          <h1 className="text-xl font-bold tracking-tight text-slate-900">Welcome to TUTO</h1>
          <p className="text-xs text-slate-500 mt-1">
            Sign in with your university credentials
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">University Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@iitb.ac.in"
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-all shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Arjun Sharma"
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-all shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Institution</label>
            <div className="relative">
              <select
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none transition-all shadow-xs"
              >
                {collegesList.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
              <Building2 className="absolute right-3.5 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`rounded-lg py-2 text-xs font-semibold border transition-all ${
                  role === "student"
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole("faculty")}
                className={`rounded-lg py-2 text-xs font-semibold border transition-all ${
                  role === "faculty"
                    ? "bg-amber-50 border-amber-300 text-amber-800 shadow-xs"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Instructor / Faculty
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="evil-btn evil-btn-primary w-full py-2.5 text-xs font-semibold gap-2 mt-2"
          >
            <span>Continue to Platform</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
            <span>Zero personal identification sent to faculty</span>
          </div>

          <div className="mt-4">
            <button
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors"
            >
              <span>Sample Profiles</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${showDemoAccounts ? "rotate-180" : ""}`} />
            </button>

            {showDemoAccounts && (
              <div className="mt-3 space-y-1.5 text-left cube-enter">
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleQuickLogin(u)}
                    className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 transition-all"
                  >
                    <span className="font-medium">{u.display_name} ({u.college})</span>
                    <span className="text-[10px] uppercase font-bold text-slate-500">{u.role}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
