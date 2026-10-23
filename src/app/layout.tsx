import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Logo from "@/components/Logo";

export const metadata: Metadata = {
  title: "TUTO — Voice-First Learning & Anonymous Doubt Resolution",
  description:
    "Ask out loud. Ask without fear. Solve college doubts instantly with AI voice derivations and peer collaboration.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas-glow text-stone-900 antialiased flex flex-col selection:bg-red-600/15 selection:text-stone-950 font-sans">
        <Navbar />
        <main className="flex-1 pb-20 md:pb-12">{children}</main>

        {/* Editorial Publication Footer */}
        <footer className="border-t border-stone-200 bg-white py-12 px-4 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-stone-200">
              {/* Col 1: Masthead & Purpose */}
              <div className="md:col-span-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Logo height={26} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-red-600 font-bold">
                    EDITION 2026
                  </span>
                </div>
                <p className="text-xs text-stone-600 max-w-sm leading-relaxed">
                  Audio-first academic reasoning and blind confusion telemetry for STEM students and engineering faculty across Indian universities.
                </p>
                <div className="pt-2 font-mono text-[10px] text-stone-500 uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 bg-red-600 inline-block mr-1.5" />
                  Zero student identities or biometric prints stored.
                </div>
              </div>

              {/* Col 2: Telemetry & Tools */}
              <div className="md:col-span-3 space-y-2">
                <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-stone-900">
                  Platform
                </p>
                <ul className="space-y-1.5 text-xs text-stone-600 font-mono">
                  <li><a href="/tutor" className="hover:text-red-600 transition-colors">AI Voice Tutor</a></li>
                  <li><a href="/faculty" className="hover:text-red-600 transition-colors">Faculty Confusion Map</a></li>
                  <li><a href="/feed" className="hover:text-red-600 transition-colors">Peer Doubts Feed</a></li>
                  <li><a href="/projects" className="hover:text-red-600 transition-colors">Inter-College Projects</a></li>
                  <li><a href="/leaderboard" className="hover:text-red-600 transition-colors">Academic Leaderboard</a></li>
                </ul>
              </div>

              {/* Col 3: Legal & Governance */}
              <div className="md:col-span-4 space-y-2">
                <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-stone-900">
                  Compliance & Terms
                </p>
                <ul className="space-y-1.5 text-xs text-stone-600 font-mono">
                  <li><a href="/privacy" className="hover:text-red-600 transition-colors underline decoration-stone-300">Privacy Policy (DPDP & FERPA)</a></li>
                  <li><a href="/terms" className="hover:text-red-600 transition-colors underline decoration-stone-300">Terms & Academic Conduct</a></li>
                  <li><a href="/curriculum" className="hover:text-red-600 transition-colors">Curriculum Mapping & Syllabi</a></li>
                  <li><a href="/login" className="hover:text-red-600 transition-colors">University Single Sign-On</a></li>
                </ul>
              </div>
            </div>

            {/* Bottom Colophon */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-stone-500">
              <p>TUTO TECHNOLOGIES • NEW DELHI & BENGALURU</p>
              <p>© 2026 TUTO RESEARCH GROUP • ALL RIGHTS RESERVED</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
