"use client";

import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import ScrollGallery from "@/components/ScrollGallery";
import type { Film } from "@/lib/types";

/* ── Shared bits ── */

/* Section labels — Figma spec: #363636 */
const LABEL = "text-[11px] tracking-[0.28em] text-[#363636] uppercase";
/* Outline button — Figma spec: text F0F0F0/40, stroke F0F0F0/20, bg 1B1B1B/20, radius 3 */
const BTN =
  "text-sm rounded-[3px] px-5 py-2.5 border border-[#F0F0F0]/20 bg-[#1B1B1B]/20 text-[#F0F0F0]/40 hover:text-[#F0F0F0]/70 hover:border-[#F0F0F0]/30 transition-colors inline-flex items-center gap-2";
/* Text link — Figma spec: F0F0F0/30 */
const BTN_LINK =
  "text-sm text-[#F0F0F0]/30 hover:text-[#F0F0F0]/60 transition-colors";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function FilmContent({
  film,
  relatedFilms,
}: {
  film: Film;
  relatedFilms: Film[];
}) {
  const sectionRef = useReveal();
  const formLabel = film.credits.form === "documentary" ? "Documentary" : "Fiction";
  const formatLabel =
    film.credits.format === "feature"
      ? "Feature"
      : film.credits.format === "short"
      ? "Short"
      : "Series";

  const STAGE_LABEL: Record<string, string> = {
    development: "Development",
    production: "Production",
    post_production: "Post-production",
    festivals: "Festivals",
    distribution: "Distribution",
    impact: "Impact",
  };

  /* Credits — grouped. Value colors per spec:
     group 1 (people) → #F0F0F0, group 2 (facts) → #595C5C,
     Stage / Status → #771D5C. Labels are always #363636. */
  type Credit = { label: string; value: string; color: string };
  const creditGroups: Credit[][] = [
    [
      { label: "Directed by", value: film.credits.direction, color: "#F0F0F0" },
      { label: "Produced by", value: film.credits.production, color: "#F0F0F0" },
      ...(film.credits.coProduction
        ? [{ label: "Co-production", value: film.credits.coProduction, color: "#F0F0F0" }]
        : []),
    ],
    [
      { label: "Year", value: film.credits.year, color: "#595C5C" },
      { label: "Duration", value: film.credits.duration, color: "#595C5C" },
      { label: "Form", value: formLabel, color: "#595C5C" },
      { label: "Format", value: formatLabel, color: "#595C5C" },
      { label: "Language", value: film.credits.language, color: "#595C5C" },
      { label: "Country", value: film.credits.country, color: "#595C5C" },
    ],
    [
      { label: "Stage / Status", value: STAGE_LABEL[film.stage] ?? film.stage, color: "#771D5C" },
    ],
  ];

  /* Split the long synopsis into paragraphs on sentence groups */
  const synopsisParas = film.synopsisLong
    .split(/\n+/)
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />

      {/* ═══════════════════════════════════════
          HERO
         ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-[96px] lg:pt-[104px] min-h-[62vh] lg:min-h-[70vh] flex flex-col justify-end border-b border-[#161616]">
        {/* Background — dark base + photo @30% + purple diagonal @20% + vertical blend */}
        <div className="absolute inset-0 bg-[#0D0D0D]">
          {/* Photograph — 30% opacity */}
          <img
            src={film.posterUrl || film.thumbnailUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "70% 30%", opacity: 0.3, filter: "grayscale(1)" }}
          />
          {/* Linear 2 — diagonal #0D0D0D → #B23495, whole layer 20% */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, #0D0D0D 0%, #B23495 100%)",
              opacity: 0.2,
            }}
          />
          {/* Linear 1 — vertical #0D0D0D top & bottom (readability + blend) */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, #0D0D0D 0%, rgba(13,13,13,0) 35%, rgba(13,13,13,0) 62%, #0D0D0D 100%)",
            }}
          />
        </div>

        <div className="relative max-w-[1200px] w-full mx-auto px-5 sm:px-8 pb-14 sm:pb-16 lg:pb-20">
          {/* Breadcrumb */}
          <Link
            href="/films"
            className="inline-flex items-center gap-2 text-sm text-white/45 hover:text-white transition-colors mb-8"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>

          {/* Category + year */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[#B23495] text-sm">{formLabel}</span>
            <span className="text-[#595C5C] text-sm">{film.credits.year}</span>
          </div>

          {/* Title */}
          <h1
            className="font-semibold text-[34px] leading-[38px] sm:text-[44px] sm:leading-[48px] max-w-3xl text-[#F0F0F0]"
            style={{ letterSpacing: "-0.02em" }}
          >
            {film.title}
          </h1>

          {/* Short description */}
          <p className="text-[16px] leading-[24px] text-[#595C5C] mt-5 max-w-xl">
            {film.synopsisShort}
          </p>

          {/* Actions — Watch trailer far left, distribution links far right */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 sm:gap-8 mt-10">
            {film.trailerUrl && (
              <a href={film.trailerUrl} target="_blank" rel="noopener noreferrer" className={BTN}>
                Watch trailer <span className="text-[#B23495]">▶</span>
              </a>
            )}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
              <Link href="/#support" className={BTN_LINK}>Request a screener</Link>
              <Link href="/#support" className={BTN_LINK}>Request a screening</Link>
              <Link href="/#support" className={BTN_LINK}>Contact for distribution</Link>
            </div>
          </div>
        </div>
      </section>

      <div ref={sectionRef}>
        {/* ═══════════════════════════════════════
            POSTER + SYNOPSIS + EDITORIAL
           ═══════════════════════════════════════ */}
        <section className="max-w-[1200px] mx-auto px-5 sm:px-8 py-16 sm:py-20 lg:py-24">
          <div className="flex flex-col md:flex-row gap-10 md:gap-16">
            {/* Poster */}
            <div className="reveal-left shrink-0 w-full md:w-[320px]">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[4px] border border-white/[0.06]">
                <img
                  src={film.posterUrl || film.thumbnailUrl}
                  alt={film.title}
                  className="w-full h-full object-cover"
                  style={{ opacity: 0.8 }}
                />
              </div>
            </div>

            {/* Synopsis + Editorial + Credits — dividers (#161616) between each */}
            <div className="reveal-right flex-1">
              {/* Synopsis */}
              <p className={LABEL}>Synopsis</p>
              {/* short synopsis — 595C5C, long synopsis — 363636 */}
              <p className="mt-5 text-[16px] leading-[26px] text-[#595C5C]">
                {film.synopsisShort}
              </p>
              <div className="mt-5 space-y-5">
                {synopsisParas.map((p, i) => (
                  <p key={i} className="text-[16px] leading-[26px] text-[#363636]">
                    {p}
                  </p>
                ))}
              </div>

              {/* divider */}
              <div className="border-t border-[#161616] my-10" />

              {/* Editorial context */}
              <p className={LABEL}>Editorial context</p>
              <p className="mt-5 text-[16px] leading-[26px] text-[#595C5C]">
                {film.editorialContext}
              </p>
              {film.themes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8">
                  {film.themes.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-3.5 py-1.5 rounded-[3px] bg-white/[0.04] text-white/45 border border-white/[0.06]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* divider */}
              <div className="border-t border-[#161616] my-10" />

              {/* Credits */}
              <p className={LABEL}>Credits</p>
              <div className="mt-6 space-y-8">
                {creditGroups.map((group, gi) => (
                  <div key={gi} className="space-y-3">
                    {group.map((c) => (
                      <div
                        key={c.label}
                        className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-8"
                      >
                        <span className="text-[11px] tracking-[0.2em] text-[#363636] uppercase w-full sm:w-56 shrink-0">
                          {c.label}
                        </span>
                        <span className="text-[15px]" style={{ color: c.color }}>
                          {c.value}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ═══════════════════════════════════════
          SCROLL GALLERY — pinned horizontal, colour-on-focus
         ═══════════════════════════════════════ */}
      <ScrollGallery images={film.detailsSliders} />

      <div>
        {/* ═══════════════════════════════════════
            FESTIVALS & AWARDS
           ═══════════════════════════════════════ */}
        {film.festivals.length > 0 && (
          <section className="max-w-[1200px] mx-auto px-5 sm:px-8 py-16 sm:py-20">
            <div className="flex flex-col md:flex-row gap-10 md:gap-16">
              <div className="hidden md:block shrink-0 w-[320px]" aria-hidden />
              <div className="flex-1">
                <p className={`${LABEL} mb-8`}>Festivals &amp; Awards</p>
                <div className="border-t border-[#161616]">
                  {film.festivals.map((f, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-8 py-4 border-b border-[#161616]"
                    >
                      <span className="text-[13px] text-[#363636] w-16 shrink-0">{f.year}</span>
                      <span className="text-[15px] text-[#F0F0F0] flex-1">{f.name}</span>
                      <span className="text-[13px] text-[#595C5C]">{f.award || f.selection}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════
            SCREENINGS
           ═══════════════════════════════════════ */}
        {film.screenings.length > 0 && (
          <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pb-16 sm:pb-20">
            <div className="flex flex-col md:flex-row gap-10 md:gap-16">
              <div className="hidden md:block shrink-0 w-[320px]" aria-hidden />
              <div className="flex-1">
                <p className={`${LABEL} mb-8`}>Where to watch</p>
                <div className="border-t border-[#161616]">
                  {film.screenings.map((s, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-8 py-4 border-b border-[#161616]"
                    >
                      <span className="text-[13px] text-[#363636] w-28 shrink-0">{formatDate(s.date)}</span>
                      <span className="text-[15px] text-[#F0F0F0] flex-1">{s.event}</span>
                      <span className="text-[13px] text-[#595C5C] inline-flex items-center gap-1.5">
                        {s.location}
                        <svg className="w-3.5 h-3.5 text-[#32C6CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════
            PRESS
           ═══════════════════════════════════════ */}
        {film.pressQuotes.length > 0 && (
          <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pb-16 sm:pb-20">
            <div className="flex flex-col md:flex-row gap-10 md:gap-16">
              <div className="hidden md:block shrink-0 w-[320px]" aria-hidden />
              <div className="flex-1">
                <p className={`${LABEL} mb-8`}>Press</p>
                <div className="space-y-10 max-w-3xl">
                  {film.pressQuotes.map((pq, i) => (
                    <blockquote key={i} className="border-l-2 border-[#3D0F2F] pl-6">
                      <p className="text-[18px] leading-[28px] text-[#9D9C9C] italic">
                        {pq.quote}
                      </p>
                      <cite className="not-italic text-[11px] tracking-[0.2em] uppercase text-[#363636] mt-3 block">
                        {pq.source}
                      </cite>
                    </blockquote>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Distribution actions */}
        <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pb-20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-[#161616]">
          <button className={BTN}>share this project</button>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <Link href="/#support" className={BTN_LINK}>Request a screener</Link>
            <Link href="/#support" className={BTN_LINK}>Request a screening</Link>
            <Link href="/#support" className={BTN_LINK}>Contact for distribution</Link>
          </div>
        </section>
      </div>

      {/* ═══════════════════════════════════════
          SUPPORT CTA
         ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden py-20 sm:py-24 lg:py-28">
        <img
          src="/images/support.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "grayscale(0.7) brightness(0.2) contrast(0.9)", opacity: 0.4 }}
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative max-w-[1200px] mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-[32px] font-semibold">
            Want to support directly this project?
          </h2>
          <p className="text-[15px] text-white/40 mt-4 max-w-xl mx-auto leading-relaxed">
            Independent political film doesn&apos;t pay for itself. Your support keeps the
            work free of editorial strings.
          </p>

          <div className="mt-10 max-w-md mx-auto rounded-[6px] border border-[#161616] bg-white/[0.02] p-6 text-left">
            <p className={LABEL}>Support</p>
            <h3 className="text-xl font-semibold mt-3">Support our work</h3>
            <p className="text-[14px] text-white/40 mt-2 leading-relaxed">
              A single contribution, an amount, your project of choice.
            </p>
            <Link
              href="/#support"
              className="mt-6 w-full inline-flex items-center justify-center gradient-fill-btn px-5 py-3 rounded-[3px] text-sm font-medium"
            >
              Support this project
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FILMS CONNECTED
         ═══════════════════════════════════════ */}
      {relatedFilms.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <p className={`${LABEL} mb-10`}>Films connected</p>
          <div className="grid md:grid-cols-2 gap-10 lg:gap-14">
            {relatedFilms.slice(0, 2).map((rf) => (
              <div key={rf.slug} className="flex flex-col sm:flex-row gap-6 group">
                <Link href={`/film/${rf.slug}`} className="shrink-0 w-full sm:w-[200px]">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[4px] border border-white/[0.06]">
                    <img
                      src={rf.posterUrl || rf.thumbnailUrl}
                      alt={rf.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    />
                  </div>
                </Link>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] px-2 py-0.5 rounded-[3px] bg-[#B23495] text-white font-medium">
                      {rf.credits.form === "documentary" ? "Documentary" : "Fiction"}
                    </span>
                    <span className="text-[13px] text-white/30">{rf.credits.year}</span>
                  </div>
                  <Link href={`/film/${rf.slug}`}>
                    <h3 className="text-xl font-semibold group-hover:text-white/80 transition-colors">
                      {rf.title}
                    </h3>
                  </Link>
                  <p className="text-[14px] text-white/40 mt-2 leading-relaxed line-clamp-3">
                    {rf.logline}
                  </p>
                  <p className="text-[13px] text-white/50 mt-4">
                    Directed by {rf.credits.direction}
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    {rf.trailerUrl && (
                      <a href={rf.trailerUrl} target="_blank" rel="noopener noreferrer" className={BTN}>
                        Watch trailer <span className="text-[#B23495]">▶</span>
                      </a>
                    )}
                    <Link href={`/film/${rf.slug}`} className={BTN_LINK}>
                      Know more
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════
          NEWSLETTER + FOOTER
         ═══════════════════════════════════════ */}
      <Newsletter />
      <Footer />
    </main>
  );
}
