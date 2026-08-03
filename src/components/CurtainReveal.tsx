"use client";

import { type ReactNode, useRef, useState, useEffect } from "react";

/**
 * One-time curtain-reveal editorial section.
 *
 * The section has a FIXED height (equal to the image strip) that never
 * changes — before, during, or after the reveal. Only the image WIDTH
 * animates 100% → 50% (sliding to uncover the text); its height stays
 * constant, so the section never grows/shrinks vertically.
 *
 * Both halves are exactly this fixed height, so the text (heading +
 * up-to-4-line description + button) always fits inside without any
 * internal scroll or overflow. The reveal happens ONCE and does not reverse.
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
    <div
      ref={ref}
      className={`relative overflow-hidden h-[270px] sm:h-[235px] md:h-[248px] ${className}`}
    >
      {/* ── Text layer: full height. Title pins to the TOP, button to the
             BOTTOM (aligned with the image edges), description centered
             between them — identical on every screen size. ── */}
      <div
        className={`absolute top-0 bottom-0 w-1/2 ${
          mirrored ? "left-0" : "right-0"
        }`}
      >
        <div
          className={`w-full h-full flex flex-col justify-between transition-opacity duration-[900ms] ease-out ${
            revealed ? "opacity-100" : "opacity-0"
          } ${
            mirrored
              ? "pr-6 md:pr-14 pl-[max(1.5rem,calc((100vw-1400px)/2+2rem))]"
              : "pl-6 md:pl-14 pr-[max(1.5rem,calc((100vw-1400px)/2+2rem))]"
          }`}
          style={{ transitionDelay: "300ms" }}
        >
          {children}
        </div>
      </div>

      {/* ── Image curtain: full height always; only WIDTH animates 100% → 50% ── */}
      <div
        className={`relative z-10 h-full transition-[width] duration-[900ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
          mirrored ? "ml-auto" : ""
        }`}
        style={{ width: revealed ? "50%" : "100%" }}
      >
        {image}
      </div>
    </div>
  );
}
