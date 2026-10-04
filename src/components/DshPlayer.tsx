"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The DSH inline video player — the Studio episode player's look and controls
 * (EpisodeLightbox), as a component that lives in a page instead of a modal.
 *
 * What it adds over a bare <video>:
 *   · the Studio chrome: centre circle, hover-only bar, scrubber with the
 *     buffered range, volume, time, theater, fullscreen
 *   · QUALITY: Auto or a fixed rendition, read from the HLS playlist's own
 *     levels (Bunny encodes 240p–1080p; the menu lists what is really there)
 *   · SPEED: 0.75× – 2×, which a lecture needs and a film does not
 *   · the same keyboard map as Studio: space/K, ←/→, F, T, M
 *
 * Theater is owned by the page (`theater` / `onTheaterChange`), because in a
 * page "theater" means the layout around the player changes — the Academy hides
 * its playlist — not just the player's own size.
 *
 * Bytes: hls.js is created with autoStartLoad off and only starts fetching
 * segments on the first play. Opening a lesson costs the playlist file, not
 * the video — the egress lesson recorded in HlsVideo.tsx.
 */
export default function DshPlayer({
  src,
  poster,
  title,
  accent = "#32C6CC",
  theater = false,
  onTheaterChange,
  onEnded,
  autoPlay = false,
}: {
  src: string;
  poster?: string;
  title?: string;
  /** Scrubber and active-control colour. Academy teal by default; Studio purple is #8665A7. */
  accent?: string;
  theater?: boolean;
  onTheaterChange?: (v: boolean) => void;
  onEnded?: () => void;
  autoPlay?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<import("hls.js").default | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endedRef = useRef(onEnded);
  useEffect(() => {
    endedRef.current = onEnded;
  });

  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [time, setTime] = useState(0);
  const [length, setLength] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [hover, setHover] = useState(false);
  const [fs, setFs] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  /* Touch screens have no hover: a tap toggles the bar instead of playing.
     Read once; it only steers a click handler, never what is rendered. */
  const [coarse] = useState(() => typeof window !== "undefined" && (window.matchMedia?.("(pointer: coarse)").matches ?? false));
  /* Quality: -1 = Auto. `levels` are the renditions the playlist offers. */
  const [levels, setLevels] = useState<{ index: number; height: number }[]>([]);
  const [level, setLevel] = useState(-1);
  const [autoHeight, setAutoHeight] = useState<number | null>(null);
  const [rate, setRate] = useState(1);
  const [menu, setMenu] = useState<null | "settings" | "quality" | "speed">(null);

  const isPlaylist = src.includes(".m3u8");

  /* ── Source: hls.js first, native HLS as the fallback (see LessonVideo). ── */
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !src) return;
    setFailed(null);
    setLevels([]);
    setLevel(-1);
    setStarted(false);
    setPlaying(false);
    setTime(0);
    setLength(0);
    setBuffered(0);

    if (!isPlaylist) {
      el.src = src;
      if (autoPlay) el.play().catch(() => {});
      return () => {
        el.pause();
        el.removeAttribute("src");
        el.load();
      };
    }

    let cancelled = false;
    void import("hls.js").then(({ default: Hls }) => {
      if (cancelled) return;
      if (!Hls.isSupported()) {
        if (el.canPlayType("application/vnd.apple.mpegurl") !== "") {
          el.src = src;
          if (autoPlay) el.play().catch(() => {});
        } else setFailed("This browser cannot play adaptive video.");
        return;
      }
      const hls = new Hls({ enableWorker: true, autoStartLoad: autoPlay, capLevelToPlayerSize: true });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(el);
      hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
        const seen = new Set<number>();
        setLevels(
          data.levels
            .map((l, index) => ({ index, height: l.height }))
            .filter((l) => l.height && !seen.has(l.height) && seen.add(l.height))
            .sort((a, b) => b.height - a.height)
        );
        if (autoPlay) el.play().catch(() => {});
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data) => {
        setAutoHeight(hls.levels[data.level]?.height ?? null);
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) setFailed(`Playback failed (${data.type}).`);
      });
    });

    return () => {
      cancelled = true;
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [src, isPlaylist, autoPlay]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = volume;
    v.muted = muted;
  }, [volume, muted]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = rate;
  }, [rate]);

  const chooseLevel = (i: number) => {
    setLevel(i);
    const hls = hlsRef.current;
    /* currentLevel switches now (flushes the buffer); -1 hands control back to ABR. */
    if (hls) hls.currentLevel = i;
    setMenu(null);
  };

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    if (v.paused) {
      // First play is what starts the segment download.
      hlsRef.current?.startLoad();
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

  const seekBy = useCallback((d: number) => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(v.duration)) return;
    v.currentTime = Math.min(Math.max(v.currentTime + d, 0), v.duration);
  }, []);

  /** Pointer activity shows the bar; it fades 2.6s after the pointer stops — only while playing. */
  const wake = useCallback(() => {
    setHover(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setHover((h) => {
        const v = videoRef.current;
        return v && !v.paused ? false : h;
      });
    }, 2600);
  }, []);

  useEffect(() => {
    const onFs = () => {
      setFs(Boolean(document.fullscreenElement));
      setHover(true);
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  /* Keyboard — only once this player has been started, so two players on one
     page (or typing in the notes box) never fight over the space bar. */
  useEffect(() => {
    if (!started) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      switch (e.key) {
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
          onTheaterChange?.(!theater);
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
  }, [started, theater, onTheaterChange, togglePlay, toggleFullscreen, seekBy, wake]);

  const showBar = hover || menu !== null || (started && !playing);
  const pct = length > 0 ? (time / length) * 100 : 0;
  const bufPct = length > 0 ? (buffered / length) * 100 : 0;

  const scrub = (clientX: number, el: HTMLElement) => {
    const v = videoRef.current;
    const rect = el.getBoundingClientRect();
    if (!v || !Number.isFinite(v.duration) || rect.width === 0) return;
    v.currentTime = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1) * v.duration;
    setTime(v.currentTime);
  };

  const qualityLabel =
    level === -1 ? `Auto${autoHeight ? ` (${autoHeight}p)` : ""}` : `${levels.find((l) => l.index === level)?.height ?? ""}p`;

  return (
    <div
      ref={shellRef}
      className={`relative w-full h-full bg-black overflow-hidden select-none ${fs ? "" : "rounded-[inherit]"}`}
      onMouseMove={wake}
      onMouseLeave={() => !menu && setHover(false)}
      onClick={() => {
        if (menu) return setMenu(null);
        if (!coarse) return togglePlay();
        if (showBar) setHover(false);
        else wake();
      }}
      aria-label={title}
    >
      <video
        ref={videoRef}
        poster={poster}
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-contain"
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
          wake();
        }}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={(e) => setLength(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          setTime(v.currentTime);
          if (v.buffered.length > 0) setBuffered(v.buffered.end(v.buffered.length - 1));
        }}
        onEnded={() => {
          setPlaying(false);
          endedRef.current?.();
        }}
        onError={() => !isPlaylist && setFailed("The video could not be loaded.")}
      />

      {failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-[8px] px-6 text-center bg-black/70">
          <p className="text-[14px] leading-[22px] text-[#F0F0F0]">This video could not be played.</p>
          <p className="text-[12px] leading-[18px] text-[#9D9C9C] max-w-[460px]">{failed}</p>
        </div>
      )}

      {/* Centre circle */}
      {!failed && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          aria-label={playing ? "Pause" : "Play"}
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60px] h-[60px] rounded-full border border-[rgba(240,240,240,0.3)] bg-[rgba(0,0,0,0.25)] backdrop-blur-[2px] flex items-center justify-center hover:border-[rgba(240,240,240,0.6)] hover:bg-[rgba(0,0,0,0.4)] transition-all duration-200 ${
            playing && !showBar ? "opacity-0 pointer-events-none scale-90" : "opacity-100"
          }`}
        >
          {playing ? (
            <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden>
              <rect x="0" y="0" width="4.5" height="16" rx="1" fill="#F0F0F0" />
              <rect x="9.5" y="0" width="4.5" height="16" rx="1" fill="#F0F0F0" />
            </svg>
          ) : (
            <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden>
              <path d="M1 1.3v15.4L15 9 1 1.3Z" fill="#F0F0F0" />
            </svg>
          )}
        </button>
      )}

      {/* Control bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute left-0 right-0 bottom-0 px-[10px] sm:px-[18px] pb-[10px] sm:pb-[14px] pt-[40px] bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-200 ${
          showBar ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
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
            <div className="absolute inset-y-0 left-0 bg-[rgba(240,240,240,0.3)] rounded-full" style={{ width: `${bufPct}%` }} />
            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, background: accent }} />
            <span
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[11px] h-[11px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${pct}%`, background: accent }}
            />
          </div>
        </div>

        <div className="flex items-center gap-[12px] sm:gap-[16px] mt-[8px]">
          <button type="button" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"} className="text-[#F0F0F0] hover:text-white">
            {playing ? (
              <svg width="11" height="13" viewBox="0 0 11 13" aria-hidden>
                <rect x="0" y="0" width="3.5" height="13" rx="1" fill="currentColor" />
                <rect x="7.5" y="0" width="3.5" height="13" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg width="12" height="13" viewBox="0 0 12 13" aria-hidden>
                <path d="M1 1v11l10-5.5L1 1Z" fill="currentColor" />
              </svg>
            )}
          </button>

          <div className="hidden sm:flex items-center gap-[8px] group/vol">
            <button type="button" onClick={() => setMuted((v) => !v)} aria-label={muted ? "Unmute" : "Mute"} className="text-[#F0F0F0] hover:text-white">
              <svg width="16" height="14" viewBox="0 0 16 14" fill="none" aria-hidden>
                <path d="M1 5h3l4-3.5v11L4 9H1V5Z" fill="currentColor" />
                {!muted && volume > 0 ? (
                  <>
                    <path d="M10.5 4.6a3.4 3.4 0 0 1 0 4.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    <path d="M12.7 2.4a6.4 6.4 0 0 1 0 9.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </>
                ) : (
                  <path d="M10.5 4.8l4 4.4M14.5 4.8l-4 4.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
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
              className="w-0 opacity-0 group-hover/vol:w-[72px] group-hover/vol:opacity-100 transition-all duration-200 h-[3px] cursor-pointer"
              style={{ accentColor: accent }}
            />
          </div>

          <span className="text-[12px] font-medium leading-none text-[#9D9C9C] tabular-nums">
            {fmt(time)} / {fmt(length)}
          </span>

          <div className="flex-1" />

          {/* Settings: quality + speed */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenu((m) => (m ? null : "settings"))}
              aria-label="Settings"
              aria-expanded={menu !== null}
              className="flex items-center gap-[6px] transition-colors"
              style={{ color: menu ? accent : "#F0F0F0" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {/* The chosen rendition is shown next to the gear — the answer to "is this HD?" */}
              <span className="hidden sm:inline text-[11px] font-medium leading-none text-[#9D9C9C]">
                {levels.length ? qualityLabel : ""}
                {rate !== 1 ? `${levels.length ? " · " : ""}${rate}×` : ""}
              </span>
            </button>

            {menu && (
              <div
                className="absolute right-0 bottom-[28px] min-w-[200px] rounded-[6px] py-[6px] bg-[rgba(13,13,13,0.95)] backdrop-blur-[6px] border border-[rgba(240,240,240,0.1)] text-[13px]"
                role="menu"
              >
                {menu === "settings" && (
                  <>
                    {levels.length > 0 && (
                      <MenuRow label="Quality" value={qualityLabel} onClick={() => setMenu("quality")} />
                    )}
                    <MenuRow label="Speed" value={rate === 1 ? "Normal" : `${rate}×`} onClick={() => setMenu("speed")} />
                  </>
                )}
                {menu === "quality" && (
                  <>
                    <MenuBack label="Quality" onClick={() => setMenu("settings")} />
                    {[{ index: -1, height: 0 }, ...levels].map((l) => (
                      <MenuOption
                        key={l.index}
                        accent={accent}
                        active={level === l.index}
                        label={l.index === -1 ? `Auto${autoHeight ? ` (${autoHeight}p)` : ""}` : `${l.height}p${l.height >= 720 ? " HD" : ""}`}
                        onClick={() => chooseLevel(l.index)}
                      />
                    ))}
                  </>
                )}
                {menu === "speed" && (
                  <>
                    <MenuBack label="Speed" onClick={() => setMenu("settings")} />
                    {[0.75, 1, 1.25, 1.5, 2].map((r) => (
                      <MenuOption
                        key={r}
                        accent={accent}
                        active={rate === r}
                        label={r === 1 ? "Normal" : `${r}×`}
                        onClick={() => {
                          setRate(r);
                          setMenu(null);
                        }}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {onTheaterChange && (
            <button
              type="button"
              onClick={() => {
                onTheaterChange(!theater);
                wake();
              }}
              aria-label={theater ? "Default view" : "Theater mode"}
              aria-pressed={theater}
              className="hidden lg:block transition-colors"
              style={{ color: theater ? accent : "#F0F0F0" }}
            >
              <svg width="17" height="13" viewBox="0 0 17 13" fill="none" aria-hidden>
                <rect x="0.9" y="2.4" width="15.2" height="8.2" rx="1.4" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              toggleFullscreen();
              wake();
            }}
            aria-label={fs ? "Exit fullscreen" : "Fullscreen"}
            className="text-[#F0F0F0] hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M1 5V1h4M13 5V1H9M1 9v4h4M13 9v4H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function fmt(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

function MenuRow({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <button type="button" role="menuitem" onClick={onClick} className="w-full flex items-center justify-between gap-[16px] px-[14px] py-[9px] text-left text-[#F0F0F0] hover:bg-[rgba(240,240,240,0.06)]">
      <span>{label}</span>
      <span className="text-[#9D9C9C]">{value} ›</span>
    </button>
  );
}

function MenuBack({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full flex items-center gap-[8px] px-[14px] py-[9px] text-left text-[#9D9C9C] border-b border-[rgba(240,240,240,0.08)] mb-[4px] hover:text-[#F0F0F0]">
      ‹ {label}
    </button>
  );
}

function MenuOption({ label, active, accent, onClick }: { label: string; active: boolean; accent: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={active}
      onClick={onClick}
      className="w-full flex items-center gap-[10px] px-[14px] py-[8px] text-left hover:bg-[rgba(240,240,240,0.06)]"
      style={{ color: active ? "#F0F0F0" : "#9D9C9C" }}
    >
      <span className="w-[12px] text-center" style={{ color: accent }}>
        {active ? "✓" : ""}
      </span>
      {label}
    </button>
  );
}
