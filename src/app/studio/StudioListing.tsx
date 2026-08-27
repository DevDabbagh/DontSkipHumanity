"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import HeroMosaic from "@/components/HeroMosaic";
import SupportCTA from "@/components/SupportCTA";
import Footer from "@/components/Footer";
import type { StudioProject } from "@/lib/types";
import { useScrollColorize } from "@/hooks/useScrollColorize";

/* ═══════════════════════════════════════════════════════════════
   DSH – Studio Landing
   Pixel-matched to Figma node 467:87 (1920 frame, 1224 container).

   Design tokens used (from the Figma variable set):
     --dsh_smokewhite-main   #F0F0F0
     --dsh_mediumgrey-main   #595C5C
     --dsh_background-darkgray #363636
     --dsh_grape-main        #8665A7
     --dsh_grape-dark        #573377
     --dsh_background-main   #0D0D0D

   Type ramp:
     H6_IntroTitles      Inter 400 · 11/24 · +1.76px · uppercase
     H6_CategoryTitles   Inter 400 · 10/24 · +1.6px  · uppercase
     H1_Desktop_DSH      Inter 600 · 50/52 · -1px
     H2_Desktop_DSH      Inter 600 · 38/40 · -0.57px
     H6_Desktop_DSH      Inter 600 · 24/30
     Subs informations   Inter 600 · 16/20
     Author & Category   Inter 400 · 15/18
     Btn_Tags_Desktop    Inter 500 · 12
     Btn_SM-Destop-Med   Inter 500 · 13
     Body-Medium         Source Sans 3 400 · 16/24 · -0.08px
   ═══════════════════════════════════════════════════════════════ */

/* ── Shared tokens ── */
const C = {
  smoke: "#F0F0F0",
  grey: "#595C5C",
  darkGrey: "#363636",
  grape: "#8665A7",
  grapeDark: "#573377",
  bg: "#0D0D0D",
} as const;

/* Box chrome shared by every image card — Figma "boxes shadows" effect */
const CARD_BORDER = "border-[1.5px] border-[rgba(240,240,240,0.1)] rounded-[6px]";
const CARD_SHADOW_0 = "0px 6px 20px 0px rgba(0,0,0,0.5)";
const CARD_SHADOW_2 = "0px 6px 20px 2px rgba(0,0,0,0.5)";

/* Glass button — Figma 467:118 / 472:823 */
const GLASS_BTN =
  "backdrop-blur-[3px] bg-[rgba(27,27,27,0.2)] border border-[rgba(240,240,240,0.2)] rounded-[3px] " +
  "inline-flex items-center justify-center gap-[6px] text-[13px] font-medium text-[rgba(240,240,240,0.4)] " +
  "hover:text-[rgba(240,240,240,0.6)] hover:border-[rgba(240,240,240,0.3)] transition-colors";

/* Filter pill — Figma 467:415 (active) / 467:417 (idle) */
const PILL_BASE =
  "px-[14px] py-[12px] rounded-[3px] text-[13px] font-medium transition-colors whitespace-nowrap";
const PILL_ON = `${PILL_BASE} backdrop-blur-[3px] bg-[#573377] text-[#F0F0F0]`;
const PILL_OFF = `${PILL_BASE} bg-[rgba(27,27,27,0.4)] text-[#595C5C] hover:text-[#8B8F8F]`;

/* Body copy — Source Sans 3, 16/24, -0.08px */
const BODY =
  "font-[family-name:var(--font-source-sans)] text-[16px] leading-[24px] tracking-[-0.08px] text-[#595C5C]";

/* Section eyebrow — 11/24, +1.76px, uppercase, #363636 */
const EYEBROW =
  "text-[11px] leading-[24px] tracking-[1.76px] uppercase text-[#363636]";

/* ── Format / status labels ── */
const FORMAT_LABELS: Record<string, string> = {
  docuseries: "Docuseries",
  videocast: "Videocasts",
  podcast: "Podcasts",
  series: "Series",
  other: "Other media",
};

const STATUS_LABELS: Record<string, string> = {
  ongoing: "Ongoing",
  complete: "Complete",
  upcoming: "Upcoming",
};

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

/* Numbered marker — "01" + 70px vertical rule (Figma 486:1292) */
function StepMarker({ n }: { n: string }) {
  return (
    <div className="flex items-center justify-between shrink-0 w-[64px]">
      <span className="text-[11px] leading-[24px] tracking-[1.76px] uppercase text-[#8665A7]">
        {n}
      </span>
      <span className="block w-px h-[70px] bg-[rgba(240,240,240,0.1)]" />
    </div>
  );
}

