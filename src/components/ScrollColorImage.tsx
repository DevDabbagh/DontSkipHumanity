"use client";

import { useScrollGrayscale } from "@/hooks/useScrollGrayscale";

/**
 * An image that starts fully black & white and smoothly gains its real
 * color as it scrolls into view — the same treatment used across the
 * full-bleed image rows (Films/Studio, Journalism, In Focus, Notebook).
 * `className` controls sizing/aspect ratio on the wrapper; the image itself
 * always fills it via object-cover.
 */
export default function ScrollColorImage({
  src,
  alt,
  className = "",
  imgClassName = "",
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}) {
  const { ref, colorAmount } = useScrollGrayscale<HTMLDivElement>();

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-[filter] duration-100 ease-out ${imgClassName}`}
        style={{ filter: `grayscale(${1 - colorAmount})` }}
      />
    </div>
  );
}
