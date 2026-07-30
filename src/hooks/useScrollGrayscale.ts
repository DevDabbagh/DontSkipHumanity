"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks scroll position and returns a 0–1 "color amount" for the element the
 * returned ref is attached to: 0 while it's still below the fold (fully
 * black & white), rising to 1 as it scrolls up toward the middle of the
 * viewport (full color). Meant to drive a `grayscale()` filter so images
 * gradually gain their color as the user scrolls them into view.
 */
export function useScrollGrayscale<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [colorAmount, setColorAmount] = useState(0);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;

      // Progress 0 → element's top is still in the lower part of the viewport
      // (clearly below the reading line, stays fully black & white).
      // Progress 1 → element's top has scrolled up near the top of the viewport
      // (fully colored). The band between is wide on purpose so the fade is
      // slow and obvious while scrolling, not a quick, barely-visible tint shift.
      const start = vh * 0.85;
      const end = vh * 0.15;
      const raw = (start - rect.top) / (start - end);
      const clamped = Math.min(1, Math.max(0, raw));
      // Ease so it holds near full grayscale a little longer before ramping to color.
      const eased = clamped * clamped * (3 - 2 * clamped); // smoothstep
      setColorAmount(eased);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return { ref, colorAmount };
}