/* ── Component ── */

export default function StudioListing({ projects }: { projects: StudioProject[] }) {
  /* Scroll-linked black-and-white → colour, as on the detail pages. Drives
     the featured cover and the project cards; the hero mosaic and the 5%
     luminosity washes are deliberately left out. */
  const colorizeRef = useScrollColorize<HTMLElement>();

  /* Featured — first project, or the first marked ongoing */
  const featured = projects[0] ?? null;
  const rest = featured ? projects.filter((p) => p.id !== featured.id) : projects;

  /* Filters */
  const [formatFilter, setFormatFilter] = useState<"all" | string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");

  const formatTabs = useMemo(() => {
    const present = Array.from(new Set(projects.map((p) => p.format)));
    return [
      { value: "all", label: "View All" },
      ...present.map((f) => ({ value: f, label: FORMAT_LABELS[f] ?? f })),
    ];
  }, [projects]);

  const listRef = useRef<HTMLDivElement>(null);

  /* Scroll the window explicitly rather than `scrollIntoView`, so the 128px
     fixed navbar can be subtracted from the target position — otherwise the
     first row lands underneath it. */
  const jumpToList = () => {
    const el = listRef.current;
    if (!el) return;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 128,
      behavior: "smooth",
    });
  };

  const filtered = rest.filter((p) => {
    const formatOk = formatFilter === "all" || p.format === formatFilter;
    const statusOk = statusFilter === "all" || p.status === statusFilter;
    return formatOk && statusOk;
  });

  return (
    <main ref={colorizeRef} className="min-h-screen bg-[#0D0D0D] text-white overflow-x-hidden">
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════
          HERO — Figma 467:112 + 467:117, mosaic 691:461
          Frame y 129→774 (645 tall). Text block starts 124px below
          the 128px navbar; buttons close the block at y 734.
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative h-[645px] mt-[128px]">
        {/* Photo mosaic — exported Figma asset (Frame 563, 1920×645) */}
        <HeroMosaic
          mode="sheet"
          src="/images/studio-hero-mosaic.png"
          sheetWidth={1920}
          sheetHeight={645}
          dim={0.55}
        />

        {/* Hero copy */}
        <div className="relative h-full max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0">
          <div className="absolute top-[124px] left-5 sm:left-8 xl:left-0 flex flex-col gap-[60px] w-full max-w-[496px] pr-5 sm:pr-8 xl:pr-0">
            {/* Eyebrow + headline — gap 14 */}
            <div className="flex flex-col gap-[14px] items-start">
              <p className={EYEBROW}>studio</p>
              <h1
                className="font-semibold text-[38px] leading-[40px] sm:text-[50px] sm:leading-[52px] tracking-[-1px] text-[#F0F0F0] xl:w-[489px]"
              >
                Bold,
                <br />
                <span
                  style={{
                    background: "linear-gradient(90deg, #32C6CC, #B23495)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  independent media
                </span>{" "}
                that strengthens movements.
              </h1>
            </div>

            {/* Description — Source Sans 3, 16/24 */}
            <p className={BODY}>
              Not every story fits a film. Studio is DSH&rsquo;s production arm for the
              rest: docuseries, videocasts, podcasts, and series that stay with a
              subject over time, plus the work we develop and co-produce with
              partners and movements. The cinema slate has its own section; this is
              everything else we make.
            </p>

            {/* CTAs — gap 24 */}
            <div className="flex flex-wrap items-center gap-[24px]">
              <button
                onClick={jumpToList}
                className={`${GLASS_BTN} px-[14px] py-[12px]`}
              >
                Explore the work
              </button>
              <Link href="/about" className={`${GLASS_BTN} px-[14px] py-[12px]`}>
                Get in touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          WHAT STUDIO DOES — Figma 714:2460
          py 190 · gap 40 · grid 2×4, gap-x 25 / gap-y 70, rows 78px
         ═══════════════════════════════════════════════════════════ */}
      <section className="max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0 py-[190px]">
        <p className={`${EYEBROW} mb-[40px]`}>What Studio does</p>

        <div className="flex flex-col gap-[70px]">
          {/* 01 — text left, plate right */}
          <div className="grid lg:grid-cols-2 gap-[25px] items-center">
            <StudioCapability
              n="01"
              title="Docuseries"
              body="Multi-episode deep dives into resistance, solidarity, and structural change"
              pad="pr"
            />
            <ImagePlate src="/images/studio.jpg" position="30% 40%" />
          </div>

          {/* 02 — plate left, text right */}
          <div className="grid lg:grid-cols-2 gap-[25px] items-center">
            <ImagePlate
              src="/images/journalism.jpg"
              position="50% 45%"
              className="order-2 lg:order-1"
            />
            <StudioCapability
              n="02"
              title="Videocasts & podcasts"
              body="conversations that challenge the dominant frame and stay with a subject over time"
              pad="pl"
              className="order-1 lg:order-2"
            />
          </div>

          {/* 03 — text left, plate right */}
          <div className="grid lg:grid-cols-2 gap-[25px] items-center">
            <StudioCapability
              n="03"
              title="Series & original media"
              body="episodic audio and video, and the media around it. Need a bit more sentence here."
              pad="pr"
            />
            <ImagePlate src="/images/political-education.jpg" position="45% 35%" />
          </div>

          {/* 04 — plate left, text right */}
          <div className="grid lg:grid-cols-2 gap-[25px] items-center">
            <ImagePlate
              src="/images/infocus.jpg"
              position="50% 50%"
              className="order-2 lg:order-1"
            />
            <StudioCapability
              n="04"
              title="Production & co-production"
              body="developing and making work with partners, broadcasters, and movements"
              pad="pl"
              className="order-1 lg:order-2"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FEATURED — Figma 714:2462
          flex gap 70 · items-end · pb 190
          Left  612: eyebrow + 448-tall plate (gap 14)
          Right 546: meta / title / body / credits / CTAs (gap 54)
         ═══════════════════════════════════════════════════════════ */}
      {featured && (
        <section className="max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0 pb-[190px]">
          <div className="flex flex-col lg:flex-row gap-[70px] lg:items-end">
            {/* Left — plate */}
            <div className="flex flex-col gap-[14px] shrink-0 w-full lg:w-[612px]">
              <p className={EYEBROW}>Featured</p>
              <Link
                href={`/studio/${featured.slug}`}
                className={`relative block h-[300px] sm:h-[448px] overflow-hidden group ${CARD_BORDER}`}
                style={{ boxShadow: CARD_SHADOW_0, backgroundColor: C.bg }}
              >
                <img
                  data-colorize
                  src={featured.coverUrl || featured.thumbnailUrl}
                  alt={featured.title}
                  className="absolute inset-0 w-full h-full object-cover rounded-[6px] opacity-80 group-hover:opacity-95 transition-opacity duration-500"
                />
              </Link>
            </div>

            {/* Right — details */}
            <div className="flex flex-col gap-[54px] w-full lg:w-[546px]">
              <div className="flex flex-col gap-[30px]">
                <div className="flex flex-col gap-[40px]">
                  <div className="flex flex-col gap-[30px]">
                    {/* Format + year — 15/18 grape · 12 medium grey */}
                    <div className="flex items-center gap-[4px]">
                      <span className="text-[15px] leading-[18px] text-[#8665A7]">
                        {FORMAT_LABELS[featured.format] ?? featured.format}
                      </span>
                      <span className="text-[12px] font-medium text-[#595C5C]">
                        {featured.credits.year}
                      </span>
                    </div>

                    {/* Title + logline — gap 20 */}
                    <div className="flex flex-col gap-[20px]">
                      <h2 className="font-semibold text-[32px] leading-[34px] sm:text-[38px] sm:leading-[40px] tracking-[-0.57px] text-[#F0F0F0]">
                        {featured.title}
                      </h2>
                      <p className={`${BODY} lg:w-[381px]`}>
                        {featured.oneLineDescription || featured.synopsisShort}
                      </p>
                    </div>
                  </div>

                  {/* Directed by — gap 10 */}
                  <div className="flex flex-col gap-[10px]">
                    <p className="text-[10px] leading-[24px] tracking-[1.6px] uppercase text-[#363636]">
                      Directed by
                    </p>
                    <p className="text-[15px] leading-[18px] text-[#F0F0F0]">
                      {featured.credits.hosts[0] || featured.credits.production}
                    </p>
                  </div>
                </div>

                {/* Editorial context */}
                <p className={BODY}>
                  {featured.editorialContext || featured.synopsisShort}
                </p>
              </div>

              {/* CTAs — gap 24 */}
              <div className="flex flex-wrap items-center gap-[24px]">
                <Link
                  href={`/studio/${featured.slug}`}
                  className={`${GLASS_BTN} px-[14px] py-[12px]`}
                >
                  View all episodes
                  <PlayArrow />
                </Link>
                <Link
                  href={`/studio/${featured.slug}`}
                  className="text-[13px] font-medium text-[rgba(240,240,240,0.3)] hover:text-[rgba(240,240,240,0.5)] transition-colors"
                >
                  Know more
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          FULL-BLEED STATEMENT BANNER — Figma 467:145
          h 282 · bg #0D0D0D + photo at 5% luminosity
          Copy: Inter 600 · 38/40 · -0.57px
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative h-[282px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[#0D0D0D]" />
        <img
          src="/images/studio.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-[0.05]"
        />
        {/* Grape wash — matches the violet cast in the design */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(87,51,119,0.30) 0%, rgba(134,101,167,0.16) 45%, rgba(178,52,149,0.10) 100%)",
          }}
        />
        <div className="relative w-full max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0">
          <h2 className="font-semibold text-[26px] leading-[30px] sm:text-[38px] sm:leading-[40px] tracking-[-0.57px] text-[#F0F0F0]">
            docuseries, videocasts, podcasts, and series,
            <br />
            plus the production and co-production
          </h2>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FILTERS — Figma 467:412 / 726:538
          Row of pills, gap 10 · divider 15px below
         ═══════════════════════════════════════════════════════════ */}
      <div
        ref={listRef}
        className="max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0 pt-[150px] scroll-mt-[128px]"
      >
        <div className="flex flex-col gap-[15px]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[10px]">
            {/* Format pills */}
            <div className="flex flex-wrap items-center gap-[10px]">
              {formatTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFormatFilter(tab.value)}
                  className={formatFilter === tab.value ? PILL_ON : PILL_OFF}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Status pills */}
            <div className="flex flex-wrap items-center gap-[10px]">
              {["complete", "ongoing"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
                  className={statusFilter === s ? PILL_ON : PILL_OFF}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Divider — Figma Line 5 */}
          <div className="h-px w-full bg-[rgba(240,240,240,0.1)]" />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          PROJECT ROWS — Figma 710:1629 / 710:1631 / 710:1628
          Each row: flex gap 50 · py 100 · plate 600×322, alternating
         ═══════════════════════════════════════════════════════════ */}
      <div className="max-w-[1224px] mx-auto px-5 sm:px-8 xl:px-0">
        {projects.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-white/40 text-[15px] mb-2">No Studio work published yet</p>
            <p className="text-white/20 text-sm">
              Projects will appear here once they are published.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-white/30 text-sm py-24 text-center">
            No projects match these filters.
          </p>
        ) : (
          filtered.map((project, i) => (
            <ProjectRow key={project.slug} project={project} flip={i % 2 === 1} />
          ))
        )}
      </div>

      {/* Closing CTA — every DSH page ends with one */}
      <SupportCTA />

      <Footer />
    </main>
  );
}

