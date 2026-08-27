"use client";

import { useT } from "@/contexts/LocaleContext";
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import type { StudioProject } from "@/lib/types";
import { useScrollColorize } from "@/hooks/useScrollColorize";
import EpisodeLightbox from "@/components/EpisodeLightbox";

/* ═══════════════════════════════════════════════════════════════
   DSH – Studio details
   Pixel-matched to Figma node 704:971 (1920×6235, 1224 container
   at x=348).

   Section map (y on the 1920 frame):
     128   Frame 108   hero image band (h 650)
     128   Frame 93    back link
     204   Frame 479   chip + title + logline
     664   Frame 485   action bar + rule
     823   Frame 594   poster 406×530 + platform icons
     824   Frame 507   synopsis          (x 884, w 688)
    1278   Line 5      rule
    1338   Frame 508   editorial context
    1508   Line 6      rule
    1567   Credits label + Frame 521 credit rows
    2180   Frame 566   season tabs + rule
    2236   Frame 580   episode rows ×3
    3643   Frame 484   share bar
    3723   Frame 483   full-bleed banner
    4384   Frame 543   other suggestions
    5176   Group 382   newsletter
    5777   Frame 423   footer
   ═══════════════════════════════════════════════════════════════ */

/* ── Shared tokens (same ramp as the Studio landing page) ── */
const EYEBROW =
  "text-[11px] leading-[24px] tracking-[1.76px] uppercase text-[#363636]";
const CAT_LABEL =
  "text-[10px] leading-[24px] tracking-[1.6px] uppercase text-[#363636] shrink-0";
const BODY =
  "font-[family-name:var(--font-source-sans)] text-[16px] leading-[24px] tracking-[-0.08px] text-[#595C5C]";
const BODY_LARGE =
  "font-[family-name:var(--font-source-sans)] text-[18px] leading-[25px] tracking-[-0.09px] text-[#595C5C]";
const VALUE =
  "font-[family-name:var(--font-source-sans)] text-[16px] leading-[24px] tracking-[-0.08px] text-[#F0F0F0]";
const VALUE_MUTED =
  "font-[family-name:var(--font-source-sans)] text-[16px] leading-[24px] tracking-[-0.08px] text-[#595C5C]";

const GLASS_BTN =
  "backdrop-blur-[3px] bg-[rgba(27,27,27,0.2)] border border-[rgba(240,240,240,0.2)] rounded-[3px] " +
  "inline-flex items-center justify-center gap-[6px] text-[13px] font-medium text-[rgba(240,240,240,0.4)] " +
  "hover:text-[rgba(240,240,240,0.6)] hover:border-[rgba(240,240,240,0.3)] transition-colors";

const QUIET_LINK =
  "text-[13px] font-medium text-[#595C5C] hover:text-[#8B8F8F] transition-colors whitespace-nowrap";

const PILL_BASE =
  "px-[14px] py-[12px] rounded-[3px] text-[13px] font-medium transition-colors whitespace-nowrap";
const PILL_ON = `${PILL_BASE} backdrop-blur-[3px] bg-[#573377] text-[#F0F0F0]`;
const PILL_OFF = `${PILL_BASE} bg-[rgba(27,27,27,0.4)] text-[#595C5C] hover:text-[#8B8F8F]`;

const CARD_BORDER = "border-[1.5px] border-[rgba(240,240,240,0.1)] rounded-[6px]";
const CARD_SHADOW = "0px 6px 20px 0px rgba(0,0,0,0.5)";

const FORMAT_LABELS: Record<string, string> = {
  docuseries: "Docuseries",
  videocast: "Videocast",
  podcast: "Podcast",
  series: "Series",
  other: "Other media",
};

const STATUS_LABELS: Record<string, string> = {
  ongoing: "Ongoing",
  complete: "Complete",
  upcoming: "Upcoming",
};

/* Platform glyph — Figma Frame 644 shows 40×40 icon groups, not text.
   Matched loosely on the platform name so new platforms degrade to a
   neutral "listen" mark rather than stray letters. */
