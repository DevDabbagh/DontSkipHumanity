"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Classic scroll parallax: returns a ref + a pixel offset that drifts as the
 * element scrolls through the viewport. Apply the offset as a `translateY`
 * on an oversized background image (scale it up ~1.15x first) so it pans
 * slowly instead of moving in lockstep with the page.
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(speed = 0.25) {
  const ref = useRef<T>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const distanceFromCenter = rect.top + rect.height / 2 - vh / 2;
      setOffset(distanceFromCenter * speed);
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
  }, [speed]);

  return { ref, offset };
}
