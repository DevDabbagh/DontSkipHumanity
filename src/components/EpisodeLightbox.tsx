"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Studio "watch episode" lightbox — Figma `DSH – Studio Details – lightbox`
 * (726:566).
 *
 * Layout numbers come straight from that frame, measured on its 1920-wide
 * artboard:
 *   • player     1224 × 600, centred            (`726:591`)
 *   • Close      right-aligned to the player, 46px above it (`726:596`)
 *   • meta row   flush with the player's left edge, 24px below it (`726:614`)
 *                YALLA #8665A7 · Episode N #9D9C9C · Season N #363636,
 *                Inter Medium 12/100 (`Btn_Tags_Desktop`)
 *
 * Beyond the frame, and asked for explicitly: the centre circle plays/pauses,
 * a list button opens a right-hand drawer of seasons + episodes, and there is
 * YouTube-style theater and fullscreen. The frame has no open-drawer state, so
 * the drawer is built from the same tokens as the rest of the page.
 *
 * Playback deliberately goes through one `src`/provider seam: today every
 * episode is a direct MP4 (`videoProvider: "file"`). When the platform moves
 * to Bunny, only `resolveSource` below changes — the chrome, drawer, controls
 * and keyboard map stay as they are.
 */

export type LightboxEpisode = {
  title: string;
  description?: string;
  subtitle?: string;
  number?: number;
  season?: number;
  duration?: string;
  imageUrl?: string;
  slug?: string;
  videoUrl?: string;
  videoProvider?: "file" | "hls" | "bunny" | "embed";
};

/**
 * The one place that knows how a stored URL becomes something the player can
 * use. `file` is a plain MP4 the <video> element handles natively. `hls` and
 * `bunny` are accepted now so content can be entered ahead of the switch —
 * Safari plays HLS natively, other browsers will need hls.js wired in here.
 */
function resolveSource(ep: LightboxEpisode): { src: string; native: boolean } {
  const src = ep.videoUrl || "";
  const provider = ep.videoProvider || "file";
  if (!src) return { src: "", native: false };
  if (provider === "file") return { src, native: true };
  // HLS: native in Safari, needs a media-source shim elsewhere. Treated as
  // native so it at least plays where it can, rather than showing nothing.
  return { src, native: true };
}

function fmt(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return h > 0 ? `${h}:${mm}:${String(s).padStart(2, "0")}` : `${mm}:${String(s).padStart(2, "0")}`;
}

const META = "font-medium text-[12px] leading-[15px] tracking-[0]";