function PlatformGlyph({ platform }: { platform: string }) {
  const p = platform.toLowerCase();
  if (p.includes("spotify")) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm4.586 14.424a.623.623 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 11-.277-1.215c3.809-.871 7.077-.496 9.712 1.115a.623.623 0 01.207.857zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.13-9.965-1.166a.78.78 0 11-.452-1.492c3.632-1.102 8.147-.568 11.232 1.329a.78.78 0 01.257 1.072zm.105-2.835c-3.011-1.788-8.311-1.98-11.371-1.052a.935.935 0 11-.545-1.79c3.514-1.066 9.367-.86 13.064 1.335a.935.935 0 11-.955 1.606z" />
      </svg>
    );
  }
  if (p.includes("apple")) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2a10 10 0 00-3.3 19.44c-.05-.77-.01-1.7.18-2.54l1.15-4.88a3.6 3.6 0 01-.3-1.48c0-1.39.8-2.42 1.8-2.42.85 0 1.26.64 1.26 1.4 0 .86-.54 2.14-.83 3.33-.24 1 .5 1.81 1.48 1.81 1.78 0 3.14-1.87 3.14-4.58 0-2.39-1.72-4.07-4.18-4.07-2.85 0-4.52 2.13-4.52 4.34 0 .86.33 1.78.74 2.28a.3.3 0 01.07.29l-.28 1.13c-.04.18-.14.22-.33.13-1.23-.57-2-2.37-2-3.81 0-3.1 2.25-5.95 6.5-5.95 3.41 0 6.06 2.43 6.06 5.68 0 3.39-2.13 6.11-5.1 6.11-1 0-1.93-.52-2.25-1.13l-.61 2.34c-.22.85-.82 1.92-1.22 2.57A10 10 0 1012 2z" />
      </svg>
    );
  }
  if (p.includes("youtube") || p.includes("video")) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M21.58 7.19a2.51 2.51 0 00-1.77-1.78C18.25 5 12 5 12 5s-6.25 0-7.81.41a2.51 2.51 0 00-1.77 1.78A26.2 26.2 0 002 12a26.2 26.2 0 00.42 4.81 2.51 2.51 0 001.77 1.78C5.75 19 12 19 12 19s6.25 0 7.81-.41a2.51 2.51 0 001.77-1.78A26.2 26.2 0 0022 12a26.2 26.2 0 00-.42-4.81zM10 15.02V8.98L15.2 12 10 15.02z" />
      </svg>
    );
  }
  /* Generic — a small waveform, reads as "listen" without naming a brand */
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="3" y="10" width="2" height="4" rx="1" />
      <rect x="7" y="7" width="2" height="10" rx="1" />
      <rect x="11" y="4" width="2" height="16" rx="1" />
      <rect x="15" y="8" width="2" height="8" rx="1" />
      <rect x="19" y="11" width="2" height="2" rx="1" />
    </svg>
  );
}

/* Play-arrow glyph — Figma Vector 10 (5.859 × 8.187) */
function PlayArrow() {
  return (
    <svg
      width="5.859"
      height="8.187"
      viewBox="0 0 6 9"
      fill="currentColor"
      className="shrink-0 text-[#B23495]"
      aria-hidden
    >
      <path d="M0.5 0.5L5.5 4.5L0.5 8.5V0.5Z" />
    </svg>
  );
}

/* One credit row — label + value, gap 10 (Figma 704:1103) */
function CreditRow({
  label,
  value,
  tone = "bright",
}: {
  label: string;
  value?: string;
  tone?: "bright" | "muted" | "accent";
}) {
  // Empty credits are shown as a dimmed "None" rather than hidden, so the
  // credits block always has the same shape and an unfilled field is visible
  // (as an obvious gap to fill) instead of silently disappearing.
  const filled = Boolean(value && value.trim());
  const cls = !filled
    ? "font-[family-name:var(--font-source-sans)] text-[16px] leading-[24px] tracking-[-0.08px] text-[#363636] italic"
    : tone === "accent"
      ? "font-[family-name:var(--font-source-sans)] text-[16px] leading-[24px] tracking-[-0.08px] text-[#8665A7]"
      : tone === "muted"
        ? VALUE_MUTED
        : VALUE;
  return (
    <div className="flex gap-[10px] items-baseline">
      <p className={CAT_LABEL}>{label}</p>
      <p className={cls}>{filled ? value : "None"}</p>
    </div>
  );
}

