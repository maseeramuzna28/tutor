import type { Metadata } from "next";
import "@/styles/tokens.css";
import "./globals.css";
import "@/styles/editorial.css";
import "@/styles/effects.css";
import "@/styles/app.css";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ui/ScrollProgress";

export const metadata: Metadata = {
  title: "TUTO — Learning gets easier when confusion is visible",
  description:
    "TUTO is a learning platform for college students and faculty. Ask questions, see where the class is confused, and teach to the gaps.",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&family=Oswald:wght@500;600;700&family=Schibsted+Grotesk:wght@400..800&family=Syne:wght@700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className="min-h-screen bg-[var(--paper)] text-[var(--ink-2)] antialiased flex flex-col"
        suppressHydrationWarning
      >
        <ScrollProgress />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
