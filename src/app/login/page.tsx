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
      <div className="border border-stone-200 bg-white p-8">
        <div className="text-center mb-8 border-b border-stone-200 pb-6">
          <div className="flex justify-center mb-4">
            <Logo height={36} />
          </div>

          <span className="editorial-kicker block mb-1">SSO GATEWAY</span>
          <h1 className="text-2xl font-serif text-stone-950 font-normal">University Authentication</h1>
          <p className="text-xs text-stone-500 font-mono mt-1">
            Access voice reasoning and academic telemetry
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-stone-700 mb-1.5 font-bold">University Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@iitb.ac.in"
              className="w-full rounded-none border border-stone-300 bg-white px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:border-red-600 focus:outline-none transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-stone-700 mb-1.5 font-bold">Full Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Arjun Sharma"
              className="w-full rounded-none border border-stone-300 bg-white px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:border-red-600 focus:outline-none transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-stone-700 mb-1.5 font-bold">Institution</label>
            <div className="relative">
              <select
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full appearance-none rounded-none border border-stone-300 bg-white px-3.5 py-2.5 text-xs text-stone-900 focus:border-red-600 focus:outline-none transition-all font-mono"
              >
                {collegesList.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
              <Building2 className="absolute right-3.5 top-3 h-3.5 w-3.5 text-stone-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-stone-700 mb-1.5 font-bold">Role Selection</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`py-2 text-xs font-mono uppercase tracking-wider border transition-all rounded-none ${
                  role === "student"
                    ? "bg-stone-950 text-white font-bold border-stone-950"
                    : "border-stone-300 bg-white text-stone-600 hover:bg-stone-50"
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole("faculty")}
                className={`py-2 text-xs font-mono uppercase tracking-wider border transition-all rounded-none ${
                  role === "faculty"
                    ? "bg-red-600 text-white font-bold border-red-600"
                    : "border-stone-300 bg-white text-stone-600 hover:bg-stone-50"
                }`}
              >
                Faculty
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="editorial-btn editorial-btn-primary w-full py-2.5 text-xs font-mono uppercase tracking-wider gap-2 mt-2"
          >
            <span>Authenticate Session</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-stone-200 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-stone-500">
            <ShieldCheck className="h-3.5 w-3.5 text-red-600" />
            <span>Zero student identities transmitted to instructors</span>
          </div>

          <div className="mt-4">
            <button
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-stone-400 hover:text-stone-700 transition-colors"
            >
              <span>Quick Sample Personas</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${showDemoAccounts ? "rotate-180" : ""}`} />
            </button>

            {showDemoAccounts && (
              <div className="mt-3 space-y-1.5 text-left">
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleQuickLogin(u)}
                    className="w-full flex items-center justify-between border border-stone-200 bg-stone-50 p-2 text-xs text-stone-700 hover:border-red-600 hover:bg-white transition-all font-mono"
                  >
                    <span>{u.display_name} ({u.college})</span>
                    <span className="text-[10px] uppercase font-bold text-red-600">{u.role}</span>
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
