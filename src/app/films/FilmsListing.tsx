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

export default function FilmsListing({ films }: { films: Film[] }) {
  const sectionRef = useReveal();
  const featured = films.find((f) => f.isFeatured);
  const rest = films.filter((f) => f.id !== featured?.id);

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white">
      <InternalNav section="Films" />

      {/* Hero */}
      <section className="pt-14">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-16 sm:pt-20 pb-10">
          <p className="text-[10px] tracking-[0.3em] text-gray-500 uppercase mb-4">Films & Studio</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.15] tracking-tight max-w-3xl">
            Documentary and fiction that stay close
            <span className="gradient-text"> and refuse erasure.</span>
          </h1>
          <p className="text-gray-400 mt-5 max-w-2xl leading-relaxed">
            Each film exists within a political context we make visible — festivals, screenings, distribution, and the editorial framing that connects story to structure.
          </p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-5 sm:px-8" ref={sectionRef}>
        {/* Featured film */}
        {featured && (
          <Link href={`/film/${featured.slug}`} className="reveal block group mb-16">
            <div className="relative aspect-[21/9] rounded-2xl overflow-hidden">
              <img
                src={featured.posterUrl || featured.thumbnailUrl}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/80 backdrop-blur-sm">Featured</span>
                  <span className={`text-xs px-3 py-1 rounded-full ${STAGE_LABELS[featured.stage]?.color}`}>
                    {STAGE_LABELS[featured.stage]?.label}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">{featured.title}</h2>
                <p className="text-gray-300 mt-2 max-w-xl line-clamp-2">{featured.logline}</p>
              </div>
            </div>
          </Link>
        )}

        {/* Film grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7 pb-20">
          {rest.map((film, i) => {
            const stage = STAGE_LABELS[film.stage];
            return (
              <Link
                key={film.slug}
                href={`/film/${film.slug}`}
                className={`reveal-scale stagger-${Math.min(i + 1, 5)} group`}
              >
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4">
                  <img
                    src={film.thumbnailUrl}
                    alt={film.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 left-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${stage?.color} backdrop-blur-sm`}>
                      {stage?.label}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#9B59B6]">
                  {film.credits.form === "documentary" ? "Documentary" : "Fiction"} · {film.credits.format === "feature" ? "Feature" : "Short"} · {film.credits.year}
                </p>
                <h3 className="text-lg font-semibold text-white mt-1.5 group-hover:text-gray-200 transition-colors">{film.title}</h3>
                <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{film.logline}</p>
                <p className="text-xs text-gray-600 mt-2">Dir. {film.credits.direction}</p>
              </Link>
            );
          })}
        </div>
      </div>

      <Footer />
    </main>
  );
}
