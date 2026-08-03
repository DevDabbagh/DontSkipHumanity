"use client";

import { type ReactNode, useRef, useState, useEffect } from "react";

/**
 * One-time curtain-reveal editorial section.
 *
 * Initial state: image covers ~100% width, text hidden behind it.
 * When the section first enters the viewport, the image slides to 50%,
 * uncovering the text. This happens ONCE — after the transition completes
 * the layout is permanently locked at 50/50. Scrolling back up does NOT
 * reverse the animation.
 */
export default function CurtainReveal({
  image,
  children,
  mirrored = false,
  className = "",
}: {
  image: ReactNode;
  children: ReactNode;
  mirrored?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect(); // one-time — never reverses
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`relative overflow-x-hidden ${className}`}>
      {/* ── Text layer: positioned in the half that gets revealed ── */}
      <div
        className={`absolute top-0 bottom-0 w-1/2 flex items-center overflow-hidden ${
          mirrored ? "left-0" : "right-0"
        }`}
      >
        <div
          className={`w-full transition-opacity duration-[900ms] ease-out ${
            revealed ? "opacity-100" : "opacity-0"
          } ${
            mirrored
              ? "pr-14 pl-[max(2rem,calc((100vw-1400px)/2+2rem))]"
              : "pl-14 pr-[max(2rem,calc((100vw-1400px)/2+2rem))]"
          }`}
          style={{ transitionDelay: "300ms" }}
        >
          {children}
        </div>
      </div>

      {/* ── Image curtain: starts at 100%, transitions once to 50% ── */}
      <div
        className={`relative z-10 transition-[width] duration-[900ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
          mirrored ? "ml-auto" : ""
        }`}
        style={{ width: revealed ? "50%" : "100%" }}
      >
        {image}
      </div>
    </div>
  );
}
