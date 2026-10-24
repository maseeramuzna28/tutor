"use client";

import { useEffect } from "react";
import Link from "next/link";
import { site } from "@/config/site";
import { LegalDoc } from "@/data/privacy";
import "@/styles/editorial.css";

export default function LegalPageView({ doc }: { doc: LegalDoc }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const prev = document.title;
      document.title = `${doc.title} | ${site.name}`;
      return () => {
        document.title = prev;
      };
    }
  }, [doc.title]);

  return (
    <article className="legal-page min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 legal__grid">
        <header className="legal__head">
          <p className="eyebrow">Legal</p>
          <h1>{doc.title}</h1>
          <p className="legal__meta">Effective {site.effectiveDate}</p>
          <p className="legal__intro">{doc.intro}</p>
        </header>

        <nav className="legal__toc" aria-label={`${doc.title} contents`}>
          <h2 className="eyebrow">Contents</h2>
          <ol>
            {doc.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="legal__body">
          {doc.sections.map((s, i) => (
            <section key={s.id} id={s.id} className="legal__section">
              <h2>
                <span className="legal__num">{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </h2>
              {s.blocks.map((b, j) =>
                b.type === "list" && b.items ? (
                  <ul key={j} className="list-disc pl-5 space-y-1.5 my-3">
                    {b.items.map((item, k) => (
                      <li key={k}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p key={j} className="mb-3">
                    {b.text}
                  </p>
                )
              )}
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
