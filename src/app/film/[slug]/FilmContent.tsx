"use client";

import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Newsletter from "@/components/Newsletter";
import type { Film } from "@/lib/types";

/* ── Shared bits ── */

const LABEL = "text-[11px] tracking-[0.28em] text-white/30 uppercase";
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

  /* Credits list — label / value pairs from the data model */
  const credits: { label: string; value: string }[] = [
    { label: "Directed by", value: film.credits.direction },
    { label: "Production", value: film.credits.production },
    ...(film.credits.coProduction
      ? [{ label: "Co-production", value: film.credits.coProduction }]
      : []),
    { label: "Year", value: film.credits.year },
    { label: "Runtime", value: film.credits.duration },
    { label: "Genre", value: `${formLabel} · ${formatLabel}` },
    { label: "Language", value: film.credits.language },
    { label: "Country", value: film.credits.country },
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
      <section className="relative overflow-hidden pt-[96px] lg:pt-[104px] min-h-[62vh] lg:min-h-[70vh] flex flex-col justify-end">
        {/* Background image — right-anchored, purple-tinted */}
        <div className="absolute inset-0">
          <img
            src={film.posterUrl || film.thumbnailUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "70% 30%" }}
          />
          {/* left → right darkening so text reads on the left */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/85 to-[#0A0A0A]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/20 to-transparent" />
          {/* purple wash from the right */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(270deg, rgba(134,101,167,0.35) 0%, rgba(178,52,149,0.10) 35%, transparent 65%)",
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
            className="font-semibold text-[34px] leading-[38px] sm:text-[44px] sm:leading-[48px] max-w-3xl"
            style={{ letterSpacing: "-0.02em" }}
          >
            {film.title}
          </h1>

          {/* Short description */}
          <p className="text-[16px] leading-[24px] text-white/45 mt-5 max-w-xl">
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
                  style={{ filter: "brightness(0.95) contrast(1)" }}
                />
              </div>
            </div>

            {/* Synopsis + editorial */}
            <div className="reveal-right flex-1">
              <p className={LABEL}>Synopsis</p>
              <div className="mt-5 space-y-5">
                {synopsisParas.map((p, i) => (
                  <p key={i} className="text-[16px] leading-[26px] text-white/60">
                    {p}
                  </p>
                ))}
              </div>

              <p className={`${LABEL} mt-12`}>Editorial context</p>
              <p className="mt-5 text-[16px] leading-[26px] text-white/45">
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
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            CREDITS
           ═══════════════════════════════════════ */}
        <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pb-16 sm:pb-20">
          <p className={`${LABEL} mb-8`}>Credits</p>
          <div className="border-t border-white/[0.08]">
            {credits.map((c) => (
              <div
                key={c.label}
                className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-8 py-4 border-b border-white/[0.08]"
              >
                <span className="text-[11px] tracking-[0.2em] text-white/30 uppercase w-full sm:w-56 shrink-0">
                  {c.label}
                </span>
                <span className="text-[15px] text-white/75">{c.value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ═══════════════════════════════════════
          FULL-BLEED CINEMATIC STRIP
         ═══════════════════════════════════════ */}
      <section className="relative h-[280px] sm:h-[360px] lg:h-[440px] overflow-hidden">
        <img
          src="/images/political-education.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "grayscale(1) brightness(0.6) contrast(0.95)", objectPosition: "center 40%" }}
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]/40" />
      </section>

      <div>
        {/* ═══════════════════════════════════════
            FESTIVALS & AWARDS
           ═══════════════════════════════════════ */}
        {film.festivals.length > 0 && (
          <section className="max-w-[1200px] mx-auto px-5 sm:px-8 py-16 sm:py-20">
            <p className={`${LABEL} mb-8`}>Festivals &amp; Awards</p>
            <div className="border-t border-white/[0.08]">
              {film.festivals.map((f, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-8 py-4 border-b border-white/[0.08]"
                >
                  <span className="text-[13px] text-white/30 w-16 shrink-0">{f.year}</span>
                  <span className="text-[15px] text-white/80 flex-1">{f.name}</span>
                  <span className="text-[13px] text-[#8665A7]">{f.award || f.selection}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════
            SCREENINGS
           ═══════════════════════════════════════ */}
        {film.screenings.length > 0 && (
          <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pb-16 sm:pb-20">
            <p className={`${LABEL} mb-8`}>Where to watch</p>
            <div className="border-t border-white/[0.08]">
              {film.screenings.map((s, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-8 py-4 border-b border-white/[0.08]"
                >
                  <span className="text-[13px] text-white/30 w-28 shrink-0">{formatDate(s.date)}</span>
                  <span className="text-[15px] text-white/80 flex-1">{s.event}</span>
                  <span className="text-[13px] text-white/45 inline-flex items-center gap-1.5">
                    {s.location}
                    <svg className="w-3.5 h-3.5 text-[#32C6CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════
            PRESS
           ═══════════════════════════════════════ */}
        {film.pressQuotes.length > 0 && (
          <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pb-16 sm:pb-20">
            <p className={`${LABEL} mb-8`}>Press</p>
            <div className="space-y-8 max-w-3xl">
              {film.pressQuotes.map((pq, i) => (
                <blockquote key={i}>
                  <p className="text-[18px] leading-[28px] text-white/70 italic">
                    &ldquo;{pq.quote}&rdquo;
                  </p>
                  <cite className="not-italic text-[13px] text-white/35 mt-2 block">
                    — {pq.source}
                  </cite>
                </blockquote>
              ))}
            </div>
          </section>
        )}

        {/* Distribution actions */}
        <section className="max-w-[1200px] mx-auto px-5 sm:px-8 pb-20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-white/[0.08]">
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

          <div className="mt-10 max-w-md mx-auto rounded-[6px] border border-white/[0.08] bg-white/[0.02] p-6 text-left">
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
