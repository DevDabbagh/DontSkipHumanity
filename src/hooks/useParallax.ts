"use client";

import { useRef } from "react";
import {
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";

const SPRING = { stiffness: 60, damping: 28, mass: 0.9 };

/**
 * Legacy parallax hook — used by FilmsListing for background drift.
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
