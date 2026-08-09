"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Horizontal film-still strip (after the Credits on the film-detail page).
 *
 * A compact band — the exact height of the images (no full-screen takeover,
 * so there is no large empty space above or below). As the page scrolls past,
 * the row drifts sideways and a "focus" sweeps across the images; the focused
 * image turns from black & white into colour (base opacity 10%). No scaling.
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
      // Sweep the focus while the band is on screen (first & last both centre).
      const center = rect.top + rect.height / 2;
      const start = 0.9 * vh;
      const end = 0.1 * vh;
      const p = Math.max(0, Math.min(1, (start - center) / (start - end)));
      const f = p * (N - 1);
      const boxW = vw * (vw < 640 ? 0.62 : vw < 1024 ? 0.36 : 0.26);
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
      className="relative overflow-hidden bg-[#0A0A0A] h-[240px] sm:h-[300px] lg:h-[340px] flex items-center"
    >
      {/* leading/trailing padding centres the first & last image */}
      <div
        className="flex items-center gap-4 px-[20vw] sm:px-[33vw] lg:px-[38vw] will-change-transform"
        style={{ transform: `translateX(${translateX}px)` }}
      >
        {imgs.map((src, i) => {
          const prox = Math.max(0, 1 - Math.abs(i - focus)); // 1 when centred
          const grayscale = 1 - prox; // B&W → colour, one by one
          const opacity = 0.1 + 0.85 * prox; // base 10% → full when focused
          return (
            <div
              key={i}
              className="relative shrink-0 w-[62vw] sm:w-[36vw] lg:w-[26vw] h-full overflow-hidden rounded-[4px]"
              style={{ opacity }}
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
