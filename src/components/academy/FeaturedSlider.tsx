"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SliderSlide } from "@/lib/landing";

const SLIDE_DURATION = 6000;
const VIDEO_REVEAL_DELAY = 2000;

/**
 * Plays a slide's video. Explicitly sets `.muted` and calls `.play()` itself
 * instead of relying only on the `autoPlay` attribute, which some browsers
 * ignore after a client-side re-render.
 */
function SlideVideo({ src, className, style, onFail }: {
  src: string; className: string; style?: React.CSSProperties; onFail: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true;
    const playPromise = el.play();
    if (playPromise) playPromise.catch(() => {});
  }, [src]);

  return <video ref={ref} src={src} className={className} style={style} muted loop playsInline autoPlay onError={onFail} />;
}

/**
 * Holds a slide's poster on screen for a beat after it becomes active, then
 * fades the video in on top of it instead of jump-cutting into playback. The
 * reveal fade lives on a wrapper div so it composes cleanly with the slide's
 * own dim `style` (e.g. opacity 0.55) instead of fighting over the same
 * opacity value. Only ever rendered while its slide is active (the caller
 * mounts/unmounts it), so a fresh mount is all the "reset" it needs. Falls
 * back to the poster (renders nothing here) if the video fails to load.
 */
function SlideMedia({ mediaSrc, className, style }: { mediaSrc: string; className: string; style?: React.CSSProperties }) {
  const [reveal, setReveal] = useState(false);
  const [entered, setEntered] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReveal(true), VIDEO_REVEAL_DELAY);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!reveal) return;
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [reveal]);

  if (!reveal || failed) return null;

  return (
    <div className="absolute inset-0 transition-opacity duration-700 ease-out" style={{ opacity: entered ? 1 : 0 }}>
      <SlideVideo src={mediaSrc} className={className} style={style} onFail={() => setFailed(true)} />
    </div>
  );
}

export default function FeaturedSlider({ slides }: { slides: SliderSlide[] }) {
  const [current, setCurrent] = useState(0);
  const [textKey, setTextKey] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progressKey, setProgressKey] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = slides.length;

  const goTo = useCallback(
    (idx: number) => {
      const next = ((idx % total) + total) % total;
      setCurrent(next);
      setTextKey((k) => k + 1);
      setProgressKey((k) => k + 1);
    },
    [total]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (!total) return;
    if (isPlaying) intervalRef.current = setInterval(next, SLIDE_DURATION);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, next, total]);

  if (!total) return null;

  const slide = slides[current];

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: 520, background: "#0D0D0D" }}
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      <div className="slider-track absolute inset-0" style={{ transform: `translateX(-${current * 100}%)` }}>
        {slides.map((s, i) => (
          <div key={s.id} className="relative flex-shrink-0 w-full h-full" style={{ width: "100%" }}>
            {/* Poster is always the base layer — the video (once active) plays on top
                of it, so a failed/slow video never shows a broken black box. */}
            {s.poster && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.poster}
                alt={s.title}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: 0.55 }}
                loading={i === 0 ? "eager" : "lazy"}
              />
            )}
            {s.mediaType === "video" && i === current && (
              <SlideMedia
                key={s.id}
                mediaSrc={s.mediaSrc}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: 0.55 }}
              />
            )}
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to bottom, rgba(13,13,13,0.1) 0%, rgba(13,13,13,0.6) 55%, #0D0D0D 100%)" }}
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to right, rgba(13,13,13,0.55) 0%, rgba(13,13,13,0) 55%)" }}
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 flex flex-col justify-end">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 w-full pb-12">
          <div key={textKey} className="slide-text-enter">
            <div className="flex gap-2 mb-4">
              {slide.badge && (
                <span
                  className="text-[11px] font-medium px-3 py-1"
                  style={{ borderRadius: 3, background: "rgba(155,89,182,0.15)", color: "#9B59B6", border: "1px solid rgba(155,89,182,0.3)" }}
                >
                  {slide.badge}
                </span>
              )}
              {slide.isFree && (
                <span
                  className="text-[11px] font-medium px-3 py-1"
                  style={{ borderRadius: 3, background: "rgba(26,188,156,0.13)", color: "#1ABC9C", border: "1px solid rgba(26,188,156,0.3)" }}
                >
                  Free
                </span>
              )}
            </div>
            <h2 className="font-bold leading-[1.1] mb-3" style={{ fontSize: 42, color: "#F0F0F0", maxWidth: 620 }}>
              {slide.title}
            </h2>
            {slide.description && (
              <p className="text-[15px] leading-relaxed mb-5" style={{ color: "#888", maxWidth: 500 }}>
                {slide.description}
              </p>
            )}
            <div className="flex items-center gap-6">
              <Link
                href={slide.href}
                className="rounded-[3px] text-white font-medium transition-opacity hover:opacity-90 px-5 py-3 text-[14px]"
                style={{ background: "linear-gradient(135deg, #9B59B6, #1ABC9C)" }}
              >
                View Course
              </Link>
              {(slide.duration || slide.whoLeads) && (
                <span className="text-[13px]" style={{ color: "#666" }}>
                  {[slide.duration, slide.whoLeads && `Led by ${slide.whoLeads}`].filter(Boolean).join(" · ")}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-5 mt-8">
            <div className="flex gap-2">
              {slides.map((s, i) => {
                const active = i === current;
                return (
                  <button
                    key={s.id}
                    onClick={() => goTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className="rounded-full overflow-hidden transition-all duration-300"
                    style={{
                      width: active ? 28 : 6,
                      height: 6,
                      background: "rgba(255,255,255,0.18)",
                    }}
                  >
                    {active && (
                      <span
                        key={progressKey}
                        style={{
                          display: "block",
                          height: "100%",
                          width: "0%",
                          background: "linear-gradient(to right, #9B59B6, #1ABC9C)",
                          animation: `sliderProgressBar ${SLIDE_DURATION}ms linear forwards`,
                          animationPlayState: isPlaying ? "running" : "paused",
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <span className="text-[12px]" style={{ color: "#555" }}>
              {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            <div className="flex gap-2 ml-auto">
              <button
                onClick={prev}
                aria-label="Previous slide"
                className="nav-arrow w-9 h-9 rounded-full flex items-center justify-center"
                style={{ border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth={2}>
                  <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={next}
                aria-label="Next slide"
                className="nav-arrow w-9 h-9 rounded-full flex items-center justify-center"
                style={{ border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth={2}>
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0" style={{ height: 2, background: "rgba(255,255,255,0.06)" }}>
        <div
          key={progressKey}
          style={{
            height: "100%",
            background: "linear-gradient(to right, #9B59B6, #1ABC9C)",
            animation: `sliderProgressBar ${SLIDE_DURATION}ms linear forwards`,
            animationPlayState: isPlaying ? "running" : "paused",
          }}
        />
      </div>
    </div>
  );
}
