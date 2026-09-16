"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The full-bleed photo strip under an article — Frame 590 (883:808) on the
 * Read details frame. Tiago's note on it reads "slider photo gallery".
 *
 * A 570px band (py 120) of 330px-tall tiles, edge to edge. As the page
 * scrolls past, the row drifts sideways and a focus sweeps across it: the
 * tile in focus is in colour, the others sit black-and-white and dimmed —
 * the same behaviour as the film-still strip on Film Details, at this
 * frame's tile size and spacing (455 wide, no gap).
 *
 * Renders nothing without images. There is no fallback set: a strip of stock
 * photos under a real article is invented content.
 */

const TILE_W = 455; // px, the frame's 454.86
const TILE_H = 330;

export default function ArticleGallery({
  images,
}: {
  images: { url: string; caption?: string }[];
}) {
  const imgs = images.filter((i) => i.url);
  const N = imgs.length;

  const ref = useRef<HTMLDivElement>(null);
  const [{ focus, translateX }, setState] = useState({ focus: 0, translateX: 0 });

  useEffect(() => {
    if (N === 0) return;
    let raf = 0;
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const centre = rect.top + rect.height / 2;
      const start = 0.9 * vh;
      const end = 0.1 * vh;
      const p = Math.max(0, Math.min(1, (start - centre) / (start - end)));
      const f = p * (N - 1);
      setState({ focus: f, translateX: -f * TILE_W });
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

  if (N === 0) return null;

  return (
    <section ref={ref} className="relative overflow-hidden py-[120px]" aria-label="Photo gallery">
      {/* Leading padding centres the first tile; the drift brings the rest in. */}
      <div
        className="flex items-center will-change-transform"
        style={{ transform: `translateX(${translateX}px)`, paddingLeft: `calc(50vw - ${TILE_W / 2}px)` }}
      >
        {imgs.map((img, i) => {
          const prox = Math.max(0, 1 - Math.abs(i - focus)); // 1 when in focus
          return (
            <figure
              key={`${img.url}-${i}`}
              className="relative shrink-0 overflow-hidden m-0"
              style={{ width: TILE_W, height: TILE_H, opacity: 0.35 + 0.65 * prox }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.caption || ""}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: `grayscale(${(1 - prox).toFixed(3)})` }}
              />
            </figure>
          );
        })}
      </div>
    </section>
  );
}
