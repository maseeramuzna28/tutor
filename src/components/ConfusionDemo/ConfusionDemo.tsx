"use client";

import { useState } from "react";
import "./ConfusionDemo.css";

// Sample layout for demonstration only. Not real class data.
const TOPICS = [
  { id: "recursion", name: "Recursion", seed: 62 },
  { id: "pointers", name: "Pointers", seed: 78 },
  { id: "normalization", name: "Normalization", seed: 44 },
  { id: "big-o", name: "Big O", seed: 30 },
  { id: "deadlocks", name: "Deadlocks", seed: 52 },
  { id: "joins", name: "SQL joins", seed: 24 },
  { id: "trees", name: "Binary trees", seed: 36 },
  { id: "hashing", name: "Hashing", seed: 18 },
  { id: "paging", name: "Paging", seed: 40 },
];

const initialHeat = () => Object.fromEntries(TOPICS.map((t) => [t.id, t.seed]));

export default function ConfusionDemo() {
  const [heat, setHeat] = useState<Record<string, number>>(initialHeat);
  const [taps, setTaps] = useState(0);

  const top = TOPICS.reduce((a, b) => (heat[b.id] > heat[a.id] ? b : a), TOPICS[0]);

  const mark = (id: string) => {
    setHeat((h) => ({ ...h, [id]: Math.min(100, (h[id] || 0) + 10) }));
    setTaps((t) => t + 1);
  };

  const reset = () => {
    setHeat(initialHeat());
    setTaps(0);
  };

  return (
    <div className="cmap" id="confusion">
      <div className="cmap__head">
        <h2 className="cmap__title">Confusion Map</h2>
        <span className="cmap__label">Try it</span>
      </div>
      <p className="cmap__hint">Press a topic you find confusing. The map changes as the class marks topics.</p>

      <div className="cmap__grid">
        {TOPICS.map((t) => {
          const isTop = t.id === top.id;
          return (
            <button
              key={t.id}
              type="button"
              className="cmap__cell"
              style={{ "--heat": heat[t.id] } as React.CSSProperties}
              data-top={isTop ? "true" : "false"}
              onClick={() => mark(t.id)}
              aria-label={`${t.name}. Press to mark this topic as confusing.`}
            >
              <span className="cmap__text">
                <span className="cmap__name">{t.name}</span>
                <span className="cmap__flag">{isTop ? "Most flagged" : ""}</span>
              </span>
              <span className="cmap__bar" aria-hidden="true">
                <span className="cmap__fill" />
              </span>
            </button>
          );
        })}
      </div>

      <div className="cmap__foot">
        <p className="cmap__summary" aria-live="polite">
          In this sample, the most flagged topic is <strong>{top.name}</strong>. You marked {taps}{" "}
          {taps === 1 ? "topic" : "topics"}.
        </p>
        <button type="button" className="cmap__reset" onClick={reset}>Reset</button>
      </div>
      <p className="cmap__note">Sample layout for demonstration. Nothing you press is sent anywhere.</p>
    </div>
  );
}
