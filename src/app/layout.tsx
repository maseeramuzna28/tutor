import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "TUTO — Voice-First Learning & Anonymous Doubt Resolution",
  description:
    "Ask out loud. Ask without fear. Solve college doubts instantly with AI voice derivations and peer collaboration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas-glow text-slate-900 antialiased flex flex-col selection:bg-indigo-500/20 selection:text-indigo-950">
        <Navbar />
        <main className="flex-1 pb-20 md:pb-8">{children}</main>
        <footer className="border-t border-slate-200/80 bg-white py-8 px-4 text-center text-xs text-slate-500">
          <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="font-semibold text-slate-900 tracking-tight">TUTO</span>
              <span className="text-slate-300">•</span>
              <span>Voice-first doubt resolution & anonymous student telemetry</span>
            </div>
            <div className="flex items-center gap-5 text-xs text-slate-500">
              <a href="/feed" className="hover:text-slate-900 transition-colors">Doubts Feed</a>
              <a href="/tutor" className="hover:text-slate-900 transition-colors">AI Tutor</a>
              <a href="/projects" className="hover:text-slate-900 transition-colors">Projects</a>
              <span className="text-slate-300">•</span>
              <span className="text-slate-400">© 2026 TUTO Technologies</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