/* ── "What Studio does" text item — Figma 486:1367 ──
   flex gap 50 · marker (64) + copy block (gap 10) */
function StudioCapability({
  n,
  title,
  body,
  pad,
  className = "",
}: {
  n: string;
  title: string;
  body: string;
  pad: "pl" | "pr";
  className?: string;
}) {
  return (
    <div
      className={`flex gap-[50px] items-center ${
        pad === "pl" ? "lg:pl-[40px]" : ""
      } ${className}`}
    >
      <StepMarker n={n} />
      <div
        className={`flex flex-col gap-[10px] items-start ${
          pad === "pr" ? "lg:pr-[40px]" : ""
        }`}
      >
        {/* Subs informations — Inter 600 · 16/20 */}
        <p className="font-semibold text-[16px] leading-[20px] text-white">{title}</p>
        <p className={BODY}>{body}</p>
      </div>
    </div>
  );
}

/* ── Image plate — Figma 486:1362 ──
   h 78 · rounded 6 · 1.5px hairline. Three stacked layers, as in the design:
     1. #0D0D0D base
     2. photo at 5% opacity, mix-blend-luminosity  (faint texture)
     3. violet gradient wash at full opacity        (the plate's colour) */
function ImagePlate({
  src,
  position,
  className = "",
}: {
  src: string;
  position: string;
  className?: string;
}) {
  return (
    <div
      className={`relative h-[78px] overflow-hidden ${CARD_BORDER} ${className}`}
      style={{ boxShadow: CARD_SHADOW_0, backgroundColor: C.bg }}
    >
      <img
        src={src}
        alt=""
        className="absolute inset-0 w-full h-full object-cover rounded-[6px] mix-blend-luminosity opacity-[0.05]"
        style={{ objectPosition: position }}
      />
      <div
        className="absolute inset-0 rounded-[6px]"
        style={{
          background:
            "linear-gradient(103deg, rgba(13,13,13,0) 0%, rgba(87,51,119,0.26) 48%, rgba(134,101,167,0.20) 78%, rgba(178,52,149,0.10) 100%)",
        }}
      />
    </div>
  );
}

