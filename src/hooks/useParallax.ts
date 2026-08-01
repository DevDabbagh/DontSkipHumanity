"use client";

import { useRef } from "react";
import {
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";

/**
 * Cinematic scroll-linked parallax hook.
 *
 * Returns smooth MotionValues for different content layers so each layer
 * drifts at a different speed — images move most, text less, buttons least.
 * Everything is opacity-gated so elements materialise in sequence:
 * image → text → buttons.
 *
 * The scroll range starts early ("start end") so the NEXT section begins
 * appearing while the current one is still alive — documentary-film overlap.
 */

const SPRING = { stiffness: 80, damping: 30, mass: 0.8 };

export function useCinematicScroll() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const smooth = useSpring(scrollYProgress, SPRING);

  // Image: 30px travel (most movement)
  const imageY = useTransform(smooth, [0, 0.5, 1], [30, 0, -30]);
  // Text: 16px travel
  const textY = useTransform(smooth, [0, 0.5, 1], [16, 0, -16]);
  // Buttons: 10px travel (least movement)
  const buttonY = useTransform(smooth, [0, 0.5, 1], [10, 0, -10]);
  // Background decorative: 18px, slowest drift
  const bgY = useTransform(smooth, [0, 0.5, 1], [18, 0, -18]);

  // Staggered opacity — image first, text follows, buttons last
  const imageOpacity = useTransform(smooth, [0.05, 0.22, 0.82, 0.98], [0, 1, 1, 0]);
  const textOpacity = useTransform(smooth, [0.1, 0.27, 0.8, 0.96], [0, 1, 1, 0]);
  const buttonOpacity = useTransform(smooth, [0.15, 0.32, 0.78, 0.94], [0, 1, 1, 0]);

  return {
    ref,
    image: { y: imageY, opacity: imageOpacity },
    text: { y: textY, opacity: textOpacity },
    button: { y: buttonY, opacity: buttonOpacity },
    bg: { y: bgY },
  };
}

/**
 * Legacy parallax hook — kept for backward compatibility.
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
