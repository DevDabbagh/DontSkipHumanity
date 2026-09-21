"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A short background loop that must not stutter.
 *
 * NOT `HlsVideo`, AND THE DIFFERENCE IS THE WHOLE POINT
 *
 * `HlsVideo` is right for watch-content: it loads hls.js, attaches a
 * MediaSource and plays an adaptive ladder, so a phone on a weak connection
 * drops a rendition instead of stalling. Over ninety minutes that is the
 * difference between watchable and abandoned.
 *
 * Over a five-second hero loop it is the wrong trade and it is the reason the
 * slider stuttered. Before the first frame appears HLS needs the master
 * playlist, then the variant playlist, then the first segment — three round
 * trips — and in every browser except Safari it must first download and run
 * hls.js to do any of it. A plain MP4 starts painting after one range
 * request. The adaptive ladder buys nothing on a loop; the latency costs the
 * one thing the slider cannot afford.
 *
 * WHY SEVERAL `<source>` ELEMENTS
 *
 * Bunny only generates the renditions enabled under the library's Encoding
 * tab, and only for videos uploaded after MP4 Fallback was switched on. A
 * single hard-coded `play_720p.mp4` would 404 into a dead slide the day
 * somebody unticks 720p — a change made in a different system, with nothing
 * near this code to explain it. A `<source>` per candidate lets the browser
 * take the first that loads, which is what source fallback exists for, and
 * `videoSourceLadder` puts the HLS playlist last so older videos still play.
 */
export default function LoopVideo({
  sources,
  poster,
  className,
  style,
  onFail,
}: {
  /** Ordered candidates, best first. See `videoSourceLadder`. */
  sources: string[];
  poster?: string;
  className?: string;
  style?: React.CSSProperties;
  onFail?: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [dead, setDead] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* `<video>` fires `error` on the element only once every `<source>` has
       failed — which is exactly the signal we want, and exactly why the
       fallback chain has to be expressed as sources rather than by swapping
       `src` ourselves. */
    const fail = () => {
      setDead(true);
      onFail?.();
    };
    el.addEventListener("error", fail);

    /* Autoplay is refused unless the video is muted, and the refusal is a
       rejected promise rather than an exception — unhandled, it shows up in
       the console as noise and the poster silently stays up. Caught, we can
       at least treat it as a failure and let the caller keep the poster
       deliberately. */
    void el.play().catch(() => {
      /* A refused autoplay is not a broken video: iOS Low Power Mode does
         this routinely. The poster underneath is a perfectly good outcome, so
         this is swallowed rather than escalated to `onFail`. */
    });

    return () => el.removeEventListener("error", fail);
  }, [onFail, sources]);

  if (dead || sources.length === 0) return null;

  return (
    <video
      ref={ref}
      className={className}
      style={style}
      poster={poster}
      // muted is what makes autoplay permissible at all; playsInline stops
      // iOS taking the video fullscreen the moment it starts.
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
      // No controls, no right-click menu — it is set dressing, not a player.
      disablePictureInPicture
      controls={false}
    >
      {sources.map((src) => (
        <source
          key={src}
          src={src}
          type={src.endsWith(".m3u8") ? "application/vnd.apple.mpegurl" : "video/mp4"}
        />
      ))}
    </video>
  );
}
