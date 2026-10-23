import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, FileText } from "lucide-react";

export const metadata = {
  title: "Privacy Policy • TUTO Technologies",
  description: "Zero-Knowledge Telemetry, Audio Ephemerality, and Academic Data Privacy under DPDP Act 2023.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Editorial Dateline & Breadcrumb */}
      <div className="mb-6 flex items-center justify-between border-b border-stone-200 pb-4 font-mono text-[11px] text-stone-500 uppercase tracking-wider">
        <Link href="/" className="inline-flex items-center gap-1.5 hover:text-red-600 transition-colors">
          <ArrowLeft className="h-3 w-3" />
          <span>Index</span>
        </Link>
        <span>DOCUMENT REF: TUTO-SEC-2026-P01</span>
        <span>EFFECTIVE: OCTOBER 2026</span>
      </div>

      {/* Main Editorial Header */}
      <header className="mb-10 space-y-3">
        <span className="font-mono text-[11px] uppercase tracking-widest text-red-600 font-bold">
          Statutory Compliance & Telemetry Governance
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-stone-950 leading-tight">
          Privacy Policy & Cryptographic Anonymity Architecture
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed max-w-2xl">
          TUTO operates under a structural Zero-Knowledge mandate. We collect the minimum technical payload required to verify engineering mathematical derivations while intentionally barring the storage of student identities or biometric voice prints.
        </p>
      </header>

      {/* Structured Policy Sections */}
      <div className="space-y-10 text-stone-800 text-sm leading-relaxed border-t border-stone-200 pt-8">
        {/* Section 1 */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-red-600">01.</span>
            <h2 className="text-lg font-serif font-bold text-stone-900">
              Ephemeral Voice Processing & Audio De-identification
            </h2>
          </div>
          <p className="text-stone-600 pl-7">
            When you speak to the TUTO Voice Tutor, your acoustic microphone stream is processed in temporary browser memory. Real-time automatic speech recognition converts spoken engineering inquiries into mathematical strings (LaTeX format). Raw acoustic WAV/MP3 files are <strong>immediately discarded from memory upon completion of the derivation cycle</strong>. TUTO never constructs, extracts, or trains voiceprint biometric models.
          </p>
          <div className="ml-7 border-l-2 border-red-600 pl-4 py-1 my-3 bg-stone-50 font-mono text-xs text-stone-700">
            Rule: Zero persistence of acoustic recordings. Queries are converted to semantic tokens in RAM and purged.
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-red-600">02.</span>
            <h2 className="text-lg font-serif font-bold text-stone-900">
              The Faculty Confusion Matrix: Blind Aggregation Protocol
            </h2>
          </div>
          <p className="text-stone-600 pl-7">
            Instructors and department faculty receive real-time confusion alerts (e.g. &ldquo;14 students stuck on Nyquist Criterion in ECE 301&rdquo;). Under no circumstances are individual student IDs, roll numbers, IP addresses, or timestamps exposed to university staff. All telemetry passes through an asymmetric anonymization proxy that clusters doubts strictly by syllabus concept tags.
          </p>
          <p className="text-stone-600 pl-7">
            This structural separation guarantees that students can voice fundamental confusion without fear of grading bias or academic reprimand.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-red-600">03.</span>
            <h2 className="text-lg font-serif font-bold text-stone-900">
              Compliance with the Digital Personal Data Protection Act (DPDP 2023)
            </h2>
          </div>
          <p className="text-stone-600 pl-7">
            In accordance with India&apos;s Digital Personal Data Protection (DPDP) Act 2023:
          </p>
          <ul className="list-disc pl-12 space-y-1.5 text-stone-600 text-xs">
            <li><strong>Purpose Limitation:</strong> Telemetry is processed exclusively for conceptual doubt resolution and lecture pacing adjustments.</li>
            <li><strong>Right to Erase:</strong> Any student may delete their personal question history with a single tap in their profile settings.</li>
            <li><strong>Data Fiduciary Duty:</strong> Academic data is hosted within sovereign Indian data regions with AES-256 encryption at rest.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-red-600">04.</span>
            <h2 className="text-lg font-serif font-bold text-stone-900">
              Third-Party Integrations & Academic Security Auditing
            </h2>
          </div>
          <p className="text-stone-600 pl-7">
            TUTO does not sell student data, behavioral telemetry, or university syllabi to commercial advertising brokers. Independent cryptographic audits of our anonymity relay are conducted biannually.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-red-600">05.</span>
            <h2 className="text-lg font-serif font-bold text-stone-900">
              Data Protection Officer Contact
            </h2>
          </div>
          <p className="text-stone-600 pl-7">
            For institutional data queries, faculty audits, or rights enforcement:
          </p>
          <div className="ml-7 p-4 border border-stone-200 bg-white font-mono text-xs space-y-1 text-stone-800">
            <p><strong>OFFICE OF DATA PROTECTION</strong></p>
            <p>TUTO Technologies Academic Research Group</p>
            <p>Email: privacy@tuto.ac.in</p>
            <p>Institutional Dispatch: New Delhi • Bengaluru</p>
          </div>
        </section>
      </div>
    </div>
  );
}