export default function EpisodeLightbox({
  open,
  onClose,
  projectTitle,
  episodes,
  initialIndex = 0,
}: {
  open: boolean;
  onClose: () => void;
  projectTitle: string;
  episodes: LightboxEpisode[];
  initialIndex?: number;
}) {
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(initialIndex);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [length, setLength] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [theater, setTheater] = useState(false);
  const [drawer, setDrawer] = useState(false);
  /**
   * The frame shows the player at rest with NO control bar — just the picture
   * and the centre circle. So the bar is hover-only, and the circle hides
   * while playing unless the pointer is over the player. `Close` and the meta
   * row are in the frame, so they stay put.
   */
  const [hover, setHover] = useState(false);
  /**
   * Playback failures used to be swallowed by `.catch(() => …)`, which left a
   * black rectangle and no explanation. Anything that stops the video —
   * a bad URL, a blocked host, an unsupported codec — lands here and is shown.
   */
  const [failed, setFailed] = useState<string | null>(null);
  /**
   * Has this episode ever started playing? Before the first play the frame's
   * resting state applies (no control bar). After it, a paused video always
   * shows its controls — otherwise pausing in fullscreen leaves you with no
   * visible way back to the buttons.
   */
  const [started, setStarted] = useState(false);
  /**
   * Touch devices have no hover, so a bar that only appears on pointer motion
   * would be unreachable there. On a coarse pointer a tap on the picture
   * toggles the controls instead of playing/pausing — the centre circle keeps
   * play/pause, exactly like a phone video player.
   */
  const [coarse, setCoarse] = useState(false);
  const [season, setSeason] = useState<number | null>(null);

  /** True while the browser is showing this lightbox fullscreen. */
  const [fs, setFs] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Mirrors `drawer` so the auto-hide timeout reads the current value. */
  const drawerRef = useRef(false);

  const ep = episodes[index];
  const { src } = ep ? resolveSource(ep) : { src: "" };

  useEffect(() => {
    setMounted(true);
    setCoarse(window.matchMedia?.("(pointer: coarse)").matches ?? false);
  }, []);

  // Re-seat on the episode the caller asked for each time the lightbox opens,
  // so reopening from a different row doesn't resume the previous episode.
  useEffect(() => {
    if (open) {
      setIndex(initialIndex);
      setSeason(episodes[initialIndex]?.season ?? null);
      setDrawer(false);
    }
  }, [open, initialIndex, episodes]);

  /* Page must not scroll behind the overlay. */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  /* Switching episodes resets the transport but keeps the lightbox open. */
  useEffect(() => {
    setTime(0);
    setLength(0);
    setBuffered(0);
    setPlaying(false);
    setFailed(null);
    setStarted(false);
  }, [index]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    if (v.paused) {
      v.play().catch((e: DOMException) => {
        setPlaying(false);
        setFailed(`${e.name}: ${e.message}`);
      });
    } else v.pause();
  }, [src]);

  const toggleFullscreen = useCallback(() => {
    const el = shellRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else el.requestFullscreen?.().catch(() => {});
  }, []);

  const seekBy = useCallback((delta: number) => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(v.duration)) return;
    v.currentTime = Math.min(Math.max(v.currentTime + delta, 0), v.duration);
  }, []);

  /**
   * Pointer activity keeps the controls up. Moving the mouse counts as hover
   * even if it entered without a mouseenter (e.g. after fullscreen), and the
   * bar fades again 2.6s after the pointer goes still — but only while the
   * video is actually playing, so a paused player never strands the user
   * without controls.
   */
  const wake = useCallback(() => {
    setHover(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      // Only a playing video is allowed to hide its controls. Paused — or
      // with the episode drawer open — they stay put, so there is always a
      // way back to the buttons.
      setHover((h) => {
        const v = videoRef.current;
        return v && !v.paused && !drawerRef.current ? false : h;
      });
    }, 2600);
  }, []);

  useEffect(() => {
    drawerRef.current = drawer;
    if (drawer) setHover(true);
  }, [drawer]);

  /* Follow the browser's fullscreen state — the user can also leave it with
     Esc or the system chrome, not just our button. */
  useEffect(() => {
    const onFs = () => {
      setFs(Boolean(document.fullscreenElement));
      setHover(true);
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  /* Keyboard map — mirrors YouTube's, plus Esc to leave. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      switch (e.key) {
        case "Escape":
          // Fullscreen swallows Esc itself; the drawer is the next layer down.
          if (drawer) setDrawer(false);
          else onClose();
          break;
        case " ":
        case "k":
        case "K":
          e.preventDefault();
          togglePlay();
          wake();
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        case "t":
        case "T":
          setTheater((v) => !v);
          break;
        case "m":
        case "M":
          setMuted((v) => !v);
          break;
        case "ArrowRight":
          seekBy(5);
          wake();
          break;
        case "ArrowLeft":
          seekBy(-5);
          wake();
          break;
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, drawer, onClose, togglePlay, toggleFullscreen, seekBy, wake]);

  /* Keep the element the source of truth for volume/mute. */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = volume;
    v.muted = muted;
  }, [volume, muted]);

  if (!mounted || !open || !ep) return null;

  const seasons = Array.from(
    new Set(episodes.map((e) => e.season ?? 1))
  ).sort((a, b) => a - b);
  const activeSeason = season ?? ep.season ?? seasons[0] ?? 1;
  const inSeason = episodes
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => (e.season ?? 1) === activeSeason);

  /**
   * The control bar is visible when the pointer is active, when the episode
   * drawer is open, or whenever a video that has already started is paused.
   * That last clause is the safety net: pausing — by click, space or Esc out
   * of fullscreen — always brings the buttons back.
   */
  const showBar = hover || drawer || (started && !playing);

  const pct = length > 0 ? (time / length) * 100 : 0;
  const bufPct = length > 0 ? (buffered / length) * 100 : 0;

  const scrub = (clientX: number, el: HTMLElement) => {
    const v = videoRef.current;
    const rect = el.getBoundingClientRect();
    if (!v || !Number.isFinite(v.duration) || rect.width === 0) return;
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    v.currentTime = ratio * v.duration;
    setTime(v.currentTime);
  };

  return createPortal(
    <div
      ref={shellRef}
      /* dvh, not vh: on mobile browsers the collapsing URL bar makes 100vh
         taller than the visible area, which would push the control bar off
         the bottom of the screen. */
      className="fixed inset-0 z-[120] h-[100dvh] bg-[#0D0D0D]/95 backdrop-blur-[2px] flex flex-col items-center justify-center overflow-hidden"
      onMouseMove={wake}
      role="dialog"
      aria-modal="true"
      aria-label={`${projectTitle} — ${ep.title}`}
    >
      {/* Backdrop click closes. Kept as its own layer so clicks on the player,
          controls or drawer never bubble into a close. */}
      <button
        aria-label="Close player"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 w-full h-full cursor-default"
      />

      <div
        /* Theater used to be `w-[94vw]` with a fixed ratio, which on a laptop
           made the box TALLER than the window — the control bar fell below the
           bottom edge and there was no way to reach it. Theater and fullscreen
           are now both height-bound: the player takes the space that is left
           after the chrome, so the bar is always on screen. */
        className={`relative flex flex-col ${
          fs
            ? "w-screen h-[100dvh]"
            : theater
              ? "w-[94vw] h-[100dvh] py-[20px]"
              : "w-[94vw] sm:w-[min(1224px,86vw)]"
        }`}
        style={{ transition: fs ? undefined : "width 220ms ease" }}
      >
        {/* Close — Figma 726:596: sits above the player, right edge aligned.
            Present in the frame's resting state, so it never fades out.
            Fullscreen gives the picture the whole screen instead; Esc or the
            fullscreen button brings this chrome back. */}
        <div className={`justify-end mb-[16px] sm:mb-[30px] ${fs ? "hidden" : "flex"}`}>
          <button
            onClick={onClose}
            className="group flex items-center gap-[7px] text-[13px] font-medium text-[#9D9C9C] hover:text-[#F0F0F0] transition-colors"
          >
            Close
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
              <path
                d="M1 1L8 8M8 1L1 8"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Player — 1224×600 in the frame; object-contain so a 16:9 master
            letterboxes inside the design's wider box instead of cropping. */}
        <div
          className={`relative w-full bg-black overflow-hidden ${fs ? "" : "rounded-[2px]"}`}
          /* Fullscreen fills the screen and lets object-contain letterbox the
             master; otherwise the frame's 1224×600 box (16:9 in theater). */
          style={
            fs || theater
              ? { flex: "1 1 auto", minHeight: 0 }
              : { aspectRatio: "1224 / 600" }
          }
          onClick={() => {
            if (!coarse) return togglePlay();
            if (showBar) setHover(false);
            else wake();
          }}
        >
          {src ? (
            <video
              ref={videoRef}
              src={src}
              poster={ep.imageUrl}
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-contain"
              onPlay={() => {
                setPlaying(true);
                setStarted(true);
                wake();
              }}
              // Pausing returns the player to the frame's resting state: the
              // centre circle comes back on its own because `playing` is false,
              // and the control bar stays hover-only.
              onPause={() => setPlaying(false)}
              onLoadedMetadata={(e) => setLength(e.currentTarget.duration || 0)}
              onError={(e) => {
                const err = e.currentTarget.error;
                const why: Record<number, string> = {
                  1: "Loading was aborted.",
                  2: "Network error — the video host could not be reached.",
                  3: "The file is corrupt or uses an unsupported codec.",
                  4: "The URL is wrong, blocked, or the format isn't supported.",
                };
                setFailed(err ? why[err.code] ?? `Media error ${err.code}` : "Playback failed.");
              }}
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                setTime(v.currentTime);
                if (v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1));
              }}
              onEnded={() => {
                setPlaying(false);
                // Roll into the next episode of the same run, like a series
                // player — but only forward, never wrapping back to episode 1.
                if (index + 1 < episodes.length && episodes[index + 1]?.videoUrl) {
                  setIndex(index + 1);
                }
              }}
            />
          ) : (
            <>
              {ep.imageUrl && (
                <img
                  src={ep.imageUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                <p className="text-[14px] leading-[22px] text-[#9D9C9C] max-w-[420px]">
                  This episode has no video yet.
                </p>
              </div>
            </>
          )}

          {/* Playback failure — says what went wrong instead of leaving a
              black rectangle, and offers the details page as a way out. */}
          {failed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-[10px] px-6 text-center bg-black/70">
              <p className="text-[14px] leading-[22px] text-[#F0F0F0] max-w-[460px]">
                This episode couldn&rsquo;t be played.
              </p>
              <p className="text-[12px] leading-[18px] text-[#9D9C9C] max-w-[460px]">{failed}</p>
            </div>
          )}

          {/* Centre circle — play/pause, per the frame. Hidden while playing
              so it doesn't sit on top of the picture. */}
          {src && !failed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              aria-label={playing ? "Pause" : "Play"}
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[56px] h-[56px] rounded-full border border-[rgba(240,240,240,0.3)] bg-[rgba(0,0,0,0.25)] backdrop-blur-[2px] flex items-center justify-center hover:border-[rgba(240,240,240,0.6)] hover:bg-[rgba(0,0,0,0.4)] transition-all duration-200 ${
                playing && !showBar ? "opacity-0 pointer-events-none scale-90" : "opacity-100"
              }`}
            >
              {playing ? (
                <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true">
                  <rect x="0" y="0" width="4.5" height="16" rx="1" fill="#F0F0F0" />
                  <rect x="9.5" y="0" width="4.5" height="16" rx="1" fill="#F0F0F0" />
                </svg>
              ) : (
                <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true">
                  <path d="M1 1.3v15.4L15 9 1 1.3Z" fill="#F0F0F0" />
                </svg>
              )}
            </button>
          )}

          {/* Control bar */}
          {src && (
            <div
              onClick={(e) => e.stopPropagation()}
              className={`absolute left-0 right-0 bottom-0 px-[10px] sm:px-[18px] pb-[10px] sm:pb-[14px] pt-[40px] bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-200 ${
                showBar ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              {/* Scrubber */}
              <div
                className="group relative h-[14px] flex items-center cursor-pointer"
                onPointerDown={(e) => {
                  const el = e.currentTarget;
                  el.setPointerCapture(e.pointerId);
                  scrub(e.clientX, el);
                }}
                onPointerMove={(e) => {
                  if (e.buttons === 1) scrub(e.clientX, e.currentTarget);
                }}
              >
                <div className="relative w-full h-[3px] bg-[rgba(240,240,240,0.2)] rounded-full">
                  <div
                    className="absolute inset-y-0 left-0 bg-[rgba(240,240,240,0.3)] rounded-full"
                    style={{ width: `${bufPct}%` }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 bg-[#8665A7] rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                  <span
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[11px] h-[11px] rounded-full bg-[#8665A7] opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-[12px] sm:gap-[16px] mt-[8px]">
                <button
                  onClick={togglePlay}
                  aria-label={playing ? "Pause" : "Play"}
                  className="text-[#F0F0F0] hover:text-white"
                >
                  {playing ? (
                    <svg width="11" height="13" viewBox="0 0 11 13" aria-hidden="true">
                      <rect x="0" y="0" width="3.5" height="13" rx="1" fill="currentColor" />
                      <rect x="7.5" y="0" width="3.5" height="13" rx="1" fill="currentColor" />
                    </svg>
                  ) : (
                    <svg width="12" height="13" viewBox="0 0 12 13" aria-hidden="true">
                      <path d="M1 1v11l10-5.5L1 1Z" fill="currentColor" />
                    </svg>
                  )}
                </button>

                {/* Volume */}
                {/* Phones have hardware volume; the slider only earns its
                    width on a pointer device. */}
                <div className="hidden sm:flex items-center gap-[8px] group/vol">
                  <button
                    onClick={() => setMuted((v) => !v)}
                    aria-label={muted ? "Unmute" : "Mute"}
                    className="text-[#F0F0F0] hover:text-white"
                  >
                    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" aria-hidden="true">
                      <path d="M1 5h3l4-3.5v11L4 9H1V5Z" fill="currentColor" />
                      {!muted && volume > 0 ? (
                        <>
                          <path
                            d="M10.5 4.6a3.4 3.4 0 0 1 0 4.8"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                          />
                          <path
                            d="M12.7 2.4a6.4 6.4 0 0 1 0 9.2"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                          />
                        </>
                      ) : (
                        <path
                          d="M10.5 4.8l4 4.4M14.5 4.8l-4 4.4"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                        />
                      )}
                    </svg>
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={muted ? 0 : volume}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setVolume(val);
                      setMuted(val === 0);
                    }}
                    aria-label="Volume"
                    /* Collapsed to nothing until hover — without the opacity
                       the range thumb still paints as a stray purple dot. */
                    className="w-0 opacity-0 group-hover/vol:w-[72px] group-hover/vol:opacity-100 transition-all duration-200 accent-[#8665A7] h-[3px] cursor-pointer"
                  />
                </div>

                <span className={`${META} text-[#9D9C9C] tabular-nums`}>
                  {fmt(time)} / {length ? fmt(length) : ep.duration || "0:00"}
                </span>

                <div className="flex-1" />

                {/* Episodes drawer */}
                <button
                  onClick={() => setDrawer((v) => !v)}
                  aria-label="Episodes and seasons"
                  aria-expanded={drawer}
                  className={`transition-colors ${
                    drawer ? "text-[#8665A7]" : "text-[#F0F0F0] hover:text-white"
                  }`}
                >
                  <svg width="17" height="13" viewBox="0 0 17 13" fill="none" aria-hidden="true">
                    <path
                      d="M0.8 1.2h10M0.8 6.5h10M0.8 11.8h10"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                    <path d="M13.4 4.2 16.2 6.5l-2.8 2.3V4.2Z" fill="currentColor" />
                  </svg>
                </button>

                {/* Theater */}
                <button
                  onClick={() => {
                    setTheater((v) => !v);
                    wake();
                  }}
                  aria-label={theater ? "Default view" : "Theater mode"}
                  aria-pressed={theater}
                  /* Theater is a desktop idea — on a phone the player is
                     already the full width, so the button would do nothing. */
                  className={`hidden sm:block transition-colors ${
                    theater ? "text-[#8665A7]" : "text-[#F0F0F0] hover:text-white"
                  }`}
                >
                  <svg width="17" height="13" viewBox="0 0 17 13" fill="none" aria-hidden="true">
                    <rect
                      x="0.9"
                      y="2.4"
                      width="15.2"
                      height="8.2"
                      rx="1.4"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                  </svg>
                </button>

                {/* Fullscreen */}
                <button
                  onClick={() => {
                    toggleFullscreen();
                    wake();
                  }}
                  aria-label={fs ? "Exit fullscreen" : "Fullscreen"}
                  className="text-[#F0F0F0] hover:text-white"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                      d="M1 5V1h4M13 5V1H9M1 9v4h4M13 9v4H9"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Seasons + episodes drawer — slides in over the right of the
              player, so the picture stays visible while browsing. */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-0 right-0 h-full w-[min(380px,80%)] bg-[rgba(13,13,13,0.94)] backdrop-blur-[6px] border-l border-[rgba(240,240,240,0.1)] flex flex-col"
            /* Slid with an inline transform rather than `translate-x-full`:
               the utility class resolved to `transform: none` here, so the
               closed drawer stayed sitting on top of the video. */
            style={{
              transform: drawer ? "translateX(0)" : "translateX(100%)",
              transition: "transform 250ms ease-out",
              pointerEvents: drawer ? "auto" : "none",
            }}
            aria-hidden={!drawer}
          >
            <div className="flex items-center justify-between px-[18px] pt-[16px] pb-[12px]">
              <p className="text-[10px] leading-[24px] tracking-[1.6px] uppercase text-[#363636]">
                Episodes
              </p>
              <button
                onClick={() => setDrawer(false)}
                aria-label="Close episode list"
                className="text-[#9D9C9C] hover:text-[#F0F0F0]"
              >
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
                  <path
                    d="M1 1L8 8M8 1L1 8"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {seasons.length > 1 && (
              <div className="flex gap-[8px] px-[18px] pb-[12px] flex-wrap">
                {seasons.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSeason(s)}
                    className={`${META} px-[8px] py-[5px] rounded-[3px] transition-colors ${
                      s === activeSeason
                        ? "bg-[#573377] text-[#F0F0F0]"
                        : "bg-[rgba(240,240,240,0.06)] text-[#9D9C9C] hover:text-[#F0F0F0]"
                    }`}
                  >
                    Season {s}
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-[10px] pb-[16px] flex flex-col gap-[4px]">
              {inSeason.map(({ e, i }) => (
                <button
                  key={`${e.slug || e.title}-${i}`}
                  onClick={() => {
                    setIndex(i);
                    setDrawer(false);
                  }}
                  className={`flex gap-[12px] items-start text-left p-[8px] rounded-[4px] transition-colors ${
                    i === index ? "bg-[rgba(134,101,167,0.16)]" : "hover:bg-[rgba(240,240,240,0.05)]"
                  }`}
                >
                  <div className="relative w-[92px] h-[56px] shrink-0 rounded-[3px] overflow-hidden bg-[#131313]">
                    {e.imageUrl && (
                      <img src={e.imageUrl} alt="" className="w-full h-full object-cover" />
                    )}
                    {!e.videoUrl && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-[9px] uppercase tracking-[1px] text-[#9D9C9C]">
                        Soon
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`${META} ${
                        i === index ? "text-[#8665A7]" : "text-[#9D9C9C]"
                      } mb-[4px]`}
                    >
                      Episode {e.number ?? i + 1}
                      {e.duration ? ` · ${e.duration}` : ""}
                    </p>
                    <p className="text-[13px] leading-[17px] font-semibold text-[#F0F0F0] truncate">
                      {e.title}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Meta row — Figma 726:614. In the frame at rest, so always shown
            (except fullscreen, where the picture takes the whole screen). */}
        <div className={`items-center gap-[10px] mt-[24px] ${fs || theater ? "hidden" : "flex"}`}>
          <span className={`${META} uppercase text-[#8665A7]`}>{projectTitle}</span>
          <span className={`${META} text-[#9D9C9C]`}>Episode {ep.number ?? index + 1}</span>
          <span className={`${META} text-[#363636]`}>Season {ep.season ?? 1}</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
