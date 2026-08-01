"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { useCurtainReveal } from "@/hooks/useParallax";

/**
 * Curtain-reveal editorial section.
 *
 * The image starts covering 100% of the width — a cinematic full-bleed frame.
 * As the user scrolls, the image slides horizontally to 50%, uncovering the
 * text content beneath it like a curtain opening. All movement is scroll-linked.
 *
 * `mirrored` flips the direction: image slides from the right instead of left.
 */
export default function CurtainReveal({
  image,
  children,
  mirrored = false,
  className = "",
}: {
  image: ReactNode;
  children: ReactNode;
  mirrored?: boolean;
  className?: string;
}) {
  const { ref, imageWidth, textOpacity } = useCurtainReveal();

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
    >
      {/* ── Text layer: always present, positioned in the half that gets revealed ── */}
      <div
        className={`absolute top-0 bottom-0 w-1/2 flex items-center ${
          mirrored ? "left-0" : "right-0"
        }`}
      >
        <motion.div
          style={{ opacity: textOpacity }}
          className={`w-full ${
            mirrored
              ? "pr-14 pl-[max(2rem,calc((100vw-1400px)/2+2rem))]"
              : "pl-14 pr-[max(2rem,calc((100vw-1400px)/2+2rem))]"
          }`}
        >
          {children}
        </motion.div>
      </div>

      {/* ── Image curtain: starts at 100% width, slides to 50% ── */}
      <motion.div
        style={{ width: imageWidth }}
        className={`relative z-10 ${mirrored ? "ml-auto" : ""}`}
      >
        {image}
      </motion.div>
    </div>
  );
}
