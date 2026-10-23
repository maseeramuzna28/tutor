import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms & Academic Conduct • TUTO Technologies",
  description: "Terms of Service, Academic Integrity Protocols, and Institutional License for TUTO.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Editorial Dateline & Breadcrumb */}
      <div className="mb-6 flex items-center justify-between border-b border-stone-200 pb-4 font-mono text-[11px] text-stone-500 uppercase tracking-wider">
        <Link href="/" className="inline-flex items-center gap-1.5 hover:text-red-600 transition-colors">
          <ArrowLeft className="h-3 w-3" />
          <span>Index</span>
        </Link>
        <span>DOCUMENT REF: TUTO-LEGAL-2026-T01</span>
        <span>VERSION: 2.4</span>
      </div>

      {/* Main Editorial Header */}
      <header className="mb-10 space-y-3">
        <span className="font-mono text-[11px] uppercase tracking-widest text-red-600 font-bold">
          Institutional Governance & Academic Integrity
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-stone-950 leading-tight">
          Terms of Service & Code of Academic Conduct
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed max-w-2xl">
          By accessing the TUTO platform, students, researchers, and teaching faculty agree to uphold rigorous standards of academic honesty, intellectual collaboration, and responsible voice query generation.
        </p>
      </header>

      {/* Structured Terms Sections */}
      <div className="space-y-10 text-stone-800 text-sm leading-relaxed border-t border-stone-200 pt-8">
        {/* Section 1 */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-red-600">01.</span>
            <h2 className="text-lg font-serif font-bold text-stone-900">
              Authorized Educational Usage
            </h2>
          </div>
          <p className="text-stone-600 pl-7">
            TUTO is engineered as an auxiliary mathematical and conceptual reasoning engine. The platform must be used to clarify lecture materials, deconstruct algorithmic proofs, and practice derivations. The platform may not be deployed during closed-book proctored examinations or synchronized competitive evaluations where voice synthesis tools are explicitly forbidden by institutional honor codes.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-red-600">02.</span>
            <h2 className="text-lg font-serif font-bold text-stone-900">
              Peer Feed Moderation & Verified Solutions
            </h2>
          </div>
          <p className="text-stone-600 pl-7">
            When contributing answers or project demonstrations on the community doubts feed:
          </p>
          <ul className="list-disc pl-12 space-y-1.5 text-stone-600 text-xs">
            <li>Users are strictly prohibited from posting malicious scripts, defamatory statements, or commercial advertisements.</li>
            <li>All technical derivations must present truthful algebraic steps. Malicious misinformation or false proofs are subject to community flagging and point revocation.</li>
            <li>Faculty-verified badges are reserved for accredited course instructors and teaching assistants. Impersonation of instructional staff results in immediate suspension.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-red-600">03.</span>
            <h2 className="text-lg font-serif font-bold text-stone-900">
              Inter-College Project Intellectual Property
            </h2>
          </div>
          <p className="text-stone-600 pl-7">
            Students retain 100% intellectual property ownership of the software repositories, circuits, papers, and hardware designs showcased on the Inter-College Projects hub. By submitting a project preview, you grant TUTO a non-exclusive license to display the project abstract to verified students across partner institutions.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-red-600">04.</span>
            <h2 className="text-lg font-serif font-bold text-stone-900">
              Service Availability & Ephemeral Latency
            </h2>
          </div>
          <p className="text-stone-600 pl-7">
            While our real-time voice pipeline aims for sub-500ms derivation rendering, TUTO does not warrant uninterrupted availability during peak university exam intervals or network interruptions at campus edge routers.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs font-bold text-red-600">05.</span>
            <h2 className="text-lg font-serif font-bold text-stone-900">
              Jurisdiction & Statutory Law
            </h2>
          </div>
          <p className="text-stone-600 pl-7">
            These terms are governed in accordance with the laws of the Republic of India. Any disputes arising in connection with academic enterprise contracts are subject to the exclusive jurisdiction of the courts in New Delhi.
          </p>
        </section>
      </div>
    </div>
  );
}
