"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Mic,
  ArrowRight,
  ShieldCheck,
  Building2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [college, setCollege] = useState("IIT Bombay");
  const [displayName, setDisplayName] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const collegesList = [
    "IIT Bombay",
    "IIT Madras",
    "IIT Delhi",
    "NIT Trichy",
    "BITS Pilani",
    "DTU Delhi",
    "Anna University",
  ];

  useEffect(() => {
    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Supabase authentication is unavailable.");
      return () => {};
    }
    let active = true;

    const redirectAuthenticatedUser = async () => {
      try {
        const response = await fetch("/api/me/points", { cache: "no-store" });
        const profile = response.ok
          ? await response.json() as { role?: unknown }
          : null;
        if (active) {
          router.replace(profile?.role === "faculty" ? "/faculty" : "/tutor");
        }
      } catch {
        if (active) router.replace("/tutor");
      }
    };

    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setErrorMessage(error.message);
      } else if (data.session) {
        void redirectAuthenticatedUser();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        window.setTimeout(() => void redirectAuthenticatedUser(), 0);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSending(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const name = displayName.trim() || email.trim().split("@")[0] || "Tuto Student";
      const { error } = await createClient().auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          shouldCreateUser: true,
          data: {
            display_name: name,
            college,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setMessage("Check your email for a secure sign-in link. Your account role is managed by TUTO administrators.");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to start sign-in. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 mb-16 md:mb-0">
      <div className="craft-panel p-8 shadow-lg">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 mb-3 shadow-xs">
            <Mic className="h-5 w-5" />
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

          <p className="text-[11px] leading-relaxed text-slate-500">
            Faculty access is assigned by an administrator and cannot be selected during sign-in.
          </p>

          <button
            type="submit"
            disabled={isSending}
            className="evil-btn evil-btn-primary w-full py-2.5 text-xs font-semibold gap-2 mt-2 disabled:cursor-wait disabled:opacity-60"
          >
            <span>{isSending ? "Sending sign-in link..." : "Email me a secure sign-in link"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        {message && (
          <p role="status" className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            {message}
          </p>
        )}
        {errorMessage && (
          <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {errorMessage}
          </p>
        )}

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
            <span>Zero personal identification sent to faculty</span>
          </div>
        </div>
      </div>
    </div>
  );
}
