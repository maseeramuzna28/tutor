"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/services";
import GridBackground from "@/components/ui/GridBackground";
import RevealText from "@/components/ui/RevealText";
import { ArrowRight } from "@/components/Icons";

const COPY = {
  login: {
    eyebrow: "Sign in",
    title: "Welcome *back.*",
    cta: "Sign in",
    altText: "New to TUTO?",
    altTo: "/signup",
    altLabel: "Create an account",
  },
  signup: {
    eyebrow: "Create an account",
    title: "Start with your *account.*",
    cta: "Create account",
    altText: "Already have an account?",
    altTo: "/login",
    altLabel: "Sign in",
  },
};

// Declared outside AuthPageView to prevent unmounting and focus loss on keystrokes
function Field({
  id,
  label,
  type = "text",
  autoComplete,
  value,
  onChange,
  error,
  children,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  value?: string;
  onChange?: (e: any) => void;
  error?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="field" data-invalid={error ? "true" : "false"}>
      <label htmlFor={id}>{label}</label>
      {children || (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-err` : undefined}
        />
      )}
      {error && (
        <span className="field__error" id={`${id}-err`}>
          {error}
        </span>
      )}
    </div>
  );
}

export default function AuthPageView({ mode }: { mode: "login" | "signup" }) {
  const c = COPY[mode];
  const router = useRouter();
  const [v, setV] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    college: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "notice" | "error">("idle");
  const [message, setMessage] = useState("");

  const set = (k: string) => (e: any) =>
    setV((s) => ({ ...s, [k]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === "signup" && v.name.trim().length < 2)
      e.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(v.email))
      e.email = "Enter a valid email address.";
    if (mode === "signup" && v.password.length < 8)
      e.password = "Use at least 8 characters.";
    if (mode === "login" && !v.password)
      e.password = "Enter your password.";
    return e;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setStatus("loading");
    setMessage("");
    try {
      const res =
        mode === "login"
          ? await auth.login({ email: v.email, password: v.password })
          : await auth.signup(v);
      if (res && res.connected === false) {
        setStatus("notice");
        setMessage(
          "Accounts are not connected yet. This form will work once the backend is connected. Nothing you typed was sent or saved."
        );
      } else {
        router.push("/app");
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  };

  return (
    <section className="auth">
      <div className="auth__intro has-grid">
        <GridBackground />
        <p className="eyebrow">{c.eyebrow}</p>
        <RevealText as="h1" className="auth__title" text={c.title} />
        <p className="phead__lead">
          Ask questions, see where the class is stuck, and teach to the gaps.
        </p>
      </div>

      <form className="auth__form form" onSubmit={submit} noValidate>
        {mode === "signup" && (
          <Field
            id="name"
            label="Full name"
            autoComplete="name"
            value={v.name}
            onChange={set("name")}
            error={errors.name}
          />
        )}
        <Field
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={v.email}
          onChange={set("email")}
          error={errors.email}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={v.password}
          onChange={set("password")}
          error={errors.password}
        />
        {mode === "signup" && (
          <>
            <Field id="role" label="I am a">
              <select id="role" value={v.role} onChange={set("role")}>
                <option value="student">Student</option>
                <option value="faculty">Faculty member</option>
              </select>
            </Field>
            <Field
              id="college"
              label="College"
              autoComplete="organization"
              value={v.college}
              onChange={set("college")}
              error={errors.college}
            />
          </>
        )}

        {status === "notice" && (
          <p className="notice notice--ok" role="status">
            {message}
          </p>
        )}
        {status === "error" && (
          <p className="notice notice--error" role="alert">
            {message}
          </p>
        )}

        <button className="btn btn--primary" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Please wait" : c.cta} <ArrowRight />
        </button>
        <p className="meta">
          {c.altText} <Link href={c.altTo}>{c.altLabel}</Link>. Or{" "}
          <Link href="/app">preview the app with demo data</Link>.
        </p>
        {mode === "signup" && (
          <p className="meta">
            By creating an account you agree to the{" "}
            <Link href="/terms" className="underline">Terms and Conditions</Link> and the{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        )}
      </form>
    </section>
  );
}