/* ── Project row — Figma 710:1629 ──
   plate 600×322 (luminosity 30%) + copy column 591 (gap 36) */
function ProjectRow({ project, flip }: { project: StudioProject; flip: boolean }) {
  const format = FORMAT_LABELS[project.format] ?? project.format;
  const status = STATUS_LABELS[project.status] ?? project.status;

  return (
    <div className="flex flex-col lg:flex-row gap-[50px] items-start py-[100px]">
      {/* Plate */}
      <Link
        href={`/studio/${project.slug}`}
        className={`relative block w-full lg:w-[600px] h-[240px] sm:h-[322px] shrink-0 overflow-hidden group ${CARD_BORDER} ${
          flip ? "order-2" : "order-1"
        }`}
        style={{ boxShadow: CARD_SHADOW_2, backgroundColor: C.bg }}
      >
        {/* `mix-blend-luminosity` removed on purpose: it strips colour
            permanently, so the scroll effect had nothing to reveal. The card
            still starts monochrome — that is now grayscale(1) from
            `useScrollColorize` — and develops into colour as it rises. */}
        <img
          data-colorize
          src={project.thumbnailUrl || project.coverUrl}
          alt={project.title}
          className="absolute inset-0 w-full h-full object-cover rounded-[6px] opacity-30 group-hover:opacity-45 transition-opacity duration-500"
        />
      </Link>

      {/* Copy */}
      <div
        className={`flex flex-col gap-[36px] w-full lg:w-[591px] ${
          flip ? "order-1" : "order-2"
        }`}
      >
        <div className="flex flex-col gap-[40px]">
          <div className="flex flex-col gap-[20px]">
            <div className="flex flex-col gap-[30px] lg:w-[389px]">
              {/* Chip + status + year — gap 14 */}
              <div className="flex items-center gap-[14px]">
                <span className="bg-[#573377] px-[8px] py-[5px] rounded-[3px] text-[12px] font-medium text-[#F0F0F0] whitespace-nowrap">
                  {format}
                </span>
                <span className="flex items-center gap-[10px] text-[12px] font-medium whitespace-nowrap">
                  <span className="text-[#8665A7]">{status}</span>
                  <span className="text-[#595C5C]">{project.credits.year}</span>
                </span>
              </div>

              {/* Title — H6_Desktop_DSH 24/30 */}
              <Link href={`/studio/${project.slug}`}>
                <h3 className="font-semibold text-[24px] leading-[30px] text-[#F0F0F0] hover:text-[#F0F0F0]/80 transition-colors">
                  {project.title}
                </h3>
              </Link>
            </div>

            {/* Synopsis */}
            <p className={BODY}>
              {project.synopsisShort || project.oneLineDescription}
            </p>
          </div>

          {/* Produced by — gap 8 */}
          <div className="flex flex-col gap-[8px]">
            <p className="text-[10px] leading-[24px] tracking-[1.6px] uppercase text-[#363636]">
              Produced by
            </p>
            <p className="text-[15px] leading-[18px] text-[#F0F0F0]">
              {[project.credits.production, project.credits.coProduction]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        </div>

        {/* CTAs — gap 24, button px 20 */}
        <div className="flex flex-wrap items-center gap-[24px]">
          <Link
            href={`/studio/${project.slug}`}
            className={`${GLASS_BTN} px-[20px] py-[12px]`}
          >
            View all episodes
            <PlayArrow />
          </Link>
          <Link
            href={`/studio/${project.slug}`}
            className="text-[13px] font-medium text-[rgba(240,240,240,0.3)] hover:text-[rgba(240,240,240,0.5)] transition-colors"
          >
            Know more
          </Link>
        </div>
      </div>
    </div>
  );
}
