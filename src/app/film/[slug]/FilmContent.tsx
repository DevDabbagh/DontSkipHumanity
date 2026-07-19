"use client";

import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import InternalNav from "@/components/InternalNav";
import Footer from "@/components/Footer";
import type { Film } from "@/lib/types";

const STAGE_LABELS: Record<string, { label: string; color: string }> = {
  development: { label: "Development", color: "bg-indigo-500/20 text-indigo-300" },
  production: { label: "Production", color: "bg-amber-500/20 text-amber-300" },
  post_production: { label: "Post-production", color: "bg-orange-500/20 text-orange-300" },
  festivals: { label: "Festivals", color: "bg-[#9B59B6]/20 text-[#c084fc]" },
  distribution: { label: "Distribution", color: "bg-[#1ABC9C]/20 text-[#1ABC9C]" },
  impact: { label: "Impact", color: "bg-emerald-500/20 text-emerald-300" },
};

export default function FilmContent({ film, relatedFilms }: { film: Film; relatedFilms: Film[] }) {
  const sectionRef = useReveal();
  const stage = STAGE_LABELS[film.stage] ?? { label: film.stage, color: "bg-white/10 text-gray-300" };

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white">
      <InternalNav section={film.title} backLabel="Films" backHref="/films" />

      {/* Cinematic hero banner */}
      <section className="relative pt-14">
        <div className="relative h-[55vh] sm:h-[65vh] lg:h-[75vh] overflow-hidden">
          <img
            src={film.posterUrl || film.thumbnailUrl}
            alt={film.title}
            className="absolute inset-0 w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D]/70 via-transparent to-transparent" />

          {/* Hero content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16">
            <div className="max-w-[1400px] mx-auto">
              <div className="flex items-center gap-3 mb-5">
                <span className={`text-xs px-3 py-1.5 rounded-full ${stage.color} backdrop-blur-sm`}>
                  {stage.label}
                </span>
                <span className="text-xs text-gray-300/80 backdrop-blur-sm bg-white/5 px-3 py-1.5 rounded-full">
                  {film.credits.form === "documentary" ? "Documentary" : "Fiction"} · {film.credits.format === "feature" ? "Feature" : film.credits.format === "short" ? "Short" : "Series"}
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] max-w-4xl tracking-tight">
                {film.title}
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 mt-5 max-w-2xl leading-relaxed">
                {film.logline}
              </p>
              <div className="flex items-center gap-4 mt-8">
                {film.trailerUrl && (
                  <a
                    href={film.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gradient-fill-btn px-7 py-3.5 rounded-xl text-sm font-medium flex items-center gap-2.5 shadow-lg shadow-purple-500/10"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Watch Trailer
                  </a>
                )}
                {film.accessMode === "request_only" && (
                  <button className="gradient-border-btn px-7 py-3.5 rounded-xl text-sm font-medium text-white backdrop-blur-sm">
                    Request Screener
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8" ref={sectionRef}>
        {/* Credits bar */}
        <div className="reveal py-10 border-b border-white/5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8">
          {[
            { label: "Direction", value: film.credits.direction },
            { label: "Production", value: film.credits.production },
            ...(film.credits.coProduction ? [{ label: "Co-production", value: film.credits.coProduction }] : []),
            { label: "Year", value: film.credits.year },
            { label: "Duration", value: film.credits.duration },
            { label: "Language", value: film.credits.language },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-1.5">{item.label}</p>
              <p className="text-sm text-white font-medium">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Synopsis + Editorial context */}
        <div className="reveal py-14 sm:py-20 grid md:grid-cols-2 gap-12 md:gap-20">
          <div>
            <h2 className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-5">Synopsis</h2>
            <p className="text-gray-300 leading-[1.8] text-[15px]">{film.synopsisLong}</p>
          </div>
          <div>
            <h2 className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-5">Editorial Context</h2>
            <p className="text-gray-400 leading-[1.8] text-[15px]">{film.editorialContext}</p>
            <div className="flex flex-wrap gap-2 mt-8">
              {film.themes.map((theme) => (
                <span key={theme} className="text-xs px-4 py-1.5 rounded-full bg-white/[0.04] text-gray-400 border border-white/[0.06] hover:border-white/10 transition-colors">
                  {theme}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Press quotes */}
        {film.pressQuotes.length > 0 && (
          <div className="reveal py-14 border-t border-white/5">
            <h2 className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-10">Press</h2>
            <div className="grid sm:grid-cols-2 gap-8">
              {film.pressQuotes.map((pq, i) => (
                <blockquote key={i} className="reveal stagger-1 relative pl-8 py-3">
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#9B59B6] to-[#1ABC9C] rounded-full" />
                  <p className="text-gray-200 italic leading-relaxed text-[15px]">&ldquo;{pq.quote}&rdquo;</p>
                  <cite className="text-sm text-[#9B59B6] not-italic mt-3 block font-medium">— {pq.source}</cite>
                </blockquote>
              ))}
            </div>
          </div>
        )}

        {/* Festivals */}
        {film.festivals.length > 0 && (
          <div className="reveal py-14 border-t border-white/5">
            <h2 className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-10">Festivals & Awards</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
              {film.festivals.map((fest, i) => (
                <div key={i} className={`reveal stagger-${Math.min(i + 1, 5)} rounded-2xl bg-[#1A1A1A]/80 border border-white/[0.06] p-6 hover:border-white/10 transition-all duration-300 group`}>
                  <p className="text-white font-semibold group-hover:text-gray-100">{fest.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{fest.year}</p>
                  {fest.award && (
                    <div className="mt-4 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[10px]">🏆</div>
                      <p className="text-sm text-amber-300 font-medium">{fest.award}</p>
                    </div>
                  )}
                  {fest.selection && !fest.award && (
                    <p className="text-sm text-gray-400 mt-3 italic">{fest.selection}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Screenings timeline */}
        {film.screenings.length > 0 && (
          <div className="reveal py-14 border-t border-white/5">
            <h2 className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-10">Screenings</h2>
            <div className="space-y-0">
              {film.screenings.map((screening, i) => (
                <div key={i} className={`reveal stagger-${Math.min(i + 1, 5)} py-5 border-t border-white/5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 group hover:bg-white/[0.01] -mx-5 sm:-mx-8 px-5 sm:px-8 transition-colors`}>
                  <span className="text-sm text-gray-500 shrink-0 w-28 font-mono">
                    {new Date(screening.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-gray-400 capitalize shrink-0 tracking-wider uppercase">
                    {screening.type}
                  </span>
                  <span className="text-white flex-1 text-sm">{screening.event}</span>
                  <span className="text-sm text-gray-500">{screening.location}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related films */}
        {relatedFilms.length > 0 && (
          <div className="reveal py-16 sm:py-20 border-t border-white/5">
            <h2 className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-10">Related Films</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedFilms.map((rf) => (
                <Link
                  key={rf.slug}
                  href={`/film/${rf.slug}`}
                  className="reveal-scale group cursor-pointer"
                >
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4">
                    <img
                      src={rf.thumbnailUrl}
                      alt={rf.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <p className="text-xs text-[#9B59B6]">
                    {rf.credits.form === "documentary" ? "Documentary" : "Fiction"} · {rf.credits.year}
                  </p>
                  <h3 className="text-white font-semibold mt-1.5 group-hover:text-gray-200 transition-colors text-lg">
                    {rf.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{rf.logline}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Support CTA */}
        <div className="reveal py-20 border-t border-white/5 text-center">
          <p className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-4">Support</p>
          <h2 className="text-3xl sm:text-4xl font-bold">Help us make more work like this.</h2>
          <p className="text-gray-400 mt-4 max-w-lg mx-auto leading-relaxed">
            Independent political film doesn&apos;t pay for itself. Your support keeps the work free of editorial strings.
          </p>
          <div className="flex items-center justify-center gap-4 mt-10">
            <Link href="/#support" className="gradient-fill-btn px-7 py-3.5 rounded-xl text-sm font-medium shadow-lg shadow-purple-500/10">
              Support the work
            </Link>
            <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
              Back to home
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
