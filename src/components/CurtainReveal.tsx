"use client";

import { type ReactNode, useRef, useState, useEffect } from "react";

/**
 * Editorial split section: image on one half, text on the other.
 *
 * Layout is a normal two-column flex row whose height is driven by the
 * content (the text), so the 4-line description + button always fit — no
 * internal scroll, no clipping. The image fills its half at whatever height
 * the text needs.
 *
 * Reveal animation is a one-time horizontal SLIDE + fade when the section
 * enters the viewport (image slides in from its own side, text from the
 * opposite side). No width/height "curtain" that changes the section height.
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
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Slide direction: image comes in from its own side; text from the opposite.
  const imgHidden = mirrored ? "md:translate-x-10" : "md:-translate-x-10";
  const textHidden = mirrored ? "md:-translate-x-10" : "md:translate-x-10";
  const anim = "transition-all duration-[900ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] will-change-transform";

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <div className="flex flex-col md:flex-row md:items-stretch">
        {/* ── Image half ── */}
        <div
          className={`md:w-1/2 ${mirrored ? "md:order-2" : ""} ${anim} ${
            revealed ? "opacity-100 translate-x-0" : `opacity-0 ${imgHidden}`
          }`}
        >
          {/* Fixed height on mobile; on desktop it stretches to the text height */}
          <div className="h-[200px] sm:h-[240px] md:h-full">{image}</div>
        </div>

        {/* ── Text half ── */}
        <div
          className={`md:w-1/2 flex items-center ${anim} ${
            revealed ? "opacity-100 translate-x-0" : `opacity-0 ${textHidden}`
          } ${
            mirrored
              ? "pr-6 md:pr-14 pl-6 md:pl-[max(1.5rem,calc((100vw-1400px)/2+2rem))]"
              : "pl-6 md:pl-14 pr-6 md:pr-[max(1.5rem,calc((100vw-1400px)/2+2rem))]"
          }`}
          style={{ transitionDelay: "120ms" }}
        >
          <div className="w-full py-8 md:py-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
