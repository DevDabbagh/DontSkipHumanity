"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Horizontal image strip (after the Credits on the film-detail page).
 *
 * As the strip scrolls through the viewport the whole row drifts sideways
 * (parallax), and a "focus point" sweeps across the images with the scroll.
 * Each image is black & white; its opacity rises from 10% to 70% as the
 * focus lands on it (and as the strip nears the viewport centre), then eases
 * back to 10% as it moves away. The focused image also scales up slightly —
 * the same feel as a horizontal parallax gallery.
 */

const IMAGES = [
  "/images/political-education.jpg",
  "/images/journalism.jpg",
  "/images/slider1.jpg",
  "/images/studio.jpg",
  "/images/slidere3.jpg",
];

export default function ScrollGallery() {
  const ref = useRef<HTMLDivElement>(null);
  // prog = 0..1 progress of the strip passing through the viewport
  // vis  = 0..1 how centred the strip is (0 at edges, 1 at centre)
  const [{ prog, vis }, setState] = useState({ prog: 0.5, vis: 0 });

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const p = (vh - rect.top) / (vh + rect.height); // 0 below → 1 above
      const clamped = Math.max(0, Math.min(1, p));
      const centred = 1 - Math.min(1, Math.abs(clamped - 0.5) * 2);
      setState({ prog: clamped, vis: centred });
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
  }, []);

  const focus = prog * (IMAGES.length - 1); // moving focal index
  const drift = (prog - 0.5) * 120; // px horizontal parallax

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-[#0A0A0A] h-[240px] sm:h-[320px] lg:h-[400px]"
    >
      <div
        className="flex gap-2 h-full will-change-transform"
        style={{ transform: `translateX(${-drift}px)` }}
      >
        {IMAGES.map((src, i) => {
          const prox = Math.max(0, 1 - Math.abs(i - focus)); // 1 when focused
          const opacity = 0.1 + 0.6 * prox * vis; // 0.1 → 0.7
          const scale = 1 + 0.14 * prox * vis;
          return (
            <div key={i} className="relative flex-1 h-full overflow-hidden">
              <img
                src={src}
                alt=""
                className="absolute inset-0 w-full h-full object-cover will-change-transform"
                style={{
                  filter: "grayscale(1) contrast(1.02)",
                  opacity,
                  transform: `scale(${scale})`,
                  transition: "opacity 0.15s linear, transform 0.2s ease-out",
                }}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
