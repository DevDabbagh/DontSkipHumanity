"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Horizontal film-still strip (after the Credits on the film-detail page).
 *
 * A normal-height band — NOT a full-screen pinned section. Several images
 * are visible at once; as the page scrolls past, the row drifts sideways
 * (parallax) so a "focus" sweeps across the images one by one. The focused
 * image grows and turns from black & white into colour; the others stay
 * smaller and B&W.
 */

const FALLBACK = [
  "/images/political-education.jpg",
  "/images/journalism.jpg",
  "/images/slider1.jpg",
  "/images/studio.jpg",
  "/images/slidere3.jpg",
];

const GAP = 16; // px, matches gap-4

export default function ScrollGallery({ images }: { images?: string[] }) {
  const imgs = images && images.length >= 1 ? images : FALLBACK;
  const N = imgs.length;

  const ref = useRef<HTMLDivElement>(null);
  const [{ focus, translateX }, setState] = useState({ focus: 0, translateX: 0 });

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const vw = window.innerWidth || 1;
      // Sweep the focus while the band is ON SCREEN, so the first AND last
      // images each get a centred moment. focus 0 when the band centre is
      // low in the viewport, N-1 when it is high.
      const center = rect.top + rect.height / 2;
      const start = 0.9 * vh;
      const end = 0.1 * vh;
      const p = Math.max(0, Math.min(1, (start - center) / (start - end)));
      const f = p * (N - 1);
      const boxW = vw * (vw < 640 ? 0.6 : vw < 1024 ? 0.34 : 0.24);
      setState({ focus: f, translateX: -f * (boxW + GAP) });
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

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-[#0A0A0A] h-[40vh] sm:h-[46vh] lg:h-[52vh] flex items-center"
    >
      {/* leading/trailing padding centres the first & last image */}
      <div
        className="flex items-center gap-4 px-[20vw] sm:px-[33vw] lg:px-[38vw] will-change-transform"
        style={{ transform: `translateX(${translateX}px)` }}
      >
        {imgs.map((src, i) => {
          const prox = Math.max(0, 1 - Math.abs(i - focus)); // 1 when centred
          const grayscale = 1 - prox; // B&W → colour
          const opacity = 0.22 + 0.78 * prox;
          const scale = 0.9 + 0.34 * prox; // focused card grows
          return (
            <div
              key={i}
              className="relative shrink-0 w-[60vw] sm:w-[34vw] lg:w-[24vw] h-[30vh] sm:h-[34vh] lg:h-[38vh] overflow-hidden rounded-[4px] will-change-transform"
              style={{ transform: `scale(${scale})`, transformOrigin: "center", opacity }}
            >
              <img
                src={src}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: `grayscale(${grayscale}) contrast(1.02)` }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
