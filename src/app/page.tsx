"use client";

import Link from "next/link";
import ConfusionDemo from "@/components/ConfusionDemo/ConfusionDemo";
import PlatformWall from "@/components/PlatformWall/PlatformWall";
import TestimonialWall from "@/components/TestimonialWall/TestimonialWall";
import GridBackground from "@/components/ui/GridBackground";
import RevealText from "@/components/ui/RevealText";
import Reveal from "@/components/ui/Reveal";
import { ArrowRight } from "@/components/Icons";
import { studentFeatures, facultyFeatures } from "@/data/features";

function Index({ items }: { items: { id: string; title: string; text: string }[] }) {
  return (
    <ol className="index">
      {items.map((f, i) => (
        <li className="index__row" key={f.id}>
          <span className="index__num">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="index__title">{f.title}</h3>
          <p className="index__text">{f.text}</p>
        </li>
      ))}
    </ol>
  );
}

function SectionHead({
  number,
  label,
  title,
  text,
}: {
  number: string;
  label: string;
  title: string;
  text: string;
}) {
  return (
    <div className="split__head">
      <p className="eyebrow">
        {number} / {label}
      </p>
      <RevealText as="h2" className="split__title" text={title} />
      <Reveal as="p" className="split__text" delay={200}>
        {text}
      </Reveal>
    </div>
  );
}

export default function Home() {
  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      {/* Editorial Hero with Interactive Canvas Grid */}
      <section className="hero-editorial has-grid">
        <GridBackground />
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="hero__title-editorial">
            <span className="line">
              <span>Learning gets easier</span>
            </span>
            <span className="line">
              <span>when confusion is</span>
            </span>
            <span className="line">
              <span className="hero__accent">visible.</span>
            </span>
          </h1>

          <div className="hero__rule" aria-hidden="true" />

          <div className="hero__lower">
            <div className="hero__copy">
              <p className="hero__lede">
                TUTO is a learning platform for college students and faculty. Students ask
                a question and get a worked answer. Faculty see which concepts the room is
                struggling with while there is still time to teach them again.
              </p>
              <div className="hero__actions">
                <Link className="btn btn--primary" href="/signup">
                  <span>Create an account</span>
                  <ArrowRight />
                </Link>
                <Link className="btn" href="/app">
                  <span>Preview the app</span>
                </Link>
                <Link className="btn" href="#students">
                  <span>See the features</span>
                </Link>
              </div>
            </div>

            {/* Interactive Confusion Demo Widget */}
            <ConfusionDemo />
          </div>
        </div>
      </section>

      {/* Section 01: For Students */}
      <section className="py-20 border-t border-[var(--rule)]" id="students">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 split">
          <SectionHead
            number="01"
            label="For students"
            title="Ask without worrying how it *sounds.*"
            text="Questions get worked answers, the class feed accepts anonymous posts, and the Confusion Map shows you that the topic you did not follow was not only your problem."
          />
          <Reveal>
            <Index items={studentFeatures} />
          </Reveal>
        </div>
      </section>

      {/* Section 02: For Faculty */}
      <section
        className="py-20 bg-[var(--paper-2)] border-t border-[var(--rule)]"
        id="faculty"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 split split--mirrored">
          <SectionHead
            number="02"
            label="For faculty"
            title="Teach to the gaps while you can *still* *close* *them.*"
            text="Confusion signals and learning outcomes come to you as they happen, not after the exam. Curriculum changes reach every section from one place."
          />
          <Reveal>
            <Index items={facultyFeatures} />
          </Reveal>
        </div>
      </section>

      {/* Section 03: Mouse-driven 3D Platform Wall */}
      <PlatformWall />

      {/* Section 04: Planned Features (Dashed Border) */}
      <section className="py-20 border-t border-[var(--rule)] bg-[var(--paper)]" id="planned">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="planned-box">
            <div>
              <p className="eyebrow">04 / Planned</p>
              <h2 className="planned__title">Live lectures and lecture recaps</h2>
            </div>
            <p className="planned__text">
              Scheduled live lectures, with an AI generated recap video for anyone who
              missed the session. This is planned and not available yet.
            </p>
          </div>
        </div>
      </section>

      {/* Section 05: Testimonial Wall (Auto-hides if fewer than 6 real verified quotes) */}
      <TestimonialWall />

      {/* Section 06: Closing CTA Band */}
      <section className="cta-band">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 cta__inner">
          <RevealText as="h2" className="cta__title" text="Start with one *question.*" />
          <div className="cta__side">
            <p>
              Create an account to ask your first question, or sign in to pick up where
              you left off.
            </p>
            <div className="cta__actions">
              <Link className="btn btn--ink" href="/signup">
                <span>Create an account</span>
                <ArrowRight />
              </Link>
              <Link className="btn btn--light" href="/login">
                <span>Sign in</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
