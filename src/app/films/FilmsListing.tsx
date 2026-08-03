"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Film, FilmStage } from "@/lib/types";

/* ── Constants ── */

const STAGE_LABELS: Record<string, string> = {
  development: "Development",
  production: "Production",
  post_production: "Post-production",
  festivals: "Festivals",
  distribution: "Distribution",
  impact: "Impact",
};

/* ── Shared button style ── */
const BTN =
  "text-xs border border-white/15 rounded-[3px] px-4 py-2 text-white/80 hover:text-white hover:border-white/25 transition-colors inline-flex items-center gap-1.5";
const BTN_ACTIVE =
  "text-xs rounded-[3px] px-4 py-2 bg-[#B23495] border border-[#B23495] text-white";

/* ── Component ── */

export default function FilmsListing({ films }: { films: Film[] }) {
  /* Featured */
  const featuredFilms = useMemo(() => films.filter((f) => f.isFeatured), [films]);
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const featured = featuredFilms[featuredIdx] ?? films[0] ?? null;

  /* Filters */
  const stageTabs = useMemo(() => {
    const present = Array.from(new Set(films.map((f) => f.stage))) as FilmStage[];
    return [
      { value: "all" as const, label: "View All" },
      ...present.map((s) => ({ value: s, label: STAGE_LABELS[s] ?? s })),
    ];
  }, [films]);

  const [stageFilter, setStageFilter] = useState<"all" | FilmStage>("all");
  const [formFilter, setFormFilter] = useState<"all" | Film["credits"]["form"]>("all");

  const rest = films.filter((f) => f.id !== featured?.id);
  const filtered = rest.filter((f) => {
    const stageOk = stageFilter === "all" || f.stage === stageFilter;
    const formOk = formFilter === "all" || f.credits.form === formFilter;
    return stageOk && formOk;
  });

  /* Pair films into rows of 2 for the editorial grid */
  const rows: Film[][] = [];
  for (let i = 0; i < filtered.length; i += 2) {
    rows.push(filtered.slice(i, i + 2));
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />

      {/* ═══════════════════════════════════════
          HERO  (exact Figma spec — DSH – Films Landing)
          · Heading: Inter SemiBold 50/52, -2% tracking, block 362px
          · Description: 16/24, block 408px
          · Gaps: label→heading 14, heading→desc 60, desc→buttons 60
          · Image: starts at 50%, H 646, 1.5px #F0F0F0/10 border, bleeds right
          · Left preview strip: same image, another crop, fixed 80px
          · Text column fixed width (aligned to page container); image is the
            only fluid element — it absorbs all extra viewport width.
         ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-[96px] lg:pt-[104px]">
        {/* Far-left preview strip — SAME image, another crop, fixed 80px */}
        {featured && (
          <div
            className="hidden xl:block absolute top-[104px] left-0 h-[clamp(560px,42vw,780px)] overflow-hidden pointer-events-none select-none"
            style={{ width: "max(64px, calc((100vw - 1264px) / 2))" }}
          >
            <img
              src={featured.posterUrl || featured.thumbnailUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                objectPosition: "20% 42%",
                filter: "grayscale(1) brightness(0.5) contrast(0.92)",
              }}
            />
            <div className="absolute inset-0 bg-black/45" />
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-0">
          {/* Text column — FIXED width, aligned to the page's 1200 container.
              shrink-0 + grow-0 lock it; never scales or reflows. */}
          <div className="shrink-0 grow-0 w-full lg:w-auto px-5 sm:px-8 lg:px-0 lg:pl-[max(2rem,calc((100vw-1200px)/2+2rem))] lg:pr-[64px]">
            <div className="lg:w-[408px]">
              <p className="text-[11px] leading-[24px] tracking-[0.28em] text-white/30 uppercase mb-[14px]">
                Films
              </p>
              <h1
                className="font-semibold text-[40px] leading-[42px] sm:text-[50px] sm:leading-[52px] lg:w-[362px]"
                style={{ letterSpacing: "-0.02em" }}
              >
                Documentary
                <br />
                and fiction that
                <br />
                stay close and
                <br />
                <span className="gradient-text">refuse erasure.</span>
              </h1>
              <p className="text-[16px] leading-[24px] text-white/40 mt-[60px] lg:w-[408px]">
                DSH makes documentary and fiction — from development and
                production to festivals and distribution. Films are not
                streamed here. This section presents the work with rigour
                and context, and opens paths to screenings, distribution,
                and press.
              </p>
              <div className="flex items-center gap-3 mt-[60px]">
                <button
                  onClick={() => setFormFilter("documentary")}
                  className="text-sm border border-white/15 rounded-[3px] px-5 py-2.5 text-white/80 bg-transparent hover:border-white/30 hover:text-white transition-colors"
                >
                  Explore documentaries
                </button>
                <button
                  onClick={() => setFormFilter("fiction")}
                  className="text-sm border border-white/15 rounded-[3px] px-5 py-2.5 text-white/80 bg-transparent hover:border-white/30 hover:text-white transition-colors"
                >
                  Explore fiction
                </button>
              </div>
            </div>
          </div>

          {/* Hero image — the ONLY fluid element. flex-1 + w-0 absorbs all
              remaining viewport width; object-cover reveals more as it widens. */}
          <div className="w-full lg:flex-1 lg:w-0 lg:min-w-0 px-5 sm:px-8 lg:px-0">
            {featured && (
              <div
                className="relative aspect-[4/3] lg:aspect-auto lg:h-[clamp(560px,42vw,780px)] overflow-hidden"
                style={{ boxShadow: "0 24px 70px -20px rgba(0,0,0,0.7)" }}
              >
                <img
                  src={featured.posterUrl || featured.thumbnailUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    objectPosition: "55% 42%",
                    filter: "grayscale(1) brightness(0.8) contrast(1)",
                  }}
                />
                {/* Light cinematic overlay — image is clearly visible, text sits beside it */}
                <div className="absolute inset-0 bg-black/20" />
                {/* Shadow layer — soft left-side gradient so the image blends toward the text */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent" />
                {/* Bottom shadow — the image fades into darkness at the bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURED SECTION
         ═══════════════════════════════════════ */}
      {featured && (
        <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-20 sm:pt-24 lg:pt-28 pb-16 sm:pb-20">
          {/* Label */}
          <p className="text-[10px] tracking-[0.3em] text-white/25 uppercase mb-6">
            Featured
          </p>

          <div className="flex flex-col md:flex-row gap-8 md:gap-12">
            {/* Poster — left */}
            <div className="relative w-full md:w-[48%] shrink-0">
              <Link href={`/film/${featured.slug}`} className="block group">
                <div className="relative aspect-[4/5] rounded-[6px] overflow-hidden border border-white/[0.06] shadow-lg shadow-black/40">
                  <img
                    src={featured.posterUrl || featured.thumbnailUrl}
                    alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                  />
                </div>
              </Link>
              {/* Navigation arrow — centered vertically on the poster */}
              {featuredFilms.length > 1 && (
                <button
                  onClick={() =>
                    setFeaturedIdx((i) => (i + 1) % featuredFilms.length)
                  }
                  aria-label="Next featured film"
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:bg-black/60 transition-colors backdrop-blur-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>

            {/* Info — right */}
            <div className="flex-1 md:pt-4">
              {/* Category + year */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[#B23495] text-[15px]">
                  {featured.credits.form === "documentary" ? "Documentary" : "Fiction"}
                </span>
                <span className="text-white/35 text-[15px]">{featured.credits.year}</span>
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-[38px] font-bold leading-[1.1]">
                {featured.title}
              </h2>

              {/* Short description */}
              <p className="text-[15px] text-white/50 mt-6 leading-[1.7] max-w-lg">
                {featured.synopsisShort || featured.logline}
              </p>

              {/* Directed by */}
              <p className="text-[10px] tracking-[0.25em] text-white/30 uppercase mt-10 mb-1.5">
                Directed by
              </p>
              <p className="text-[15px] text-white/80">
                {featured.credits.direction}
              </p>

              {/* Longer description */}
              <p className="text-[15px] text-white/40 mt-8 leading-[1.7] max-w-lg">
                {featured.editorialContext || featured.logline}
              </p>

              {/* Buttons */}
              <div className="flex items-center gap-6 mt-10">
                {featured.trailerUrl && (
                  <a
                    href={featured.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm border border-white/15 rounded-[3px] px-5 py-2.5 text-white/80 hover:text-white hover:border-white/25 transition-colors inline-flex items-center gap-2"
                  >
                    Watch trailer <span className="text-[#B23495]">▶</span>
                  </a>
                )}
                <Link
                  href={`/film/${featured.slug}`}
                  className="text-sm text-white/40 hover:text-white/65 transition-colors"
                >
                  Know more
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          CINEMATIC EDITORIAL BANNER
         ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden h-[280px] sm:h-[340px] lg:h-[400px] flex items-center">
        {/* Layer 1: full-width background photograph — clearly visible */}
        <img
          src="/images/studio.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{
            filter: "grayscale(0.6) brightness(0.35) contrast(1.05)",
          }}
        />
        {/* Layer 2: dark cinematic overlay — darkens but image stays visible */}
        <div className="absolute inset-0 bg-black/40" />
        {/* Layer 3: very subtle purple accent from right */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(270deg, rgba(134,101,167,0.12) 0%, rgba(178,52,149,0.04) 35%, transparent 60%)",
          }}
        />

        {/* Text — left-aligned, vertically centered */}
        <div className="relative max-w-[1200px] w-full mx-auto px-5 sm:px-8">
          <h3 className="text-2xl sm:text-3xl md:text-[36px] font-semibold leading-[1.25] text-white max-w-2xl">
            Development, Production, Post-production
          </h3>
          <p className="text-lg sm:text-xl md:text-[24px] font-medium leading-[1.3] text-white/90 mt-2">
            choose whatever feels right to you
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FILTER BAR
         ═══════════════════════════════════════ */}
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-12 sm:pt-14">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12 sm:mb-14">
          {/* Left — stage filters */}
          <div className="flex flex-wrap items-center gap-2">
            {stageTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStageFilter(tab.value)}
                className={stageFilter === tab.value ? BTN_ACTIVE : BTN}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Right — form filters */}
          <div className="flex items-center gap-2">
            {[
              { value: "all" as const, label: "All" },
              { value: "documentary" as const, label: "Documentary" },
              { value: "fiction" as const, label: "Fiction" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFormFilter(tab.value)}
                className={
                  formFilter === tab.value
                    ? "text-xs rounded-[3px] px-4 py-2 bg-white/10 border border-white/25 text-white"
                    : BTN
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════
            FILM GRID — 2-column editorial rows
           ═══════════════════════════════════════ */}
        {filtered.length === 0 ? (
          <p className="text-white/30 text-sm py-16 text-center">
            No films match these filters yet.
          </p>
        ) : (
          <div className="space-y-16 sm:space-y-20 pb-20 sm:pb-24">
            {rows.map((row, ri) => (
              <div
                key={ri}
                className="grid md:grid-cols-2 gap-10 md:gap-8 lg:gap-10"
              >
                {row.map((film) => (
                  <FilmRow key={film.slug} film={film} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}

/* ── Film row item — editorial layout matching Figma ── */

function FilmRow({ film }: { film: Film }) {
  const stage = STAGE_LABELS[film.stage] ?? film.stage;

  return (
    <div className="flex flex-col">
      <div className="flex gap-6">
        {/* Poster — B&W, cinematic */}
        <Link
          href={`/film/${film.slug}`}
          className="shrink-0 w-[180px] sm:w-[210px] group"
        >
          <div className="relative aspect-[4/5] rounded-[4px] overflow-hidden border border-white/[0.06]">
            <img
              src={film.posterUrl || film.thumbnailUrl}
              alt={film.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
              style={{
                filter: "grayscale(1) brightness(0.55) contrast(1.1)",
              }}
            />
          </div>
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0 pt-1">
          {/* Category chips + year */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[11px] px-2.5 py-1 rounded-[3px] bg-[#B23495] text-white font-medium">
              {film.credits.form === "documentary" ? "Documentary" : "Fiction"}
            </span>
            <span className="text-[11px] px-2.5 py-1 rounded-[3px] border border-white/10 text-white/50">
              {stage}
            </span>
            <span className="text-[11px] text-white/30">{film.credits.year}</span>
          </div>

          {/* Title */}
          <Link href={`/film/${film.slug}`}>
            <h3 className="text-lg sm:text-[22px] font-bold text-white leading-snug hover:text-white/80 transition-colors">
              {film.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-[14px] text-white/40 mt-3 leading-[1.7] line-clamp-3">
            {film.logline}
          </p>

          {/* Directed by */}
          <p className="text-[10px] tracking-[0.25em] text-white/25 uppercase mt-6 mb-1">
            Directed by
          </p>
          <p className="text-[14px] text-white/60">{film.credits.direction}</p>
        </div>
      </div>

      {/* Buttons — below the card */}
      <div className="flex items-center gap-4 mt-6 pl-0">
        {film.trailerUrl && (
          <a
            href={film.trailerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm border border-white/15 rounded-[3px] px-5 py-2.5 text-white/80 hover:text-white hover:border-white/25 transition-colors inline-flex items-center gap-2"
          >
            Watch trailer <span className="text-[#B23495]">▶</span>
          </a>
        )}
        <Link
          href={`/film/${film.slug}`}
          className="text-sm text-white/35 hover:text-white/60 transition-colors"
        >
          Know more
        </Link>
      </div>
    </div>
  );
}
