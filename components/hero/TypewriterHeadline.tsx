"use client";

import { useState, useEffect } from "react";

export default function TypewriterHeadline({
  text,
  splitAt,
  onDone,
  speed = 90,
}: {
  text: string;
  splitAt?: number;
  onDone?: () => void;
  speed?: number;
}) {
  const [typed, setTyped] = useState("");
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTyped(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setTimeout(() => setFinished(true), 500);
        setTimeout(() => onDone?.(), 300);
      }
    }, speed);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const cut = splitAt ?? text.length;
  const firstPart = typed.slice(0, Math.min(typed.length, cut));
  const secondPart = typed.slice(cut);

  const headingCls = "font-display text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-extrabold uppercase tracking-tight leading-none";

  return (
    <div className="relative">
      {/* Invisible placeholder reserves the full height so content below never shifts */}
      <h1 className={`${headingCls} invisible select-none pointer-events-none`} aria-hidden>
        <span>{text.slice(0, cut)}</span>
        <span>{text.slice(cut)}</span>
      </h1>
      <h1 className={`${headingCls} absolute top-0 left-0`}>
        <span className="text-brand-white">{firstPart}</span>
        <span className="text-brand-gold">{secondPart}</span>
        {!finished && (
          <span
            className="inline-block w-[3px] bg-brand-gold ml-1 animate-pulse"
            style={{ height: "0.75em", verticalAlign: "baseline" }}
            aria-hidden="true"
          />
        )}
      </h1>
    </div>
  );
}
