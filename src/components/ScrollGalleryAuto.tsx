"use client";

import { useEffect, useRef } from "react";

/**
 * Auto-scrolling film-still strip (alternative to ScrollGallery).
 *
 * The row drifts sideways on its own, slowly and continuously (seamless loop) —
 * the visitor does NOT need to scroll. Images have varying widths (small /
 * medium). Each image is black & white; whichever image is nearest the viewport
 * centre turns to colour (base opacity 10%), then fades back to B&W as it drifts
 * past — the same treatment as the manual gallery, driven by the auto-scroll.
 */

const FALLBACK = [
  "/images/political-education.jpg",
  "/images/journalism.jpg",
  "/images/slider1.jpg",
  "/images/studio.jpg",
  "/images/slidere3.jpg",
];

// varying widths, cycled across the images (small / medium)
const WIDTHS = ["w-[220px]", "w-[340px]", "w-[260px]", "w-[320px]", "w-[240px]"];

export default function ScrollGalleryAuto({
  images,
  speed = 0.45, // px per frame (~27px/s) — slow drift
}: {
  images?: string[];
  speed?: number;
}) {
  const imgs = images && images.length >= 1 ? images : FALLBACK;
  const N = imgs.length;

  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    let offset = 0;
    const track = trackRef.current;
    if (!track) return;

    const loop = () => {
      offset += speed;
      // width of one set = where the first duplicated item starts
      const half = itemRefs.current[N]?.offsetLeft || track.scrollWidth / 2;
      const x = -(offset % half);
      track.style.transform = `translate3d(${x}px,0,0)`;

      // colour-on-centre for every visible tile
      const vwCenter = (window.innerWidth || 1) / 2;
      const reach = (window.innerWidth || 1) * 0.42;
      for (const el of itemRefs.current) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const c = r.left + r.width / 2;
        const prox = Math.max(0, 1 - Math.abs(c - vwCenter) / reach);
        el.style.filter = `grayscale(${1 - prox}) contrast(1.02)`;
        el.style.opacity = String(0.1 + 0.85 * prox);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [speed, N]);

  // Repeat the set enough times to fill even wide screens without a visible
  // seam — the loop resets after exactly one set width, so it runs infinitely.
  const REPEAT = 4;
  const looped = Array.from({ length: REPEAT }).flatMap(() => imgs);

  return (
    <section className="relative overflow-hidden bg-[#0A0A0A] py-1">
      <div ref={trackRef} className="flex items-center gap-px w-max will-change-transform">
        {looped.map((src, i) => (
          <div
            key={i}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className={`relative shrink-0 ${WIDTHS[(i % N) % WIDTHS.length]} h-[240px] sm:h-[300px] lg:h-[340px] overflow-hidden`}
            style={{ filter: "grayscale(1) contrast(1.02)", opacity: 0.1 }}
          >
            <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
}
