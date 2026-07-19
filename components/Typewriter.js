"use client";

import { useEffect, useState } from "react";

const PHRASES = [
  "Schedule LinkedIn Posts",
  "Track Job Applications",
  "Generate Cover Letters with AI",
];

export default function Typewriter() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = PHRASES[phraseIndex];
    let delay = deleting ? 35 : 70;
    if (!deleting && text === full) delay = 1800; // pause when phrase complete
    if (deleting && text === "") delay = 350;

    const timer = setTimeout(() => {
      if (!deleting) {
        if (text === full) {
          setDeleting(true);
        } else {
          setText(full.slice(0, text.length + 1));
        }
      } else {
        if (text === "") {
          setDeleting(false);
          setPhraseIndex((i) => (i + 1) % PHRASES.length);
        } else {
          setText(full.slice(0, text.length - 1));
        }
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [text, deleting, phraseIndex]);

  return (
    <span aria-live="polite" aria-label={PHRASES.join(", ")}>
      <span className="grad-text font-bold">{text}</span>
      <span className="animate-caret ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.2em] bg-signal-bright" aria-hidden="true" />
    </span>
  );
}
