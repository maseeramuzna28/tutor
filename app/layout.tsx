import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tuto — Just Tuto it. Ask out loud, without fear.',
  description: 'Voice-first academic learning platform for college students across India.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
