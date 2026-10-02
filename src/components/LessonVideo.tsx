"use client";

import { useEffect, useRef } from "react";

/**
 * The player for a lesson someone chose to watch.
 *
 * WHY NOT HlsVideo
 *
 * `HlsVideo` is built for background loops: muted, autoplaying, no controls,
 * looping by default. A lesson is the opposite on every axis — sound on,
 * controls visible, never loops, and it must report when it ends so the lesson
 * can be marked complete. Bending one component to do both would mean a prop
 * that flips five behaviours at once, and the first caller to pass it wrong
 * gets a silent, looping, uncontrollable lecture.
 *
 * WHY IT IS ONLY MOUNTED AFTER A CLICK
 *
 * The parent renders this only once the visitor presses play. Two reasons:
 *   · Bytes. A 23-minute lesson's playlist and first segments are fetched the
 *     moment a <video> gets a source. Mounting it on page load would download
 *     video for every visitor who only came to read the curriculum.
 *   · Sound. Browsers allow unmuted playback only inside a user gesture; the
 *     click that mounts this is that gesture, so `play()` below is allowed.
 *
 * HLS
 *
 * Bunny serves an `.m3u8` playlist. Safari plays it natively; every other
 * browser needs hls.js, loaded dynamically so it never enters the bundle of a
 * page with no video.
 */
export default function LessonVideo({
  src,
  poster,
  onEnded,
  onFail,
}: {
  src: string;
  poster?: string;
  onEnded?: () => void;
  onFail?: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  /* Callbacks are held in refs so a parent re-render (new inline arrow) does
     not tear the player down and re-fetch the video — the exact shape of the
     bug that emptied the egress quota, documented in HlsVideo.tsx. */
  const endedRef = useRef(onEnded);
  const failRef = useRef(onFail);
  useEffect(() => {
    endedRef.current = onEnded;
    failRef.current = onFail;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || !src) return;

    const handleEnded = () => endedRef.current?.();
    el.addEventListener("ended", handleEnded);

    const isPlaylist = src.includes(".m3u8");
    const nativeHls = el.canPlayType("application/vnd.apple.mpegurl") !== "";

    if (isPlaylist && !nativeHls) {
      let cancelled = false;
      let destroy: (() => void) | undefined;

      void import("hls.js").then(({ default: Hls }) => {
        if (cancelled) return;
        if (!Hls.isSupported()) {
          failRef.current?.();
          return;
        }
        const hls = new Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(el);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          el.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data.fatal) failRef.current?.();
        });
        destroy = () => hls.destroy();
      });

      return () => {
        cancelled = true;
        el.removeEventListener("ended", handleEnded);
        // Without this, changing lesson leaves the old player pulling segments.
        destroy?.();
      };
    }

    el.src = src;
    el.play().catch(() => {});

    return () => {
      el.removeEventListener("ended", handleEnded);
      // `removeAttribute` + `load()` is what actually cancels an in-flight
      // download; `src = ""` does not.
      el.pause();
      el.removeAttribute("src");
      el.load();
    };
  }, [src]);

  return (
    <video
      ref={ref}
      poster={poster}
      controls
      playsInline
      preload="metadata"
      className="absolute inset-0 w-full h-full object-contain bg-black"
      onError={() => failRef.current?.()}
    />
  );
}