export default function StudioProjectContent({
  project,
  suggestions,
}: {
  project: StudioProject;
  suggestions: StudioProject[];
}) {
  const t = useT();
  const format = FORMAT_LABELS[project.format] ?? project.format;
  const status = STATUS_LABELS[project.status] ?? project.status;

  /* Which episode the watch lightbox is showing; null = closed. */
  const [watchIndex, setWatchIndex] = useState<number | null>(null);

  /* Seasons — derived from the episodes that carry one. The design
     (`709:1580`) ALWAYS shows the tab strip, so a project with no season data
     is treated as a single "Season 1" rather than hiding the strip. */
  const seasons = useMemo(() => {
    const found = Array.from(
      new Set(
        project.episodes
          .map((e) => e.season)
          .filter((s): s is number => typeof s === "number")
      )
    ).sort((a, b) => a - b);
    return found.length ? found : [1];
  }, [project.episodes]);

  const [season, setSeason] = useState<number>(seasons[0]);

  const visibleEpisodes = useMemo(() => {
    const hasSeasonData = project.episodes.some((e) => typeof e.season === "number");
    /* No season data at all ⇒ every episode belongs to the implicit Season 1. */
    if (!hasSeasonData) return project.episodes;
    return project.episodes.filter((e) => (e.season ?? 1) === season);
  }, [project.episodes, season]);

  const heroImage = project.coverUrl || project.thumbnailUrl;

  /* Gallery stills — Figma `714:2463`. Prefers the explicit `stills` array;
     otherwise falls back to the cover, the episode stills and the thumbnail so
     the carousel always cycles real images rather than the same frame twice.
     Deduped, empties dropped. One image ⇒ the controls don't render at all. */
  const stills = useMemo(() => {
    const source = project.stills?.length
      ? project.stills
      : [project.coverUrl, ...project.episodes.map((e) => e.imageUrl), project.thumbnailUrl];
    return Array.from(new Set(source.filter((s): s is string => Boolean(s))));
  }, [project.stills, project.coverUrl, project.episodes, project.thumbnailUrl]);

  const [stillIndex, setStillIndex] = useState(0);

  /* Black-and-white → colour as the reader scrolls down. Drives every
     `[data-colorize]` image on the page. */
  const colorizeRef = useScrollColorize<HTMLElement>();

  /* Drop placeholder URLs ("#", "", "about:blank") so we never render a
     target="_blank" link that opens an empty tab. */
  const realListenLinks = useMemo(
    () =>
      project.listenLinks.filter((l) => {
        const u = (l.url || "").trim();
        return u !== "" && u !== "#" && !u.startsWith("about:");
      }),
    [project.listenLinks]
  );

  /* Jump to the episodes list.
     Scrolled explicitly rather than with a plain `#episodes` anchor, because
     a hash link only fires when the hash actually changes — once the URL is
     already `#episodes`, clicking the button again does nothing. This also
     lets us subtract the 128px fixed navbar directly instead of relying on
     `scroll-mt`. The `id` is kept on the section so deep links still work. */
  const episodesRef = useRef<HTMLElement>(null);
  const jumpToEpisodes = () => {
    const el = episodesRef.current;
    if (!el) return;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 128,
      behavior: "smooth",
    });
  };

  /* Share — Web Share API where available, clipboard everywhere else. */
  const [shared, setShared] = useState(false);
  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: project.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      /* user dismissed the sheet, or clipboard denied — stay silent */
    }
  };

  /* `overflow-x-clip`, not `-hidden`: `overflow-x: hidden` forces
     `overflow-y: auto`, which turns <main> into a scroll container and
     silently breaks `position: sticky` for everything inside it.
     `clip` contains the full-bleed bands without creating one. */
  return (
    <main
      ref={colorizeRef}
      className="min-h-screen bg-[#0D0D0D] text-white overflow-x-clip"
    >
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════
          HERO — Frame 108 band (h 650) + Frame 479 copy
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative mt-[128px]">
        {/* Image band — Figma `Frame 108` (704:972), h 650.
            Three layers, exactly as the frame stacks them:
              1. #0D0D0D base
              2. photo at mix-blend-luminosity / 30%
              3. two gradients in one layer — a vertical fade to solid black at
                 the foot, and the grape wash running diagonally at 108.77°
            No left scrim: the design darkens the whole band rather than
            masking one side. */}
        <div className="absolute inset-x-0 top-0 h-[650px] overflow-hidden pointer-events-none select-none">
          <div className="absolute inset-0 bg-[#0D0D0D]" />
          {/* Only render once there's a source. `src=""` makes the browser
              re-request the whole page, which React flags as an error. */}
          {heroImage && (
            <img
              src={heroImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-30"
              style={{ objectPosition: "50% 40%" }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(13,13,13,0) 0%, rgb(13,13,13) 100%), " +
                "linear-gradient(108.771319885494deg, rgba(13,13,13,0.2) 2.3431%, rgba(134,101,167,0.2) 99.409%)",
            }}
          />
        </div>

        <div className="relative max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0">
          {/* Back — Frame 93 */}
          <Link
            href="/studio"
            className="inline-flex items-center gap-[7px] pt-[60px] text-[13px] font-medium text-[#595C5C] hover:text-[#8B8F8F] transition-colors"
          >
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden>
              <path
                d="M11 4H1M1 4L4 1M1 4L4 7"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t("common.back")}
          </Link>

          {/* Chip + title + logline — Frame 479: pt 200 / pb 90, gap 30 */}
          <div className="flex flex-col gap-[30px] items-start pt-[136px] pb-[90px]">
            <div className="flex flex-col gap-[20px] items-start">
              <div className="flex items-center gap-[4px]">
                <span className="text-[15px] leading-[18px] text-[#8665A7]">
                  {format}
                </span>
                <span className="text-[12px] font-medium text-[#595C5C]">
                  {project.credits.year}
                </span>
              </div>
              <h1 className="font-semibold text-[38px] leading-[40px] sm:text-[50px] sm:leading-[52px] tracking-[-1px] text-[#F0F0F0]">
                {project.title}
              </h1>
            </div>
            <p className={`${BODY_LARGE} xl:w-[576px]`}>
              {project.oneLineDescription || project.synopsisShort}
            </p>
          </div>

          {/* Action bar — Frame 485: gap 30, pb 90, rule beneath */}
          <div className="flex flex-col gap-[30px] pb-[90px]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[24px]">
              <button
                onClick={jumpToEpisodes}
                className={`${GLASS_BTN} px-[16px] py-[12px] self-start`}
              >
                {t("studio.viewAllEpisodes")}
                <PlayArrow />
              </button>
              <div className="flex flex-wrap items-center gap-[24px]">
                <Link href="/about" className={QUIET_LINK}>
                  {t("studio.requestScreener")}
                </Link>
                <Link href="/about" className={QUIET_LINK}>
                  {t("studio.requestScreening")}
                </Link>
                <Link href="/about" className={QUIET_LINK}>
                  Request a quotation
                </Link>
              </div>
            </div>
            <div className="h-px w-full bg-[rgba(240,240,240,0.1)]" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          BODY — poster left (406), text column right (688 @ x=884)
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0">
        <div className="flex flex-col lg:flex-row gap-[80px] xl:gap-[130px] items-start">
          {/* Poster — Frame 594.
              Sticky: the gallery travels with the reader while the text column
              scrolls, and releases on its own when this section ends at the
              episodes list (the flex parent is already `items-start`). */}
          {/* A sticky element stops at its containing block's edge, which here
              is exactly where the season strip starts — so the poster's bottom
              ended up flush against "Season 1 / Season 2". The bottom margin
              is what the sticky travel stops against, giving it clear air. */}
          <div className="shrink-0 w-full lg:w-[406px] flex flex-col gap-[40px] lg:sticky lg:top-[148px] lg:self-start lg:mb-[60px]">
            <div
              className={`relative w-full h-[420px] lg:h-[530px] overflow-hidden ${CARD_BORDER}`}
              style={{ boxShadow: CARD_SHADOW, backgroundColor: "#0D0D0D" }}
            >
              {stills.map((src, i) => (
                <img
                  key={src}
                  data-colorize
                  src={src}
                  alt={
                    stills.length > 1
                      ? `${project.title} — still ${i + 1} of ${stills.length}`
                      : project.title
                  }
                  aria-hidden={i !== stillIndex}
                  className="absolute inset-0 w-full h-full object-cover rounded-[6px] opacity-80 transition-opacity duration-500"
                  style={{ opacity: i === stillIndex ? 0.8 : 0 }}
                />
              ))}
            </div>

            {/* Carousel controls — Figma `730:644`: w-406, px-30, space-between.
                Only rendered when there is more than one still, so the arrows
                are never dead. The centre indicator is NOT in the frame — it's
                Tiago's suggestion on the arrows. */}
            {stills.length > 1 && (
              <div className="flex items-center justify-between px-[30px] w-full lg:w-[406px] self-center">
                <button
                  type="button"
                  onClick={() => setStillIndex((i) => (i - 1 + stills.length) % stills.length)}
                  aria-label="Previous still"
                  className="w-[40px] h-[40px] rounded-full backdrop-blur-[2px] transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B23495]"
                >
                  <img src="/images/ic_left_arrow.svg" alt="" className="w-full h-full" />
                </button>

                {/* Indicator — active stop is a pink pill, the rest are dots */}
                <div className="flex items-center gap-[8px]" role="tablist" aria-label="Stills">
                  {stills.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      role="tab"
                      aria-selected={i === stillIndex}
                      aria-label={`Still ${i + 1}`}
                      onClick={() => setStillIndex(i)}
                      className="h-[6px] rounded-full transition-all duration-300"
                      style={{
                        width: i === stillIndex ? 24 : 6,
                        backgroundColor: i === stillIndex ? "#B23495" : "rgba(240,240,240,0.2)",
                      }}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setStillIndex((i) => (i + 1) % stills.length)}
                  aria-label="Next still"
                  className="w-[40px] h-[40px] rounded-full backdrop-blur-[2px] transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B23495]"
                >
                  <img src="/images/ic_right_arrow.svg" alt="" className="w-full h-full" />
                </button>
              </div>
            )}

            {/* Platform links — Frame 644.
                Only rendered when the URL is real: the seed data ships "#",
                which would otherwise open a blank tab to nowhere. */}
            {realListenLinks.length > 0 && (
              <div className="flex items-center gap-[16px]">
                {realListenLinks.map((l) => (
                  <a
                    key={l.platform}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[40px] h-[40px] rounded-full border border-[rgba(240,240,240,0.15)] flex items-center justify-center text-[#595C5C] hover:text-[#F0F0F0] hover:border-[rgba(240,240,240,0.3)] transition-colors"
                    title={l.platform}
                    aria-label={`Listen on ${l.platform}`}
                  >
                    <PlatformGlyph platform={l.platform} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Text column */}
          <div className="flex-1 min-w-0 xl:max-w-[688px] w-full">
            {/* Synopsis — Frame 507: gap 20, inner gap 14 */}
            <div className="flex flex-col gap-[20px] items-start">
              <div className="flex flex-col gap-[14px] items-start w-full">
                <p className={EYEBROW}>synopsis</p>
                <p className={BODY}>
                  {project.synopsisShort || project.oneLineDescription}
                </p>
              </div>
              {project.synopsisLong && (
                <p className="font-[family-name:var(--font-source-sans)] text-[16px] leading-[24px] tracking-[-0.08px] text-[#363636]">
                  {project.synopsisLong}
                </p>
              )}
            </div>

            {/* Rule — Line 5 */}
            <div className="h-px w-full bg-[rgba(240,240,240,0.1)] my-[60px]" />

            {/* Editorial context — Frame 508 */}
            {project.editorialContext && (
              <>
                <div className="flex flex-col gap-[14px] items-start">
                  <p className={EYEBROW}>{t("studio.editorialContext")}</p>
                  <p className={BODY}>{project.editorialContext}</p>
                </div>
                <div className="h-px w-full bg-[rgba(240,240,240,0.1)] my-[60px]" />
              </>
            )}

            {/* Credits — label + Frame 521 (gap 40, rows gap 14) */}
            <p className={`${EYEBROW} mb-[45px]`}>{t("studio.credits")}</p>
            <div className="flex flex-col gap-[40px] items-start pb-[150px]">
              <div className="flex flex-col gap-[14px] items-start">
                <CreditRow
                  label="Directed by"
                  value={project.credits.direction || project.credits.hosts.join(", ")}
                />
                <CreditRow label={t("studio.producedBy")} value={project.credits.production} />
                <CreditRow
                  label="Co-Production"
                  value={project.credits.coProduction}
                />
                <CreditRow
                  label="Partners"
                  value={project.credits.partners.join(", ")}
                />
              </div>

              <div className="flex flex-col gap-[40px] items-start">
                <div className="flex flex-col gap-[14px] items-start">
                  <CreditRow label="Year" value={project.credits.year} tone="muted" />
                  <CreditRow
                    label="Duration"
                    value={project.credits.duration}
                    tone="muted"
                  />
                  <CreditRow label="Form" value={project.credits.form} tone="muted" />
                  <CreditRow
                    label="Format"
                    value={project.credits.formatLabel ?? format}
                    tone="muted"
                  />
                  <CreditRow
                    label="Language"
                    value={project.credits.language}
                    tone="muted"
                  />
                  <CreditRow
                    label="Country"
                    value={project.credits.country}
                    tone="muted"
                  />
                </div>
                <CreditRow label="Stage / Status" value={status} tone="accent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          EPISODES — Frame 566 season tabs + Frame 580 rows
         ═══════════════════════════════════════════════════════════ */}
      {project.episodes.length > 0 && (
        <section
          id="episodes"
          ref={episodesRef}
          className="max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0 scroll-mt-[128px]"
        >
          {/* Season tabs — always shown, per the design. A project with no
              season data renders a single "Season 1". */}
          <div className="flex flex-col gap-[15px]">
            <div className="flex flex-wrap items-center gap-[10px]">
              {seasons.map((s) => (
                <button
                  key={s}
                  onClick={() => setSeason(s)}
                  aria-pressed={season === s}
                  className={season === s ? PILL_ON : PILL_OFF}
                >
                  {t("episode.season")} {s}
                </button>
              ))}
            </div>
            <div className="h-px w-full bg-[rgba(240,240,240,0.1)]" />
          </div>

          {visibleEpisodes.map((ep, i) => (
            <EpisodeRow
              key={`${ep.title}-${i}`}
              ep={ep}
              index={i}
              fallbackYear={project.credits.year}
              projectSlug={project.slug}
              poster={project.thumbnailUrl || project.coverUrl}
              episodeLink={realListenLinks[0]?.url}
              // The lightbox browses the whole run, so it needs the episode's
              // position in `project.episodes` — not `i`, which is an index
              // into the current season's filtered slice.
              onWatch={
                ep.videoUrl
                  ? () => setWatchIndex(project.episodes.indexOf(ep))
                  : undefined
              }
            />
          ))}
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SHARE BAR — Frame 484
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0 pb-[40px]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[24px]">
          <button
            onClick={share}
            className={`${GLASS_BTN} px-[16px] py-[12px] self-start`}
          >
            {shared ? t("common.linkCopied") : t("common.share")}
            <span className="w-[6px] h-[6px] rounded-full bg-[#8665A7] shrink-0" />
          </button>
          <div className="flex flex-wrap items-center gap-[24px]">
            <Link href="/about" className={QUIET_LINK}>
              {t("studio.requestScreener")}
            </Link>
            <Link href="/about" className={QUIET_LINK}>
              {t("studio.requestScreening")}
            </Link>
            <Link href="/about" className={QUIET_LINK}>
              {t("studio.contactDistribution")}
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SUPPORT BANNER — Figma `Frame 483` (704:1278), full bleed h 661.
          Not a bare image band: it carries a heading, body copy and a
          600px one-time-donation card. Base #0D0D0D with the photo at
          mix-blend-luminosity / 5% — texture only.
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0D0D0D]" />
        {heroImage && (
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-5"
          />
        )}

        {/* Content — py 100, gap 80 */}
        <div className="relative max-w-[1227px] mx-auto px-5 sm:px-8 xl:px-0 py-[100px] flex flex-col gap-[80px] items-center">
          {/* Heading block — gap 30, inner gap 14, centred */}
          <div className="flex flex-col gap-[30px] w-full text-center">
            <div className="flex flex-col gap-[14px] w-full">
              <p className="text-[10px] leading-[24px] tracking-[1.6px] uppercase text-[#363636]">
                Support
              </p>
              <h2 className="font-semibold text-[30px] leading-[34px] sm:text-[38px] sm:leading-[40px] tracking-[-0.57px] text-white">
                Want to support directly this project?
              </h2>
            </div>
            <p className={BODY}>
              Independent political film doesn&rsquo;t pay for itself. Your support
              keeps the work free of editorial strings.
            </p>
          </div>

          {/* One-time card — w 600, blur 3px, 1.5px hairline */}
          <div
            className="w-full max-w-[600px] rounded-[6px] border-[1.5px] border-[rgba(240,240,240,0.1)] backdrop-blur-[3px] px-[41.5px] py-[36.5px] flex flex-col gap-[30px]"
            style={{
              backgroundColor: "rgba(19,19,19,0.6)",
              boxShadow: "0px 6px 20px 0px rgba(0,0,0,0.3)",
            }}
          >
            <div className="flex flex-col gap-[10px] items-start w-full">
              <div className="flex flex-col gap-[14px] items-start w-full">
                <p className="text-[10px] leading-[24px] tracking-[1.6px] uppercase text-[rgba(255,255,255,0.25)]">
                  One-time
                </p>
                <p className="font-semibold text-[26px] leading-[26px] tracking-[-0.75px] text-white">
                  Support our work
                </p>
              </div>
              <p className={BODY}>
                A single contribution, any amount, your project of choice.
              </p>
            </div>

            <Link
              href="/support"
              className="h-[44px] w-full rounded-[3px] border border-[rgba(240,240,240,0.2)] bg-[rgba(54,54,54,0.1)] flex items-center justify-center gap-[7px] text-[13px] font-medium text-[#F0F0F0] hover:bg-[rgba(54,54,54,0.25)] transition-colors"
            >
              Support this project
              <svg width="12" height="11" viewBox="0 0 12 11" fill="currentColor" aria-hidden>
                <path d="M6 10.4S0 6.9 0 3.4A3.1 3.1 0 016 2a3.1 3.1 0 016 1.4c0 3.5-6 7-6 7z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          OTHER SUGGESTIONS — Frame 543
         ═══════════════════════════════════════════════════════════ */}
      {suggestions.length > 0 && (
        <section className="max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0 pt-[180px] pb-[180px]">
          <p className={`${EYEBROW} mb-[64px]`}>{t("studio.otherSuggestions")}</p>
          <div className="grid md:grid-cols-2 gap-x-[24px] gap-y-[80px]">
            {suggestions.map((s) => (
              <SuggestionCard key={s.slug} project={s} />
            ))}
          </div>
        </section>
      )}

      <Newsletter />
      <Footer />

      {/* Watch lightbox — Figma `DSH – Studio Details – lightbox` (726:566).
          Mounted once for the whole page; the row that was clicked decides
          which episode it opens on. */}
      <EpisodeLightbox
        open={watchIndex !== null}
        onClose={() => setWatchIndex(null)}
        projectTitle={project.title}
        episodes={project.episodes}
        initialIndex={watchIndex ?? 0}
      />
    </main>
  );
}

/* ── Episode row — Figma 709:1455 ──
   flex gap 130 · py 100 · still 406×260 left, copy 688 right */
function EpisodeRow({
  ep,
  index,
  fallbackYear,
  projectSlug,
  poster,
  episodeLink,
  onWatch,
}: {
  ep: StudioProject["episodes"][number];
  index: number;
  fallbackYear: string;
  projectSlug: string;
  poster: string;
  episodeLink?: string;
  /** Opens the watch lightbox. Absent when the episode has no video. */
  onWatch?: () => void;
}) {
  const t = useT();
  const number = ep.number ?? index + 1;

  /* The episode-details page (Figma `714:3643`) isn't built yet, so an
     episode only has somewhere to go once it carries its own slug.
     Second best is its listen link. With neither, we render the CTAs as
     plain text rather than links that reload the page you're already on. */
  const href = ep.slug
    ? `/studio/${projectSlug}/${ep.slug}`
    : episodeLink || null;
  const external = !ep.slug && !!episodeLink;

  return (
    <div className="flex flex-col lg:flex-row gap-[40px] lg:gap-[130px] items-start py-[60px] lg:py-[100px]">
      {/* Still + guest — Frame 573, gap 26 */}
      <div className="shrink-0 w-full lg:w-[406px] flex flex-col gap-[26px]">
        <div
          className={`relative w-full h-[220px] lg:h-[260px] overflow-hidden ${CARD_BORDER}`}
          style={{ boxShadow: CARD_SHADOW, backgroundColor: "#0D0D0D" }}
        >
          {(ep.imageUrl || poster) && (
            <img
              data-colorize
              src={ep.imageUrl || poster}
              alt=""
              className="absolute inset-0 w-full h-full object-cover rounded-[6px] opacity-80"
            />
          )}
        </div>
        {ep.guest && (
          <div className="flex gap-[7px] items-end">
            <span className="text-[12px] font-medium text-[#363636]">{t("episode.guest")}</span>
            <span className="text-[14px] font-semibold text-[#8665A7]">
              {ep.guest}
            </span>
          </div>
        )}
      </div>

      {/* Copy — Frame 576, gap 40 */}
      <div className="flex-1 min-w-0 xl:max-w-[688px] w-full flex flex-col gap-[40px]">
        <div className="flex flex-col gap-[30px]">
          <div className="flex flex-col gap-[30px] xl:max-w-[591px]">
            {/* Chip row — gap 14 */}
            <div className="flex items-center gap-[14px]">
              <span className="bg-[#573377] px-[8px] py-[5px] rounded-[3px] text-[12px] font-medium text-[#F0F0F0] whitespace-nowrap">
                Episode {number}
              </span>
              <div className="flex items-center gap-[10px] text-[12px] font-medium whitespace-nowrap">
                {typeof ep.season === "number" && (
                  <span className="text-[#9D9C9C]">Season {ep.season}</span>
                )}
                <span className="text-[#363636]">{ep.year || fallbackYear}</span>
                {/* Per-episode runtime. Sits in the meta chip row after the
                    year, separated by a hairline dot — not in the Figma frame,
                    added so the dashboard's episode Duration field is visible.
                    Delete this block to go back to the design exactly. */}
                {ep.duration && ep.duration.trim() && (
                  <>
                    <span className="w-[3px] h-[3px] rounded-full bg-[#363636] shrink-0" />
                    <span className="text-[#363636]">{ep.duration}</span>
                  </>
                )}
              </div>
            </div>

            {/* Title + subtitle — gap 8 */}
            <div className="flex flex-col gap-[8px] text-[#F0F0F0] font-semibold">
              <p className="text-[24px] leading-[30px]">{ep.title}</p>
              {ep.subtitle && (
                <p className="text-[16px] leading-[20px]">{ep.subtitle}</p>
              )}
            </div>
          </div>

          <p className={BODY}>{ep.description}</p>
        </div>

        {/* CTAs — gap 24 */}
        <div className="flex flex-wrap items-center gap-[24px]">
          {/* "View episode" = watch. When the episode has a video it opens the
              player lightbox in place; "Know more" below is the separate route
              to the episode's details page. Without a video we fall back to
              the old link behaviour so nothing becomes a dead end. */}
          {onWatch ? (
            <button onClick={onWatch} className={`${GLASS_BTN} px-[14px] py-[12px]`}>
              {t("episode.view")}
              <PlayArrow />
            </button>
          ) : href ? (
            external ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${GLASS_BTN} px-[14px] py-[12px]`}
              >
                {t("episode.view")}
                <PlayArrow />
              </a>
            ) : (
              <Link href={href} className={`${GLASS_BTN} px-[14px] py-[12px]`}>
                {t("episode.view")}
                <PlayArrow />
              </Link>
            )
          ) : (
            <span
              className={`${GLASS_BTN} px-[14px] py-[12px] opacity-50 cursor-default`}
              title="Episode page coming soon"
            >
              {t("episode.view")}
              <PlayArrow />
            </span>
          )}
          {href && (
            <Link
              href={ep.slug ? `/studio/${projectSlug}/${ep.slug}` : `/studio/${projectSlug}`}
              className="text-[13px] font-medium text-[rgba(240,240,240,0.3)] hover:text-[rgba(240,240,240,0.5)] transition-colors"
            >
              {t("common.knowMore")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Suggestion card — Figma 709:1513 ──
   Poster 221×288 left + copy 338 right, mirroring the landing rows */
function SuggestionCard({ project }: { project: StudioProject }) {
  const t = useT();
  const format = FORMAT_LABELS[project.format] ?? project.format;
  const status = STATUS_LABELS[project.status] ?? project.status;

  return (
    <div className="flex gap-[40px] items-start">
      <div className="shrink-0 w-[221px] flex flex-col gap-[40px]">
        <Link href={`/studio/${project.slug}`} className="block group">
          <div
            className={`relative w-full h-[288px] overflow-hidden ${CARD_BORDER}`}
            style={{ boxShadow: CARD_SHADOW, backgroundColor: "#0D0D0D" }}
          >
            <img
              src={project.thumbnailUrl || project.coverUrl}
              alt={project.title}
              className="absolute inset-0 w-full h-full object-cover rounded-[6px] mix-blend-luminosity opacity-50 group-hover:opacity-70 transition-opacity duration-500"
            />
          </div>
        </Link>
        <div className="flex items-center gap-[24px]">
          <Link
            href={`/studio/${project.slug}`}
            className={`${GLASS_BTN} px-[14px] py-[12px]`}
          >
            {t("studio.viewAllEpisodes")}
            <PlayArrow />
          </Link>
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-[63px]">
        <div className="flex flex-col gap-[20px]">
          <div className="flex flex-col gap-[30px]">
            <div className="flex items-center gap-[14px]">
              <span className="bg-[#573377] px-[8px] py-[5px] rounded-[3px] text-[12px] font-medium text-[#F0F0F0] whitespace-nowrap">
                {format}
              </span>
              <span className="flex items-center gap-[10px] text-[12px] font-medium whitespace-nowrap">
                <span className="text-[#8665A7]">{status}</span>
                <span className="text-[#595C5C]">{project.credits.year}</span>
              </span>
            </div>
            <Link href={`/studio/${project.slug}`}>
              <h3 className="text-[24px] font-semibold leading-[30px] text-[#F0F0F0] hover:text-[#F0F0F0]/80 transition-colors">
                {project.title}
              </h3>
            </Link>
          </div>
          <p className={`${BODY} line-clamp-3`}>
            {project.synopsisShort || project.oneLineDescription}
          </p>
        </div>

        <div className="flex flex-col gap-[6px]">
          <p className={CAT_LABEL}>{t("studio.producedBy")}</p>
          <p className="text-[15px] leading-[18px] text-[#F0F0F0]">
            {[project.credits.production, project.credits.coProduction]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
      </div>
    </div>
  );
}
