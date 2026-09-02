"use client";

import { useEffect, useState } from "react";

/**
 * Types a string out one character at a time.
 *
 * Used on the Support hero so the headline writes itself before the donation
 * card arrives — the page composes itself in front of the reader rather than
 * being there already.
 *
 * `done` is what the card waits on. It flips true one tick after the last
 * character lands, so the card's entrance reads as a consequence of the
 * sentence finishing rather than a race with it.
 *
 * Reduced motion gets the whole string immediately and `done` straight away —
 * no partial text, no waiting. Someone who has asked for less movement should
 * not be made to sit through a slower page.
 */
export function useTypewriter(
  text: string,
  { speed = 34, startDelay = 250 }: { speed?: number; startDelay?: number } = {}
) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setShown(text);
      setDone(true);
      return;
    }

    setShown("");
    setDone(false);

    let i = 0;
    let tick: ReturnType<typeof setInterval>;

    const begin = setTimeout(() => {
      tick = setInterval(() => {
        i += 1;
        setShown(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(tick);
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(begin);
      clearInterval(tick);
    };
  }, [text, speed, startDelay]);

  return { shown, done };
}
