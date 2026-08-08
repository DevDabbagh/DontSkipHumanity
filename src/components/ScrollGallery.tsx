"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Horizontal film-still strip (after the Credits on the film-detail page).
 *
 * The section is a bit taller than the viewport, so while it is on screen the
 * strip PINS (sticky) for a moderate scroll distance and the focus sweeps
 * across every image — each one reaches the centre, grows and turns from
 * black & white into colour, one by one. Once the last image has had its
 * moment the pin releases and the next section follows.
 */

const FALLBACK = [
  "/images/political-education.jpg",
  "/images/journalism.jpg",
  "/images/slider1.jpg",
  "/images/studio.jpg",
  "/images/slidere3.jpg",
];

const GAP = 16; // px, matches gap-4
const PER_IMAGE_VH = 24; // scroll distance (vh) devoted to each extra image

export default function ScrollGallery({ images }: { images?: string[] }) {
  const imgs = images && images.length >= 1 ? images : FALLBACK;
  const N = imgs.length;

  const outerRef = useRef<HTMLDivElement>(null);
  const [{ focus, translateX }, setState] = useState({ focus: 0, translateX: 0 });

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const outer = outerRef.current;
      if (!outer) return;
      const rect = outer.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const vw = window.innerWidth || 1;
      const total = outer.offsetHeight - vh; // pin duration in px
      const scrolled = Math.max(0, Math.min(total, -rect.top));
      const p = total > 0 ? scrolled / total : 0;
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
      ref={outerRef}
      className="relative"
      style={{ height: `calc(100vh + ${(N - 1) * PER_IMAGE_VH}vh)` }}
    >
      <div className="sticky top-0 h-screen flex items-center overflow-hidden bg-[#0A0A0A]">
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
      </div>
    </section>
  );
}
