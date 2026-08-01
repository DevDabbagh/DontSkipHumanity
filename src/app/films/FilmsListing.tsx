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
          FEATURED SECTION
         ═══════════════════════════════════════ */}
      {featured && (
        <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-20">
          {/* Label */}
          <p className="text-[10px] tracking-[0.3em] text-white/25 uppercase mb-6">
            Featured
          </p>

          <div className="flex flex-col md:flex-row gap-8 md:gap-10">
            {/* Poster — left */}
            <div className="relative w-full md:w-[42%] shrink-0">
              <Link href={`/film/${featured.slug}`} className="block group">
                <div className="relative aspect-[4/3] rounded-[6px] overflow-hidden border border-white/[0.06] shadow-lg shadow-black/40">
                  <img
                    src={featured.posterUrl || featured.thumbnailUrl}
                    alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                    style={{ filter: "grayscale(0.15) brightness(0.85) contrast(1.05)" }}
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>

            {/* Info — right */}
            <div className="flex-1 md:pt-2">
              {/* Category + year */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[#B23495] text-sm">
                  {featured.credits.form === "documentary" ? "Documentary" : "Fiction"}
                </span>
                <span className="text-white/30 text-sm">{featured.credits.year}</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-[28px] font-bold leading-tight">
                {featured.title}
              </h2>

              {/* Short description */}
              <p className="text-[13px] text-white/40 mt-4 leading-relaxed max-w-md">
                {featured.synopsisShort || featured.logline}
              </p>

              {/* Directed by */}
              <p className="text-[10px] tracking-[0.2em] text-white/20 uppercase mt-6 mb-1">
                Directed by
              </p>
              <p className="text-[13px] text-white/60">
                {featured.credits.direction}
              </p>

              {/* Longer description */}
              <p className="text-[13px] text-white/35 mt-6 leading-relaxed max-w-lg">
                {featured.editorialContext || featured.logline}
              </p>

              {/* Buttons */}
              <div className="flex items-center gap-4 mt-8">
                {featured.trailerUrl && (
                  <a
                    href={featured.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={BTN}
                  >
                    Watch trailer <span className="text-[#B23495]">▶</span>
                  </a>
                )}
                <Link
                  href={`/film/${featured.slug}`}
                  className="text-xs text-white/35 hover:text-white/60 transition-colors"
                >
                  Know more
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          GRADIENT BANNER
         ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden py-14 sm:py-16 lg:py-20">
        {/* Layer 1: cinematic B&W image, very dark */}
        <img
          src="/images/studio.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: "grayscale(1) brightness(0.12) contrast(0.9)",
            opacity: 0.35,
          }}
        />
        {/* Layer 2: black overlay */}
        <div className="absolute inset-0 bg-black/70" />
        {/* Layer 3: purple gradient from right */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(270deg, rgba(178,52,149,0.18) 0%, rgba(134,101,167,0.08) 40%, transparent 70%)",
          }}
        />

        {/* Text */}
        <div className="relative max-w-[1200px] mx-auto px-5 sm:px-8">
          <h3 className="text-xl sm:text-2xl md:text-[28px] font-semibold leading-snug max-w-2xl text-white">
            Development, Production, Post-production
            <br className="hidden sm:block" />
            choose whatever feels right to you
          </h3>
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
          <div className="space-y-14 sm:space-y-16 pb-20 sm:pb-24">
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
    <div className="flex gap-5">
      {/* Poster — B&W, cinematic */}
      <Link
        href={`/film/${film.slug}`}
        className="shrink-0 w-[160px] sm:w-[180px] group"
      >
        <div className="relative aspect-[3/4] rounded-[4px] overflow-hidden border border-white/[0.06]">
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
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-[10px] px-2 py-0.5 rounded-[3px] bg-[#B23495] text-white font-medium">
            {film.credits.form === "documentary" ? "Documentary" : "Fiction"}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-[3px] border border-white/10 text-white/50">
            {stage}
          </span>
          <span className="text-[10px] text-white/30">{film.credits.year}</span>
        </div>

        {/* Title */}
        <Link href={`/film/${film.slug}`}>
          <h3 className="text-base sm:text-lg font-bold text-white leading-snug hover:text-white/80 transition-colors">
            {film.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-[12px] text-white/35 mt-2 leading-relaxed line-clamp-3">
          {film.logline}
        </p>

        {/* Directed by */}
        <p className="text-[9px] tracking-[0.2em] text-white/15 uppercase mt-4 mb-0.5">
          Directed by
        </p>
        <p className="text-[12px] text-white/45">{film.credits.direction}</p>

        {/* Buttons */}
        <div className="flex items-center gap-3 mt-4">
          {film.trailerUrl && (
            <a
              href={film.trailerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={BTN}
            >
              Watch trailer <span className="text-[#B23495]">▶</span>
            </a>
          )}
          <Link
            href={`/film/${film.slug}`}
            className="text-xs text-white/30 hover:text-white/55 transition-colors"
          >
            Know more
          </Link>
        </div>
      </div>
    </div>
  );
}
