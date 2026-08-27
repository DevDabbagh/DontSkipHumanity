"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll-linked black-and-white → colour.
 *
 * Images start desaturated and gain colour as they rise up the viewport, so
 * the page "develops" as the reader scrolls down.
 *
 * Applied to the element the returned ref is attached to. Every descendant
 * marked `data-colorize` is driven, so one ref can cover a whole section.
 *
 * Progress is measured from the element's own centre against a band of the
 * viewport, NOT from raw scrollY — that keeps it correct regardless of where
 * the section sits on the page or how long the page is.
 *
 *   centre at/below `start` (85% of viewport height) → grayscale(1)
 *   centre at/above `end`   (45% of viewport height) → grayscale(0)
 *
 * Honours `prefers-reduced-motion`: the filter is cleared outright rather than
 * animated, so those users get full colour immediately.
 */
export function useScrollColorize<T extends HTMLElement = HTMLDivElement>(
  { start = 0.85, end = 0.45 }: { start?: number; end?: number } = {}
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const targets = Array.from(
      root.matches("[data-colorize]")
        ? [root, ...root.querySelectorAll<HTMLElement>("[data-colorize]")]
        : root.querySelectorAll<HTMLElement>("[data-colorize]")
    ) as HTMLElement[];
    if (targets.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const clear = () => {
      targets.forEach((el) => {
        el.style.filter = "";
      });
    };

    if (reduced.matches) {
      clear();
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;
      const vh = window.innerHeight || 1;
      const startPx = vh * start;
      const endPx = vh * end;

      /* Anything inside the final screenful of the document can never lift its
         centre into the band — the page runs out of scroll first — so it would
         stay permanently part-grey. Ramp those to full colour across the last
         viewport of travel. Smooth, and it guarantees the page ends in colour. */
      const maxScroll = document.documentElement.scrollHeight - vh;
      const bottomBoost =
        maxScroll <= 0
          ? 1
          : Math.min(1, Math.max(0, (window.scrollY - (maxScroll - vh)) / vh));

      targets.forEach((el) => {
        const r = el.getBoundingClientRect();
        /* Skip work for anything comfortably off-screen. */
        if (r.bottom < -vh || r.top > vh * 2) return;

        const centre = r.top + r.height / 2;
        /* 0 at `startPx` (fully grey) … 1 at `endPx` (full colour) */
        const raw = (startPx - centre) / (startPx - endPx);
        const banded = Math.min(1, Math.max(0, raw));
        const progress = Math.max(banded, bottomBoost);
        const grey = (1 - progress).toFixed(3);
        el.style.filter = `grayscale(${grey})`;
      });
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    const onReducedChange = () => {
      if (reduced.matches) {
        window.removeEventListener("scroll", onScroll);
        clear();
      } else {
        window.addEventListener("scroll", onScroll, { passive: true });
        update();
      }
    };

    /* Seed every target grey BEFORE the first pass.
     *
     * `update()` skips anything more than two viewports down to save work,
     * which meant those images carried no filter at all until the first
     * scroll event — so they sat in full colour until you touched the wheel,
     * the opposite of the intended resting state. On a listing page most
     * cards start below that line, so most of the page was wrong at rest.
     * Seeding costs one style write per image and guarantees the page starts
     * monochrome and develops from there. */
    targets.forEach((el) => {
      el.style.filter = "grayscale(1)";
    });

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    reduced.addEventListener("change", onReducedChange);

    /* Recompute once the document's real height is known.
     *
     * The first pass runs at hydration, when images have no dimensions yet
     * and the document is barely taller than the viewport. `maxScroll` is
     * then <= 0, the "page can't scroll, so show it in colour" shortcut
     * fires, and every image is stamped full colour — permanently, because
     * nothing recomputes until a scroll event. On a listing page that is the
     * whole grid, which is exactly how /studio and /films ended up ignoring
     * the effect entirely.
     *
     * Watching the body covers images loading, fonts swapping and any late
     * layout shift, so the values correct themselves without waiting for the
     * reader to scroll. */
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(onScroll) : null;
    ro?.observe(document.body);
    window.addEventListener("load", onScroll);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("load", onScroll);
      ro?.disconnect();
      reduced.removeEventListener("change", onReducedChange);
      clear();
    };
  }, [start, end]);

  return ref;
}
