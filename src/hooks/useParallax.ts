"use client";

import { useRef } from "react";
import {
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";

const SPRING = { stiffness: 60, damping: 28, mass: 0.9 };

/**
 * Curtain-reveal hook for editorial sections.
 *
 * The image starts covering 100% of the container width.
 * As the user scrolls, the image slides horizontally to ~50%,
 * uncovering the text content behind it — like a curtain opening.
 *
 * All movement is scroll-linked. No autoplay, no timers.
 */
export function useCurtainReveal() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    // Animation plays from when section top hits 90% of viewport
    // to when section top reaches 25% of viewport
    offset: ["start 90%", "start 25%"],
  });

  const smooth = useSpring(scrollYProgress, SPRING);

  // Image container width: 100% → 50%
  const imageWidth = useTransform(smooth, [0, 1], ["100%", "50%"]);

  // Text opacity: very subtle — primary reveal comes from the curtain movement
  // Text starts becoming visible once the curtain is ~30% open
  const textOpacity = useTransform(smooth, [0.3, 0.7], [0, 1]);

  return {
    ref,
    imageWidth,
    textOpacity,
    progress: smooth,
  };
}

/**
 * Legacy parallax hook — kept for backward compatibility (FilmsListing).
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(speed = 0.25) {
  const ref = useRef<T>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, SPRING);
  const offset = useTransform(smooth, [0, 0.5, 1], [50 * speed, 0, -50 * speed]);
  return { ref, offset };
}
