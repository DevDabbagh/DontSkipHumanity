"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Pinned horizontal gallery (after the Credits on the film-detail page).
 *
 * The section is taller than the viewport; while it is on screen the inner
 * band pins (sticky) and the row of images slides horizontally as you scroll,
 * moving through every image one by one. When the last image is reached the
 * pin releases and the page continues scrolling normally.
 *
 * The image currently in focus (nearest the viewport centre) scales up and
 * turns from black & white into full colour; as it moves away it eases back
 * to black & white. Focus sweeps across the images with the scroll.
 */

const FALLBACK = [
  "/images/political-education.jpg",
  "/images/journalism.jpg",
  "/images/slider1.jpg",
  "/images/studio.jpg",
  "/images/slidere3.jpg",
];

export default function ScrollGallery({ images }: { images?: string[] }) {
  const imgs = images && images.length >= 1 ? images : FALLBACK;
  const N = imgs.length;

  const outerRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [{ progress, translateX }, setState] = useState({ progress: 0, translateX: 0 });

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const outer = outerRef.current;
      const row = rowRef.current;
      if (!outer || !row) return;
      const rect = outer.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const vw = window.innerWidth || 1;
      const total = outer.offsetHeight - vh; // pin duration in px
      const scrolled = Math.max(0, Math.min(total, -rect.top));
      const p = total > 0 ? scrolled / total : 0;
      const maxTranslate = Math.max(0, row.scrollWidth - vw);
      setState({ progress: p, translateX: -p * maxTranslate });
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [N]);

  const focus = progress * (N - 1); // moving focal index

  return (
    <section
      ref={outerRef}
      className="relative"
      style={{ height: `calc(100vh + ${(N - 1) * 55}vh)` }}
    >
      <div className="sticky top-0 h-screen flex items-center overflow-hidden bg-[#0A0A0A]">
        <div
          ref={rowRef}
          className="flex items-center gap-3 sm:gap-4 px-[25vw] will-change-transform"
          style={{ transform: `translateX(${translateX}px)` }}
        >
          {imgs.map((src, i) => {
            const prox = Math.max(0, 1 - Math.abs(i - focus)); // 1 when focused
            const grayscale = 1 - prox; // 1 = B&W, 0 = colour
            const opacity = 0.18 + 0.72 * prox; // faint → full
            const scale = 1 + 0.16 * prox; // focused image grows
            return (
              <div
                key={i}
                className="relative shrink-0 h-[46vh] sm:h-[56vh] lg:h-[62vh] overflow-hidden rounded-[4px]"
                style={{ width: "50vw" }}
              >
                <img
                  src={src}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover will-change-transform"
                  style={{
                    filter: `grayscale(${grayscale}) contrast(1.02)`,
                    opacity,
                    transform: `scale(${scale})`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
