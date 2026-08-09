"use client";

import { useEffect } from "react";

/**
 * On-platform trailer player. Opens in a modal over the site and plays the
 * video with a native <video> element (source is our own hosted URL — no
 * Vimeo/YouTube redirect or embed). Close with the X, the backdrop, or Esc.
 */
export default function TrailerModal({
  open,
  onClose,
  src,
  poster,
  title,
}: {
  open: boolean;
  onClose: () => void;
  src: string;
  poster?: string;
  title?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title ? `${title} — trailer` : "Trailer"}
    >
      <button
        onClick={onClose}
        aria-label="Close trailer"
        className="absolute top-5 right-5 sm:top-7 sm:right-7 text-white/60 hover:text-white transition-colors"
      >
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div
        className="relative w-full max-w-[1100px] aspect-video"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          src={src}
          poster={poster}
          controls
          autoPlay
          playsInline
          controlsList="nodownload"
          className="w-full h-full rounded-[4px] bg-black"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
