"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SupportCTA from "@/components/SupportCTA";
import type { Film, FilmStage } from "@/lib/types";

const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  development: { label: "Development", color: "bg-indigo-500/20 text-indigo-300" },
  production: { label: "Production", color: "bg-amber-500/20 text-amber-300" },
  post_production: { label: "Post-production", color: "bg-orange-500/20 text-orange-300" },
  festivals: { label: "Festivals", color: "bg-[#9B59B6]/20 text-[#c084fc]" },
  distribution: { label: "Distribution", color: "bg-[#1ABC9C]/20 text-[#1ABC9C]" },
  impact: { label: "Impact", color: "bg-emerald-500/20 text-emerald-300" },
};

const FORM_TABS: { value: "all" | Film["credits"]["form"]; label: string }[] = [
  { value: "all", label: "All" },
  { value: "documentary", label: "Documentary" },
  { value: "fiction", label: "Fiction" },
];

export default function FilmsListing({ films }: { films: Film[] }) {
  const heroRef = useReveal();
  const sectionRef = useReveal();
  const featuredFilms = useMemo(() => films.filter((f) => f.isFeatured), [films]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const featured = featuredFilms[featuredIndex] ?? null;

  const stageTabs = useMemo(() => {
    const present = Array.from(new Set(films.map((f) => f.stage))) as FilmStage[];
    return [{ value: "all" as const, label: "View All" }, ...present.map((s) => ({ value: s, label: STAGE_LABELS[s]?.label ?? s }))];
  }, [films]);

  const [stageFilter, setStageFilter] = useState<"all" | FilmStage>("all");
  const [formFilter, setFormFilter] = useState<"all" | Film["credits"]["form"]>("all");

  const rest = films.filter((f) => f.id !== featured?.id);
  const filtered = rest.filter((f) => {
    const stageOk = stageFilter === "all" || f.stage === stageFilter;
    const formOk = formFilter === "all" || f.credits.form === formFilter;
    return stageOk && formOk;
  });

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white">
      <Navbar />

      {/* Hero — text left, full-bleed image right */}
      <section className="pt-14" ref={heroRef}>
        <div className="flex flex-col md:flex-row items-center">
          <div className="reveal-left w-full md:w-1/2 px-5 sm:px-8 pt-14 sm:pt-16 pb-10 md:pl-14 md:pr-8">
            <p className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-4">Films & Studio</p>
            <h1 className="text-3xl sm:text-4xl md:text-[2.6rem] font-bold leading-[1.15] tracking-tight">
              Documentary and fiction that stay close
              <span className="gradient-text"> and refuse erasure.</span>
            </h1>
            <p className="text-gray-400 mt-5 max-w-lg leading-relaxed">
              DSH makes documentary and fiction — from development and production to
              festivals and distribution. Films are not streamed here. This section
              presents the work with rigour and context, and opens paths to
              screenings and press.
            </p>
            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={() => setFormFilter("documentary")}
                className="text-sm border border-white/15 rounded-full px-5 py-2.5 text-white hover:bg-white/5 transition-colors"
              >
                Explore documentaries
              </button>
              <button
                onClick={() => setFormFilter("fiction")}
                className="text-sm border border-white/15 rounded-full px-5 py-2.5 text-white hover:bg-white/5 transition-colors"
              >
                Explore fiction
              </button>
            </div>
          </div>
          <div className="reveal-right w-full md:w-1/2 h-[260px] sm:h-[340px] md:h-[440px] px-5 sm:px-8 md:px-0">
            <div className="relative w-full h-full overflow-hidden md:rounded-tl-[6px] md:rounded-bl-[6px]">
              {featured && (
                <img
                  src={featured.posterUrl || featured.thumbnailUrl}
                  alt=""
                  className="w-full h-full object-cover grayscale"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D]/60 md:from-[#0D0D0D]/40 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <div ref={sectionRef}>
        {/* Featured film */}
        {featured && (
          <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-14 sm:py-16">
            <p className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-6">Featured</p>
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
              <div className="reveal-left relative w-full md:w-5/12 group">
                <Link href={`/film/${featured.slug}`} className="block">
                  <div className="relative aspect-[16/10] rounded-lg overflow-hidden">
                    <img
                      src={featured.thumbnailUrl}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </Link>
                {featuredFilms.length > 1 && (
                  <>
                    <button
                      onClick={() => setFeaturedIndex((i) => (i - 1 + featuredFilms.length) % featuredFilms.length)}
                      aria-label="Previous featured film"
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setFeaturedIndex((i) => (i + 1) % featuredFilms.length)}
                      aria-label="Next featured film"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              <div className="reveal-right w-full md:w-7/12">
                <p className="text-sm text-[#D81B60] mb-2">
                  {featured.credits.form === "documentary" ? "Documentary" : "Fiction"} · {featured.credits.year}
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold">{featured.title}</h2>
                <p className="text-gray-500 mt-2 text-sm">Directed by {featured.credits.direction}</p>
                <p className="text-gray-400 mt-4 leading-relaxed max-w-xl">{featured.logline}</p>
                <div className="flex items-center gap-4 mt-6">
                  {featured.trailerUrl && (
                    <a
                      href={featured.trailerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm border border-white/15 rounded-full px-5 py-2 text-white hover:bg-white/5 transition-colors flex items-center gap-1.5"
                    >
                      Watch trailer <span className="text-[#D81B60]">▶</span>
                    </a>
                  )}
                  <Link href={`/film/${featured.slug}`} className="text-sm text-gray-400 hover:text-white transition-colors">
                    Know more
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gradient banner */}
        <div className="reveal-scale bg-gradient-to-r from-[#9B59B6]/25 via-[#7A3F94]/25 to-[#1ABC9C]/15 border-y border-white/5 py-10">
          <div className="max-w-[1400px] mx-auto px-5 sm:px-8">
            <h3 className="text-xl sm:text-2xl font-semibold leading-snug max-w-2xl">
              Development, Production, Post-production
              <br className="hidden sm:block" />
              choose whatever feels right to you
            </h3>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
          {/* Filter tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div className="flex flex-wrap items-center gap-2">
              {stageTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStageFilter(tab.value)}
                  className={`text-xs px-4 py-2 rounded-full border transition-colors ${
                    stageFilter === tab.value
                      ? "bg-[#D81B60] border-[#D81B60] text-white"
                      : "border-white/15 text-gray-400 hover:text-white hover:border-white/30"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {FORM_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFormFilter(tab.value)}
                  className={`text-xs px-4 py-2 rounded-full border transition-colors ${
                    formFilter === tab.value
                      ? "bg-white/10 border-white/30 text-white"
                      : "border-white/15 text-gray-400 hover:text-white hover:border-white/30"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Film grid */}
          {filtered.length === 0 ? (
            <p className="text-gray-500 text-sm py-10 text-center">No films match these filters yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-12">
              {filtered.map((film, i) => {
                const stage = STAGE_LABELS[film.stage];
                return (
                  <div key={film.slug} className={`reveal-scale stagger-${Math.min(i + 1, 5)} group`}>
                    <Link href={`/film/${film.slug}`} className="block">
                      <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-4">
                        <img
                          src={film.posterUrl || film.thumbnailUrl}
                          alt={film.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#D81B60]/90 text-white font-medium">
                            {film.credits.form === "documentary" ? "Documentary" : "Fiction"}
                          </span>
                          <span className={`text-[10px] px-2.5 py-1 rounded-full backdrop-blur-sm ${stage?.color}`}>
                            {stage?.label}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <p className="text-xs text-gray-500">{film.credits.year}</p>
                    <Link href={`/film/${film.slug}`}>
                      <h3 className="text-lg font-semibold text-white mt-1 group-hover:text-gray-200 transition-colors">
                        {film.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{film.logline}</p>
                    <p className="text-xs text-gray-600 mt-2">Directed by {film.credits.direction}</p>
                    <div className="flex items-center gap-3 mt-3">
                      {film.trailerUrl && (
                        <a
                          href={film.trailerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs border border-white/15 rounded-full px-3.5 py-1.5 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          Watch trailer ▶
                        </a>
                      )}
                      <Link href={`/film/${film.slug}`} className="text-xs text-gray-500 hover:text-white transition-colors">
                        Know more
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <SupportCTA />
      <Footer />
    </main>
  );
}
