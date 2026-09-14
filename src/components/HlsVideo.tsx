"use client";

import { useEffect, useRef } from "react";

/**
 * The one `<video>` element on the site.
 *
 * WHY IT IS SHARED
 *
 * There were two of these — one in `Hero.tsx`, one in
 * `academy/FeaturedSlider.tsx` — identical apart from a `style` prop. When
 * hero video moved to Bunny Stream, only the first was taught to play HLS,
 * and the Academy slider would have shown a black rectangle in every browser
 * except Safari. Nobody would have noticed until someone put a video on an
 * Academy slide.
 *
 * One component, two callers, and the next change happens once.
 *
 * WHY HLS NEEDS HELP AT ALL
 *
 * Bunny serves `.m3u8` playlists rather than a single MP4, so a weak
 * connection drops to a lower rendition instead of stalling. Safari plays
 * those natively; Chrome, Firefox and Edge do not. hls.js fills the gap — and
 * is imported dynamically, so it stays out of the bundle for anyone whose
 * browser does not need it and out of it entirely on a page with no video.
 */
export default function HlsVideo({
  src,
  className,
  style,
  onFail,
  loop = true,
}: {
  src: string;
  className: string;
  style?: React.CSSProperties;
  onFail: () => void;
  /**
   * Background clips loop; anything the reader chose to watch should not.
   *
   * Defaults to true because both current callers are decorative, but it is a
   * prop rather than a constant because looping is what turned a 9.4MB hero
   * clip into six gigabytes of egress in the app. Whoever adds the third
   * caller should have to think about it.
   */
  loop?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  // `onFail` IS HELD IN A REF, AND THAT IS NOT A STYLE CHOICE
  //
  // Both callers pass an inline arrow — `onFail={() => setFailed(true)}` —
  // which is a new function on every render. With it in the effect's
  // dependencies, any re-render of the parent would tear the player down and
  // build it again, and the video would be fetched from scratch each time.
  //
  // That is precisely the failure that emptied the project's egress quota,
  // and it would have been reintroduced here by a component that looks
  // correct. The ref keeps the latest callback reachable while leaving the
  // effect keyed on `src` alone.
  const onFailRef = useRef(onFail);

  // Updated in an effect, not during render: writing to a ref while
  // rendering is what React's `react-hooks/refs` rule exists to catch, and
  // this one runs after every render so the callback is never stale.
  useEffect(() => {
    onFailRef.current = onFail;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Set as a DOM property, not just an attribute: some browsers ignore
    // `autoPlay` after a client-side re-render unless `.muted` is really true.
    el.muted = true;

    const isPlaylist = src.includes(".m3u8");
    const nativeHls = el.canPlayType("application/vnd.apple.mpegurl") !== "";

    if (isPlaylist && !nativeHls) {
      let cancelled = false;
      let destroy: (() => void) | undefined;

      void import("hls.js").then(({ default: Hls }) => {
        if (cancelled) return;

        if (!Hls.isSupported()) {
          onFailRef.current();
          return;
        }

        const hls = new Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(el);
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) onFailRef.current();
        });

        destroy = () => hls.destroy();
      });

      return () => {
        cancelled = true;
        // Without this, moving to the next slide leaves a detached player
        // still pulling segments in the background — which is the same shape
        // as the bug that spent the project's whole egress quota, one layer up.
        destroy?.();
      };
    }

    // Native playback: an MP4 anywhere, or a playlist in Safari.
    el.src = src;
    const playing = el.play();
    if (playing) playing.catch(() => {});

    return () => {
      // Stop the download on unmount. `removeAttribute` then `load()` is what
      // actually cancels an in-flight fetch; setting `src = ""` does not.
      el.pause();
      el.removeAttribute("src");
      el.load();
    };
  }, [src]);

  // `src` is assigned in the effect rather than as a JSX attribute: hls.js
  // attaches its own MediaSource, and a competing `src` would make the element
  // try to load the playlist as a plain file at the same time.
  return (
    <video
      ref={ref}
      className={className}
      style={style}
      muted
      loop={loop}
      playsInline
      autoPlay
      onError={() => onFailRef.current()}
    />
  );
}
